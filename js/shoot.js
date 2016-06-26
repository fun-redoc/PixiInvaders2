define(["PIXI", "utils", "Rect"], function(PIXI,utils,Rect) {
  "use strict";
  
   var Shoot = utils.extend(Rect, function(parent, x,y, w,h,color) {
    // defaults
    if(!x) x = 0;
    if(!y) y = 0;
    if(!w) w = 5;
    if(!h) h = 10;
    if(!color) color = 0x00FF00;
    Rect.call(this, parent, x, y, w, h, color);
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