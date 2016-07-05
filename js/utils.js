define({
  hitTestRectangle: function (r1, r2) {
  "use strict";
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
},
  
 distSqr : function(x1,y1,x2,y2) {
    var x = x1-x2;
    var y = y1-y2;
    return  x*x + y*y;
  },
  
  vecLenSqr : function(vec) {
    var x = vec[Object.getOwnPropertyNames(vec)[0]];
    var y = vec[Object.getOwnPropertyNames(vec)[1]];
    return x*x + y*y;
  },
  
  extend : function(parent, childConstructor) {
    childConstructor.prototype = Object.create(parent.prototype);
    childConstructor.prototype.constructor = childConstructor;
// this seems not to work correctly    childConstructor.prototype.super = parent.prototype;
    return childConstructor;
  },
  
  updateFunction : function(dt) {
    this.children.forEach(function(child) {
      if(child["update"]) {
        child.update(dt);
      }
    })
    return this;
  }
  
});
