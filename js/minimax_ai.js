var moveMapping = {
    0 : 'up',
    1 : 'right',
    2 : 'down',
    3 : 'left'
}
var possibleMoves = [0,1,2,3];

function minimaxAI(grid){
    this.grid = grid;
}

minimaxAI.prototype.evaluateGrid = function(){
    var emptyCells = this.grid.availableCells().length;

  var smoothWeight = 0.1,
      mono2Weight  = 1.0,
      emptyWeight  = 2.7,
      maxWeight    = 1.0;

  return this.grid.smoothness() * smoothWeight
       + this.grid.monotonicity2() * mono2Weight
       + Math.log(emptyCells) * emptyWeight
       + this.grid.maxValue() * maxWeight;
};


minimaxAI.prototype.getMove = function(){
    return this.iterativeDeep();
}

minimaxAI.prototype.iterativeDeep = function(){
    
    var bestScore;
    var bestMove;
    var result;
    
    var startTime = new Date().getTime();
    var depth = 0,
        alpha = -10000,
        beta = 10000;
    
    do{
        var newResult = this.getNextMove(alpha, beta, depth);
        if(newResult.move == -1){
            break;
        }
        else{
            bestMove = newResult.move;
        }
        depth++;
    }while((new Date()).getTime() - startTime < minSearchTime);
    
    return bestMove;
}

minimaxAI.prototype.getNextMove = function(alpha, beta, depth){
    var result;
    var maxScore;
    var nextMove;
    
    //Maximizer - AI Player
    if (this.grid.playerTurn){
        maxScore = alpha;
        for(var direction in possibleMoves){
            var newGrid = this.grid.clone();
            if (newGrid.move(direction).moved) {
                if (newGrid.isWin()) {
                    return { move: direction, score: 10000};
                }
                
                var newAI = new minimaxAI(newGrid);

                if(depth == 0){
                    result = { move: direction, score: newAI.evaluateGrid() };
                }
                else{
                    result = newAI.getNextMove(maxScore, beta, depth-1);
                }

                if (result.score > maxScore) {
                    maxScore = result.score;
                    nextMove = direction;
                }
                if (maxScore > beta) {
                    return { move: nextMove, score: beta};
                }
            }
        }
    }
    
    //Minimizer - Computer to put new tiles in worst possible places
    else{
        maxScore = beta;
        
        var availableCells = this.grid.availableCells();
        var scoreMapping = {2 : [], 4 : []};
        var newEntries = [];
        
        for(var value in scoreMapping){
            for(var index in availableCells){
                scoreMapping[value].push(null);
                
                var newCell = availableCells[index];
                var newTile = new Tile(newCell, parseInt(value, 10));
                this.grid.insertTile(newTile);
                
                scoreMapping[value][index] = -this.grid.smoothness() + this.grid.islands();

                this.grid.removeTile(newTile);
            }
        }
        
        
        var worstScore = Math.max(Math.max.apply(null, scoreMapping[2]), Math.max.apply(null, scoreMapping[4]));
        for(var value in scoreMapping){
            for(var index = 0; index < scoreMapping[value].length; index++){
                if(scoreMapping[value][index] == worstScore){
                    newEntries.push({position: availableCells[index], value: parseInt(value, 10)});
                }
            }
        }
        
        
        for(var i = 0; i < newEntries.length; i++){
            
            var newPosition = newEntries[i].position;
            var val = newEntries[i].value;
            
            var newTile = new Tile(newPosition, val);
            var tempState = this.grid.clone();
            
            tempState.insertTile(newTile);
            tempState.playerTurn = true;
            
            newMiniMax = new minimaxAI(tempState);
            result = newMiniMax.getNextMove(alpha, maxScore, depth);
            
            if(result.score < maxScore){
                maxScore = result.score;
            }
            if(maxScore < alpha){
                return {move: null, score: alpha};
            }
        }   
    }
    return {move: nextMove, score: maxScore};
}
