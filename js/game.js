requirejs(["jquery","PIXI", "utils"], function ($,PIXI,utils) {
  "use strict";
    
  console.log("start", utils);
  var windowWidth = $(window).width();
  var windowHeight = $(window).height();
  
  var GameObject = utils.extend(PIXI.Container, function(parent) {
    PIXI.Container.call(this);
  });
  GameObject.prototype.update =  utils.updateFunction;
  
  var GameMain = utils.extend(GameObject, function() {
    GameObject.call(this);
  });
  GameMain.prototype.checkInvadersHit = function() {
    if(!this.invaders) return;
    this.invaders.checkHit(this.defender.getShoots.bind(this.defender));
  };
  GameMain.prototype.addInvaders = function(invaders) {
    this.invaders = invaders;
    this.addChild(invaders);
  };
  GameMain.prototype.addDefender = function(defender) {
    this.defender = defender;
    this.addChild(defender);
  };
  GameMain.prototype.update = function(dt) {
    this.super.update.call(this,dt);
    this.checkInvadersHit();
  }
  
  var Rect = utils.extend(PIXI.Graphics, function(parent,x,y, width, height, color) {
    PIXI.Graphics.call(this);
    this.lineStyle(0)
        .beginFill(color)
        .drawRect(0,0,width, height)
        .endFill();
    this.cacheAsBitmap = true;
    this.position.x = x;
    this.position.y = y;
  });
  Rect.prototype.update = utils.updateFunction;

  var Shoot = utils.extend(Rect, function(parent) {
    Rect.call(this, parent, 0, 0, 5, 10, 0x00FF00);
    this.velocity = {dx:0, dy:-4};
    this.renderable = false;
  });
  Shoot.prototype.update = function(dt) {
      this.super.update.call(this,dt);
      if(!this.renderable) return;
      this.position.y += this.velocity.dy;
      if(this.position.y + this.height < 0) {
        this.renderable = false;
      }
  };
  
  
  var Defender = utils.extend(Rect, function(parent, x,y,width,heigth,color){
    Rect.call(this, parent, x,y, width, heigth, color);
    this.shootPool = new GameObject(parent);
    parent.addChild(this.shootPool);
    this.velocity = {dx:0, dy:0};
    this.friction = {x:0.9, y:0};
  });
  Defender.prototype.update = function(dt) {
        this.super.update.call(this,dt);
      // when simulation scatters then use dt and verlet integration
        this.position.x +=  this.velocity.dx;
        this.position.y +=  this.velocity.dy;
        this.velocity.dx *= this.friction.x;
  };
  Defender.prototype.moveLeft = function() { 
      this.velocity.dx -= 5;
  };
  Defender.prototype.moveRight = function() {
      this.velocity.dx += 5;
  };
  Defender.prototype.shoot = function() {
      var freeShoot = this.shootPool.children.find( function(shoot) {
        return !shoot.renderable;  
      });
      if(!freeShoot) {
        console.log("no free shoot", this.shootPool.children.length);
        freeShoot = new Shoot(this.shootPool);
        this.shootPool.addChild(freeShoot);
      } else {
        console.log("reusing free shoot");
      }
      freeShoot.position.x = this.position.x + this.width/2;
      freeShoot.position.y = this.position.y + this.height*0.1;
      freeShoot.renderable = true;
  };
  Defender.prototype.getShoots = function() {
    if(!this.shootPool) return [];
    return this.shootPool.children.reduce( function(acc, shoot) {
      if(shoot.renderable) {
        acc.push(shoot);
      } 
      return acc;
    }, []);
  };
  
  var Invaders = utils.extend(GameObject, function(parent, x,y, w,h,numx, numy) {
    GameObject.call(this, parent); 
    this.velocity = {dx:2, dy:0};
    this.friction = {x:0.9, y:0};
    var blockWidth = w;
    var blockHeight = h;
    var yGap = 4;
    var xGap = 20;
    this.invaders = new GameObject();
    parent.addChild(this.invaders);
    this.invaders.position.x = x;
    this.invaders.position.y = y;
    for(var k=0; k<numy; k++) {
      for(var i=0; i<numx; i++) {
        this.invaders.addChild(new Rect(this.invaders, i*(blockWidth+xGap),k*(blockHeight+yGap), blockWidth, blockHeight, 0x0000FF));
      }
    }
  });
  Invaders.prototype.update = function(dt) {
    this.super.update.call(this,dt);
    if(!this.destX || !(
        !(Math.sign(this.velocity.dx) < 0 || this.destX < this.invaders.position.x) ||
        !(Math.sign(this.velocity.dx) > 0 || this.destX > this.invaders.position.x))) { 
      // invaders reached destination position, conpute a new random one
      this.destX = Math.random() * $(window).width();
      var newVelocity = this.velocity.dx * Math.sign(this.destX - this.invaders.position.x); 
      this.velocity.dx = newVelocity === 0 ? -this.velocity.dx : newVelocity;
      this.invaders.position.y +=1;
    } else {
      this.invaders.position.x += this.velocity.dx;
    }
  };
  Invaders.prototype.checkHit = function(fnGetShoots) {
    if(!fnGetShoots) return;
    var shoots = fnGetShoots();
    var numLivingInvaders = this.invaders.children.length;
    // mark hit invaders
    shoots
      .filter(function(shoot) {
                // find shoots which hit the fleet
                if(shoot.renderable) {
                  return utils.hitTestRectangle(shoot, this.invaders); 
                } else {
                  return false;
                }
              }.bind(this))
      .forEach(function(shoot) {
                // find all invaders in fleet that are hit
                 this.invaders.children.forEach( function(invader) {
                   // GoOnHere invader is in wrong coord system
                   var hit = invader.renderable && utils.hitTestRectangle(shoot, invader); 
                   if(hit) {
                     invader.renderable = false;
                     shoot.renderable = false;
                   }
                   // count survivig invadors
                   if(!invader.renderable) numLivingInvaders--;
                 })
               }.bind(this))
  }

  var stage = new GameMain();
  var invaders = new Invaders(stage, 10, 10, 40, 20, 4,3);
  var defender = new Defender(stage, (windowWidth-40)/2,windowHeight-40,40,20,0xFF0000);
  stage.addDefender(defender);
  stage.addInvaders(invaders);
  
  // TODO
  // 3. invaders should be able to shoot
  // 2. when invades hit defender game over
  // 5. when invader shoot hit defender show game over
  // 6. when last invader killed show Won
  
  // input
  //$(document).keydown(function(event){
  // vim like left=h right=l, space to shoot
  var keyActions = {
    72: defender.moveLeft.bind(defender),
    76: defender.moveRight.bind(defender),
    32: defender.shoot.bind(defender)
  };
  document.onkeydown = function(event) {
    var event   = event || window.event;
    var action = keyActions[event.keyCode];
    if( action ) {
      action();
      event.preventDefault();
    }
  };
  
  // initialize renderer
  var renderer = new PIXI.autoDetectRenderer(windowWidth,windowHeight,{transparent:true, antialias: true });
  var resize = function() {
    renderer.resize($(window).width(), $(window).height()); 
  }
  window.onresize = resize;
  
  $("body").append(renderer.view);


  // test
  defender.shoot();
  defender.moveRight();
  var cout = 1;
  
  // game loop
  var animate = function() {
    requestAnimationFrame(animate);
    stage.update();
    renderer.render(stage);
    
    //test
    if(cout++ % 10 === 0) defender.shoot();
  };
  requestAnimationFrame(animate);
});