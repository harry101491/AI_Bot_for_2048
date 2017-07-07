function MonteCarloAI(grid) {
  this.grid = grid;
}

// all possible moves
var listPossibleMoves = [0,1,2,3];
MonteCarloAI.prototype.translate = function(move) {
 return {
    0: 'up',
    1: 'right',
    2: 'down',
    3: 'left'
  }[move];
}


MonteCarloAI.prototype.getMove = function() {
  	return this.monteCarloMove();
}

// some heuristics to make the effect more sutle and exploit the properties of the grid and other features
MonteCarloAI.prototype.evaluateGrid = function(){
    var emptyCells = this.grid.availableCells().length;

  var smoothnessWeight = 0.1,
      monotonicityWeight  = 0.9,
      emptyCellsWeight  = 2.6,
      maxTileWeight    = 1.0;

  return this.grid.smoothness() * smoothnessWeight
       + this.grid.monotonicity2() * monotonicityWeight
       + Math.log(emptyCells) * emptyCellsWeight
       + this.grid.maxValue() * maxTileWeight;
}


MonteCarloAI.prototype.reset = function(){
    this.grid = this.previousGrid;
}

getPossibleMoves = function(gridParam){
    
    var movesPossible = [];
    
    for(var i in listPossibleMoves){
        var copyGrid = gridParam.clone();
        var newAI = new MonteCarloAI(copyGrid);
        var isMoved = newAI.grid.move(i).moved;
        if(isMoved){movesPossible.push(i);}
    }
    return movesPossible;
}

// find the best move in the tree
MonteCarloAI.prototype.monteCarloMove = function(){
    gameGrid = this.grid;
    var allDirections = getPossibleMoves(gameGrid);
    console.log("Possible: "+allDirections);
    var scores = [0,0,0,0];
    var maxScore = Number.NEGATIVE_INFINITY;
    var bestDirection = -1;
    
    for(var currentDir in allDirections){
        var dir = allDirections[currentDir];
        
        var largestTile = gameGrid.maxValue();
        var numIterations = largestTile * 8;
        var iteration = 0;
        
        var cloneGrid = gameGrid.clone();
        
        while(iteration < numIterations){
            var newAI = new MonteCarloAI(cloneGrid);
            var currentScore = getScore(dir, newAI.grid);
            if(currentScore != -1){
                scores[dir] += currentScore;
            }
            iteration++;
        }
    }
    
    for(var i=0; i<scores.length; i++){
        if(isNaN(scores[i])){
            scores[i] = 0;
        }
        console.log("Sore for "+i+":  "+scores[i]);
        if(scores[i] != 0 && scores[i] > maxScore && allDirections[i] != -1){
            maxScore = scores[i];
            bestDirection = i;
        }
    }
    console.log("Returning "+bestDirection);
    return bestDirection;
}

getScore = function(direction, gameGrid){

    var cloneGrid = gameGrid.clone();
    var newAI = new MonteCarloAI(cloneGrid);
    
    var isMoved = newAI.grid.move(direction).moved;
    
    if(!isMoved){
        return -1;
    }
    
    var totalScore = 0;
    var depth = 10;
    while(newAI.grid.movesAvailable() && depth > 0){
        var randomDirection = Math.floor(Math.random()*4);
        newAI.grid.move(randomDirection);
        totalScore += newAI.evaluateGrid();
        depth--;
    }
    return totalScore;
}












