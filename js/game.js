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
  
  var GameOver = utils.extend(GameObject, function(text) {
    GameObject.call(this);
    
    var text = new PIXI.Text(text,{font : '32px Arial', fill : 0xcc10dd, align : 'center'});
    this.addChild(text);
    this.startNewGame = false;
    
    var keyActions = {
      //72: defender.moveLeft.bind(defender),
    };  
    document.onkeydown = function(event) {
      this.startNewGame = true; 
      event.preventDefault();
    }.bind(this);
  });
  GameOver.prototype.update = function(dt) {
    // no need to call super for standard behavoior since only static text chown
    return this.startNewGame ? new GameLevel1() : this; // maybe regenerating old GameMain is more GC friendly
  }
  
  
  var GameMain = utils.extend(GameObject, function() {
    GameObject.call(this);
    var invaders = new Invaders(this, 10, 10, 40, 20, 4,3);
    var defender = new Defender(this, (windowWidth-40)/2,windowHeight-40,40,20,0xFF0000);
    this.addDefender(defender);
    this.addInvaders(invaders);


// input
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
  GameMain.prototype.addInvaders = function(invaders) {
    this.invaders = invaders;
    this.addChild(invaders);
  };
  GameMain.prototype.addDefender = function(defender) {
    this.defender = defender;
    this.addChild(defender);
  };
  GameMain.prototype.update = function(dt) {
    // results in an endless loop this.super.update.call(this,dt);
    GameObject.prototype.update.call(this,dt);
    return this.invaders.checkIfHitObject(this.defender, 
      function() { // when hit
        return new GameOver('Game Over,\n press any button to restart.');
      }.bind(this),
      function() { // when not hit
        return this.invaders.checkIfHitByDefendersShoots(this.defender.getShoots(),
                                                         function() { // all invaders shot
                                                          return new GameOver("You won this battle, \n press any key to restart");
                                                         }.bind(this),
                                                         function() { // some invaders remain
                                                          return this;
                                                         }.bind(this));
      }.bind(this));
  };

  var GameLevel1 = utils.extend(GameMain, function() {
    GameMain.call(this);
    var text = new PIXI.Text("Level1",{font : '32px Arial', fill : 0xcc10dd, align : 'center'});
    this.addChild(text);
  });
  var GameLevel2 = utils.extend(GameMain, function() {
    GameMain.call(this);
    var text = new PIXI.Text("Level2",{font : '32px Arial', fill : 0xcc10dd, align : 'center'});
    this.addChild(text);
  });

  // initialize renderer
  var renderer = new PIXI.autoDetectRenderer(windowWidth,windowHeight,{transparent:true, antialias: true });
  var resize = function() {
    renderer.resize($(window).width(), $(window).height());
  }
  window.onresize = resize;

  $("body").append(renderer.view);

  var stage = new GameLevel1();
  // game loop
  var animate = function(currentStage) {
    var newStage = currentStage.update();
    renderer.render(currentStage);
    requestAnimationFrame(animate.bind(null, newStage));
  };
  requestAnimationFrame(animate.bind(null, stage));
});
