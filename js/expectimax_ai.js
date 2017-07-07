// Map moves to integer values.
var moveMapping = {
    0 : 'up',
    1 : 'right',
    2 : 'down',
    3 : 'left'
}

// Set of possible moves.
var possibleMoves = [0,1,2,3];

// Initialization of agent.
function expectimaxAI(grid){
    this.grid = grid;
}

// Heuristic Function. 
// The heuristic function depends on multiple factors of the arrangement of tiles in the grid.
// 1. Smoothness: Calculates the pair difference between the tiles. A smooth grid would be tiles with immediate upper
// or lower value as adjacent tiles. For eg. 2 4 8 4 is smoother as compared to 64 2 32 8 since the difference between the pairs
// is  lower.
//
// 2. Monotonicity: Gradual increasing or decreasing tiles in rows or columns. For e.g. 4 4 8 16. Higher the monotonicity
// of the grid, the lesser number of moves it takes to merge them and get a higher tile.
//
// 3. Number of empty Cells: Lesser the number of tiles, more the flexibility in moving the tiles in all directions to get
// the desired result.
//
// 4. Highest Tile Value: Higher the tile, higher the reward, hence motivating the algorithm to choose moves that result in
// higher value tiles.

expectimaxAI.prototype.evaluateGrid = function(){
    var emptyCells = this.grid.availableCells().length;

  var smoothnessWeight = 0.1,
      monotonicityWeight  = 1.0,
      emptyCellsWeight  = 2.7,
      maxTileWeight    = 1.0;

  return this.grid.smoothness() * smoothnessWeight
       + this.grid.monotonicity2() * monotonicityWeight
       + Math.log(emptyCells) * emptyCellsWeight
       + this.grid.maxValue() * maxTileWeight;
};

// Helper function.
expectimaxAI.prototype.getMove = function(){
    return this.iterativeDeep();
}

// Iterative Deepening: Calls the expectimax search function with increasing depths.
// The time of execution is limited to 100ms.
expectimaxAI.prototype.iterativeDeep = function(){
    
    var bestScore;
    var bestMove;
    var result;
    
    var startTime = new Date().getTime();
    var iterationEndTime = new Date().getTime() - startTime;
    var depth = 0,
        alpha = -10000,
        beta = 10000;
    
    while(iterationEndTime < minSearchTime){
        console.log("For Depth: "+depth);
        var newResult = this.getNextMove(alpha, beta, depth);
        if(newResult.move == -1){
            break;
        }
        else{
            bestMove = newResult.move;
        }
        depth++;
        iterationEndTime = new Date().getTime() - startTime;
    }
    return bestMove;
}

// Expectimax Function with alpha beta pruning for better efficiency.
expectimaxAI.prototype.getNextMove = function(alpha, beta, depth){
    var result;
    var maxScore;
    var nextMove;
    
    //Maximizer - AI Player that determines the direction(move) to be chosen next.
    if (this.grid.playerTurn){
        maxScore = alpha;
        for(var direction in possibleMoves){
            var newGrid = this.grid.clone();    // Copy game state
            if (newGrid.move(direction).moved) {    // Advance game state
                if (newGrid.isWin()) {
                    return { move: direction, score: 10000};
                }
                
                var newAI = new expectimaxAI(newGrid);

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
                if (maxScore > beta) {      // Cutoff
                    return { move: nextMove, score: beta};
                }
            }
        }
    }
    
    //Minimizer - Algorithm tries to put new tiles in worst possible places based on the evaluation of the grid.
    else{
        maxScore = beta;
        var totalSum = 0;
        var cellCount = 0;
        
        var availableCells = this.grid.availableCells();
        var scoreMapping = {2 : [], 4 : []};
        var newEntries = [];
        
        for(var value in scoreMapping){
            for(var index in availableCells){
                scoreMapping[value].push(null);
                
                var newCell = availableCells[index];
                var newTile = new Tile(newCell, parseInt(value, 10));
                this.grid.insertTile(newTile);
                
                // Check how the grid is affected after introducing the new tile.
                // islands is a measure of the grid which finds out if there are any higher value tiles isolated
                // in between lower value tiles. 64 tile is an island.
                //  16  16  8   2
                //  4   2   2   8
                //  2   64  2   4
                //  16  8   16  2   
                
                scoreMapping[value][index] = -this.grid.smoothness()+this.grid.islands();
                this.grid.removeTile(newTile);
            }
        }
        
        // Identify the tiles that affect the most i.e. that have the highest value after inserting in the grid.
        var worstScore = Math.max(Math.max.apply(null, scoreMapping[2]), Math.max.apply(null, scoreMapping[4]));
        for(var value in scoreMapping){
            for(var index = 0; index < scoreMapping[value].length; index++){
                if(scoreMapping[value][index] == worstScore){
                    newEntries.push({position: availableCells[index], value: parseInt(value, 10)});
                }
            }
        }
        
        // These tiles are the possible options for the min player. Now we create the tile and get the score of how
        // the new grid is handled by the agent. These scores are then averaged and returned in place of min.
        
        for(var i = 0; i < newEntries.length; i++){
            var newPosition = newEntries[i].position;
            var val = newEntries[i].value;
            
            var newTile = new Tile(newPosition, val);
            var tempState = this.grid.clone();
            
            tempState.insertTile(newTile);
            tempState.playerTurn = true;
            
            newExpectimax = new expectimaxAI(tempState);
            result = newExpectimax.getNextMove(alpha, maxScore, depth);
            
            totalSum += result.score;
            cellCount++;
        }
        var avg = totalSum/cellCount;
        return {move: null, score: avg};
    }
    
    // Return the best selected move.
    return {move: nextMove, score: maxScore};
}