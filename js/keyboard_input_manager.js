function KeyboardInputManager() {
  this.events = {};

  this.listen();
}

KeyboardInputManager.prototype.on = function (event, callback) {
  if (!this.events[event]) {
    this.events[event] = [];
  }
  this.events[event].push(callback);
};

KeyboardInputManager.prototype.emit = function (event, data) {
  var callbacks = this.events[event];
  if (callbacks) {
    callbacks.forEach(function (callback) {
      callback(data);
    });
  }
};

KeyboardInputManager.prototype.listen = function () {
  var self = this;

  var map = {
    38: 0, // Up
    39: 1, // Right
    40: 2, // Down
    37: 3, // Left
    75: 0, // vim keybindings
    76: 1,
    74: 2,
    72: 3
  };

  document.addEventListener("keydown", function (event) {
    var modifiers = event.altKey || event.ctrlKey || event.metaKey ||
                    event.shiftKey;
    var mapped    = map[event.which];

    if (!modifiers) {
      if (mapped !== undefined) {
        event.preventDefault();
        self.emit("move", mapped);
      }

      if (event.which === 32) self.restart.bind(self)(event);
    }
  });

  var radios = document.querySelectorAll(".valueRadio");
  radios.forEach(function(radio) {
    radio.addEventListener('click', function(e) {
      document.querySelector('#input').value = e.target.value;
    });
  });

  var gameStarted = false;

  var cells = document.querySelectorAll(".grid-cell");
  cells.forEach(function(cell) {
    cell.addEventListener('click', function(e) {
      e.preventDefault();
      var coords = e.target.id.split(',');
      var value = parseInt(document.querySelector('#input').value, 10);
      window.addTile(parseInt(coords[0], 10), parseInt(coords[1], 10), value, gameStarted);
    })
  });

  var startStopBtn = document.querySelector("#startStopBtn");
  startStopBtn.addEventListener('click', function(e) {
    if (gameStarted) {
      gameStarted = false;
      e.target.innerText = "Start Game";
    } else {
      gameStarted = true;
      if (grid.availableCells().length < 16) {
        var bestMove = window.manager.ai.getBest();
        window.manager.move(bestMove.move);
      }
      e.target.innerText = "Stop Game";
    }
  });

  // Listen to swipe events
  var gestures = [Hammer.DIRECTION_UP, Hammer.DIRECTION_RIGHT,
                  Hammer.DIRECTION_DOWN, Hammer.DIRECTION_LEFT];

  var gameContainer = document.getElementsByClassName("game-container")[0];
  var handler       = Hammer(gameContainer, {
    drag_block_horizontal: true,
    drag_block_vertical: true
  });

  handler.on("swipe", function (event) {
    event.gesture.preventDefault();
    mapped = gestures.indexOf(event.gesture.direction);

    if (mapped !== -1) self.emit("move", mapped);
  });
};

KeyboardInputManager.prototype.restart = function (event) {
  event.preventDefault();
  this.emit("restart");
};
