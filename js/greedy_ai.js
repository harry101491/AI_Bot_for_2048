function greedyAI(grid) {
  this.grid = grid;
}

var possibleMves = [0,1,2,3];

greedyAI.prototype.evaluateGrid = function(){
    var emptyCells = this.grid.availableCells().length;

  var smoothnessWeight = 0.1,
      monotonicityWeight  = 1.0,
      emptyCellsWeight  = 2.7,
      maxTileWeight    = 1.0;

  return this.grid.smoothness() * smoothnessWeight
       + this.grid.monotonicity2() * monotonicityWeight
       + Math.log(emptyCells) * emptyCellsWeight
       + this.grid.maxValue() * maxTileWeight;
}

greedyAI.prototype.getMove = function(){
    return this.getGreedyMove();
}

greedyAI.prototype.getGreedyMove = function() {
    var maxScore = Number.NEGATIVE_INFINITY;
    var nextMove = -1;
    
    var gameGrid = this.grid.clone();
    for(var i in possibleMoves){
        var currentDir = possibleMoves[i];
        
        var cloneGrid = gameGrid.clone();
        
        if(cloneGrid.move(currentDir).moved){
            if(cloneGrid.isWin()){
                return currentDir;
            }
            
            var newAI = new greedyAI(cloneGrid);  
            var currentScore = newAI.evaluateGrid();
            console.log("Dir "+currentDir+": "+currentScore);
            if(currentScore > maxScore){
                maxScore = currentScore;
                nextMove = currentDir;
            }
        }
    }
    console.log("Returning: "+nextMove);
    console.log("-----------------------");
    return nextMove;
}

