define(["PIXI", "utils"], function (PIXI, utils) {
  "use strict";
 
  var GameObject = utils.extend(PIXI.Container, function(parent) {
    PIXI.Container.call(this);
  });
  GameObject.prototype.update =  utils.updateFunction;
  
  return GameObject;
});