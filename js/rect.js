define(["PIXI","utils"], function(PIXI,utils) {
  "use strict";
  
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
  
  return Rect;
});