(function ($, window) {
  "use strict";
    
  console.log("start");
  var windowWidth = $(window).width();
  var windowHeight = $(window).height();
  
  function hitTestRectangle(r1, r2) {
    // taken form tutorlal 
    // https://github.com/kittykatattack/learningPixi#the-hittestrectangle-function

  //Define the variables we'll need to calculate
  var hit, combinedHalfWidths, combinedHalfHeights, vx, vy;

  //hit will determine whether there's a collision
  hit = false;
  var pos1 = r1.getGlobalPosition();
  var pos2 = r2.getGlobalPosition();

  //Find the center points of each sprite
  r1.centerX = pos1.x + r1.width / 2;
  r1.centerY = pos1.y + r1.height / 2;
  r2.centerX = pos2.x + r2.width / 2;
  r2.centerY = pos2.y + r2.height / 2;

  //Find the half-widths and half-heights of each sprite
  r1.halfWidth = r1.width / 2;
  r1.halfHeight = r1.height / 2;
  r2.halfWidth = r2.width / 2;
  r2.halfHeight = r2.height / 2;

  //Calculate the distance vector between the sprites
  vx = r1.centerX - r2.centerX;
  vy = r1.centerY - r2.centerY;

  //Figure out the combined half-widths and half-heights
  combinedHalfWidths = r1.halfWidth + r2.halfWidth;
  combinedHalfHeights = r1.halfHeight + r2.halfHeight;

  //Check for a collision on the x axis
  if (Math.abs(vx) < combinedHalfWidths) {

    //A collision might be occuring. Check for a collision on the y axis
    if (Math.abs(vy) < combinedHalfHeights) {

      //There's definitely a collision happening
      hit = true;
    } else {

      //There's no collision on the y axis
      hit = false;
    }
  } else {

    //There's no collision on the x axis
    hit = false;
  }

  //`hit` will be either `true` or `false`
  return hit;
};
  
  var distSqr = function(x1,y1,x2,y2) {
    var x = x1-x2;
    var y = y1-y2;
    return  x*x + y*y;
  };
  
  var vecLenSqr = function(vec) {
    var x = vec[Object.getOwnPropertyNames(vec)[0]];
    var y = vec[Object.getOwnPropertyNames(vec)[1]];
    return x*x + y*y;
  }
  
  var extend = function(parent, childConstructor) {
    childConstructor.prototype = Object.create(parent.prototype);
    childConstructor.prototype.constructor = childConstructor;
    childConstructor.prototype.super = parent.prototype;
    return childConstructor;
  };
  
  var updateFunction = function(dt) {
    this.children.forEach(function(child) {
      if(child["update"]) {
        child.update(dt);
      }
    })
  };
  
  var GameObject = extend(PIXI.Container, function(parent) {
    PIXI.Container.call(this);
    //if(parent) parent.addChild(this);
  });
  GameObject.prototype.update =  updateFunction;
  
  var GameMain = extend(GameObject, function() {
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
  
  var Rect = extend(PIXI.Graphics, function(parent,x,y, width, height, color) {
    PIXI.Graphics.call(this);
    this.lineStyle(0)
        .beginFill(color)
        .drawRect(0,0,width, height)
        .endFill();
    this.cacheAsBitmap = true;
    this.position.x = x;
    this.position.y = y;
    parent.addChild(this);
  });
  Rect.prototype.update = updateFunction;

  var Shoot = extend(Rect, function(parent) {
    Rect.call(this, parent, 0, 0, 5, 10, 0x00FF00);
    this.velocity = {dx:0, dy:-4};
    this.isActive = false;
    this.visible = false;
  });
  Shoot.prototype.update = function(dt) {
      this.super.update.call(this,dt);
      if(!this.isActive) return;
      this.position.y += this.velocity.dy;
      if(this.position.y + this.height < 0) {
        this.isActive = false;
        this.visible = false;
      }
  };
  
  
  var Defender = extend(Rect, function(parent, x,y,width,heigth,color){
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
        return !shoot.isActive;  
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
      freeShoot.isActive = true;
      freeShoot.visible = true;
  };
  Defender.prototype.getShoots = function() {
    if(!this.shootPool) return [];
    return this.shootPool.children.reduce( function(acc, shoot) {
      if(shoot.isActive) {
        acc.push(shoot);
      } 
      return acc;
    }, []);
  };
  
  var Invaders = extend(GameObject, function(parent, x,y, w,h,numx, numy) {
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
        new Rect(this.invaders, i*(blockWidth+xGap),k*(blockHeight+yGap), blockWidth, blockHeight, 0x0000FF);
      }
    }
  });
  Invaders.prototype.update = function(dt) {
    this.super.update.call(this,dt);
    if(!this.destX || !(
        !(Math.sign(this.velocity.dx) < 0 || this.destX < this.invaders.position.x) ||
        !(Math.sign(this.velocity.dx) > 0 || this.destX > this.invaders.position.x))) { 
      this.destX = Math.random() * $(window).width();
      var newVelocity = this.velocity.dx * Math.sign(this.destX - this.invaders.position.x); 
      this.velocity.dx = newVelocity === 0 ? -this.velocity.dx : newVelocity;
//      this.invaders.position.y +=1;
    } else {
      this.invaders.position.x += this.velocity.dx;
    }
  };
  Invaders.prototype.checkHit = function(fnGetShoots) {
    if(!fnGetShoots) return;
    var shoots = fnGetShoots();
    // GoOnHere
    // mark hit invaders
    shoots
      .filter(function(shoot) {
                // find shoots which hit the fleet
                return hitTestRectangle(shoot, this.invaders); 
              }.bind(this))
      .reduce(function(acc, shoot) {
                // find all invaders in fleet that are hit
                 return acc.concat(this.invaders.children.filter( function(invader) {
                   // GoOnHere invader is in wrong coord system
                   var hit = !invader.visible || invader.isHit || hitTestRectangle(shoot, invader); 
                   return hit;
                 }))
               }.bind(this),[])
       .map(function(invader) {
              // mark hit invaders
              console.log("hit me");
              invader.isHit = true;
              invader.visible = false;
            })
  }

  var stage = new GameMain();
  var invaders = new Invaders(stage, 10, 470, 40, 20, 4,3);
  var defender = new Defender(stage, (windowWidth-40)/2,windowHeight-40,40,20,0xFF0000);
  stage.addDefender(defender);
  stage.addInvaders(invaders);
  
  // TODO
  // 4. hit invaders should disappear
  // 2. when invades hit defender game over
  // 3. invaders should be able to shoot
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
    if(cout++ % 100 === 0) defender.shoot();
  };
  requestAnimationFrame(animate);
})(jQuery, this);