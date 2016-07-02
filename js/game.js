requirejs(["jquery","PIXI", 
           "utils", 
           "GameObject", "Rect", "Shoot", "Defender", "Invaders"], 
          function ($,PIXI,
                      utils,
                      GameObject, Rect, Shoot, Defender, Invaders) {
  "use strict";
    
  console.log("start", utils);
  var windowWidth = $(window).width();
  var windowHeight = $(window).height();
  
  var GameMain = utils.extend(GameObject, function() {
    GameObject.call(this);
    var invaders = new Invaders(this, 10, 10, 40, 20, 4,3);
    var defender = new Defender(this, (windowWidth-40)/2,windowHeight-40,40,20,0xFF0000);
    this.addDefender(defender);
    this.addInvaders(invaders);

// TODO
// 3. invaders should be able to shoot
// 2. when invades hit defender game over
// 4. when an invader hits defender game over 
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
     this.invaders.checkIfHitObject(this.defender, function() {
      var text = new PIXI.Text('Game Over,\n press any button to restart.',{font : '32px Arial', fill : 0xcc10dd, align : 'center'});
      this.addChild(text);
   }.bind(this));
  };


// initialize renderer
var renderer = new PIXI.autoDetectRenderer(windowWidth,windowHeight,{transparent:true, antialias: true });
var resize = function() {
  renderer.resize($(window).width(), $(window).height()); 
}
window.onresize = resize;

$("body").append(renderer.view);


// test
//defender.shoot();
//defender.moveRight();
var cout = 1;

var stage = new GameMain();
// game loop
var animate = function() {
  requestAnimationFrame(animate);
  stage.update();
  renderer.render(stage);
  
  //test
      if(cout++ % 100 === 0) defender.shoot();
};
requestAnimationFrame(animate);
});