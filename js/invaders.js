define(["jquery", "PIXI", "utils", "GameObject", "Rect", "Shoot"],
      function($,PIXI, utils, GameObject, Rect, Shoot) {
  "use strict";
  
 var Invaders = utils.extend(GameObject, function(parent, x,y, w,h,numx, numy) {
    GameObject.call(this, parent); 
    this.velocity = {dx:2, dy:0};
    //this.friction = {x:0.9, y:0};
    var blockWidth = w;
    var blockHeight = h;
    var yGap = 4;
    var xGap = 20;
    this.invaders = new GameObject();
    parent.addChild(this.invaders);
   
    this.shootPool = new GameObject(parent);
    parent.addChild(this.shootPool);
   
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
    this.maybeShoot();
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
  Invaders.prototype.maybeShoot = function() {
    var randomRange =50;
      if(typeof this.maybeShootCounter == "undefined") {
        this.maybeShootCounter = Math.random()*randomRange;
        return;
      }
      if(this.maybeShootCounter && this.maybeShootCounter > 0) {
        this.maybeShootCounter--;
        return;
      } 
      this.maybeShootCounter = Math.random()*randomRange;
      var freeShoot = this.shootPool.children.find( function(shoot) {
        return !shoot.renderable;  
      });
      if(!freeShoot) {
        //console.log("no free shoot", this.shootPool.children.length);
        freeShoot = new Shoot(this.shootPool, 0, 0, 8, 8, 0xDD4422);
        freeShoot.velocity.dy = +4;
        this.shootPool.addChild(freeShoot);
      } else {
        //console.log("reusing free shoot");
      }
      freeShoot.position.x = this.position.x + this.width/2;
      freeShoot.position.y = this.position.y + this.height*0.1;
      freeShoot.renderable = true;
  };
  Invaders.prototype.getShoots = function() {
    if(!this.shootPool) return [];
    return this.shootPool.children.reduce( function(acc, shoot) {
      if(shoot.renderable) {
        acc.push(shoot);
      } 
      return acc;
    }, []);
  };

  return Invaders;
});