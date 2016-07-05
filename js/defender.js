define(["PIXI", "utils", "GameObject", "Rect", "Shoot"],
      function(PIXI,utils,GameObject, Rect,Shoot) {
 "use strict";
  
 var Defender = utils.extend(Rect, function(parent, x,y,width,heigth,color){
    Rect.call(this, parent, x,y, width, heigth, color);
    this.shootPool = new GameObject(parent);
    parent.addChild(this.shootPool);
    this.velocity = {dx:0, dy:0};
    this.friction = {x:0.9, y:0};
  });
  Defender.prototype.update = function(dt) {
        //this.super.update.call(this,dt);
    Rect.prototype.update.call(this, dt);
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
        //console.log("no free shoot", this.shootPool.children.length);
        freeShoot = new Shoot(this.shootPool);
        this.shootPool.addChild(freeShoot);
      } else {
        //console.log("reusing free shoot");
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
  
  return Defender;
});
