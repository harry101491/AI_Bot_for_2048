var agent = "";

// Changes Q
var StateManager = {
	previousMove: false,
	maxVal: 0,
	scores: [],
	lowestScore: false,
	medianScore: false,
	meanScore: false,
	highestScore: false,
	gamesPlayed: false,
};
// Change End

function GameManager(size, InputManager, Actuator) {
  this.size         = size; // Size of the grid
  this.inputManager = new InputManager;
  this.actuator     = new Actuator;

  this.running      = false;

  this.inputManager.on("move", this.move.bind(this));
  this.inputManager.on("restart", this.restart.bind(this));
    
  agent = "Expectimax";
    
  this.inputManager.on('Random', function(){
    agent = "Random";
    this.ai = new randomAI(this.grid);
    console.log("Agent selected: Random");
  }.bind(this));
  
  this.inputManager.on('Greedy', function(){
    agent = "Greedy";
    this.ai = new greedyAI(this.grid);
    console.log("Agent selected: Greedy");
  }.bind(this));
    
  this.inputManager.on('Expectimax', function(){
    agent = "Expectimax";
    this.ai = new expectimaxAI(this.grid);
    console.log("Agent selected: Expectimax");
  }.bind(this));
    
  this.inputManager.on('MonteCarlo Tree Search', function(){
    agent = "MonteCarlo Tree Search";
    this.ai = new MonteCarloAI(this.grid);
    console.log("Agent selected: MonteCarlo Tree Search");
  }.bind(this));
    
  this.inputManager.on('Q Learning', function(){
    agent = "Q Learning";
    this.ai = new qlearningAI();
    console.log("Agent selected: Q Learning");
  }.bind(this));
  
  this.inputManager.on('run', function() {
    if (this.running) {
      this.running = false;
      this.actuator.setRunButton('Auto-run');
    } else {
      this.running = true;
      this.run()
      this.actuator.setRunButton('Stop');
    }
  }.bind(this));

  this.setup();
}

// Restart the game
GameManager.prototype.restart = function () {
  this.actuator.restart();
  this.running = false;
  this.actuator.setRunButton('Auto-run');
  this.setup();
};

// Set up the game
GameManager.prototype.setup = function () {
  this.grid         = new Grid(this.size);
  this.grid.addStartTiles();

  if(agent==="Random"){
    this.ai = new randomAI(this.grid);      
  }
  else if(agent==="Greedy"){
    this.ai = new greedyAI(this.grid);
  }
  else if(agent==="Expectimax"){
    this.ai = new expectimaxAI(this.grid);
  }
  else if(agent==="MonteCarlo Tree Search"){
    this.ai = new MonteCarloAI(this.grid);
  }
  // Changes Q Learning
  else if(agent==="Q Learning"){
    this.ai = new qlearningAI();
  } 
  // Changes End

  this.score        = 0;
  this.over         = false;
  this.won          = false;

  // Update the actuator
  this.actuate();
};

// Sends the updated grid to the actuator
GameManager.prototype.actuate = function () {
  this.actuator.actuate(this.grid, {
    score: this.score,
    over:  this.over,
    won:   this.won
  });
    
  // Changes Q Learning
  if(agent === "Q Learning"){
      if(this.over){
          this.logResults();
      }
  }
  // Changes End
};

// Changes Q Learning
function getMedian(values) {
	var val = values.slice(); 
	val.sort( function(a,b) {return a - b;} );
    var half = Math.floor(val.length/2);

    if(val.length % 2)
        return val[half];
    else
        return (val[half-1] + val[half]) / 2.0;
}

GameManager.prototype.logResults = function() {
	var GM = this;

	StateManager.scores.push( this.score );

	if( StateManager.lowestScore === false || StateManager.lowestScore > this.score )
		StateManager.lowestScore = this.score;

	if( StateManager.highestScore === false || StateManager.highestScore < this.score )
		StateManager.highestScore = this.score;

	if( StateManager.scores.length == 1 ){
		StateManager.medianScore = this.score;
		StateManager.meanScore = this.score;
	}else{
	
		var sum = 0;
		StateManager.medianScore = getMedian(StateManager.scores);
		for( score in StateManager.scores ){
			sum += StateManager.scores[ score ];
		}
		console.log( sum );
		StateManager.meanScore = sum / StateManager.scores.length;
		StateManager.gamesPlayed = StateManager.scores.length;
	}
	
	if(!this.win){
		setTimeout( function() {
			GM.actuator.restart();
			GM.setup();
			document.getElementById("run-button").click();
			document.getElementById("run-button").click();
		}, 1000 );
	}

};
// Changes End

// makes a given move and updates state
GameManager.prototype.move = function(direction) {
  var result = this.grid.move(direction);
  this.score += result.score;

  if (!result.won) {
    if (result.moved) {
      this.grid.computerMove();
    }
  } else {
    this.won = true;
  }

  if (!this.grid.movesAvailable()) {
    this.over = true; // Game over!
  }
  this.actuate();
  return result;
}

// moves continuously until game is over
GameManager.prototype.run = function() {
    
  //Changes Q Learning 
  if(agent === "Q Learning"){
      var best = this.ai.getMove(this.grid, {
		score: this.score,
		moved: ( ( StateManager.previousMove ) ? StateManager.previousMove.moved : false ),
		timesMoved: this.timesMoved
      });
	this.previousScore = this.score;
	StateManager.previousMove = this.move(best.move);
	this.timesMoved++;
	this.ai.reward({
			score: this.score,
			previous: this.previousScore,
			won: this.won,
			over: this.over,
			timesMoved: this.timesMoved,
			empty: this.ai.getEmptyCount()
		});
  }
  //Changes End
    else{
        var nextMove = this.ai.getMove();
        this.move(nextMove);      
    }

  var timeout = animationDelay;
  if (this.running && !this.over && !this.won) {
    var self = this;
    setTimeout(function(){
      self.run();
    }, timeout);
  }
}
