requirejs.config({
    "baseUrl": "js",
    "paths": {
      "app": ".",
      "jquery": "https://cdnjs.cloudflare.com/ajax/libs/jquery/3.0.0/jquery.min",
      "PIXI": "https://cdnjs.cloudflare.com/ajax/libs/pixi.js/3.0.11/pixi.min"
    }
});

// Load the main game
requirejs(["game"]);