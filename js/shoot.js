define(["PIXI", "utils", "Rect"], function(PIXI,utils,Rect) {
  "use strict";
  
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
  
  return Shoot; 
});