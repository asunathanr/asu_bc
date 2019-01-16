class AStarNode {
  constructor(f, coord, parent, g=1) {
    this.f = f;
    this.g = g;  
    this.coord = coord;
    this.parent = parent;
  }

  lt(other) {
    return this.f < other.f;
  }
}

// export default AStarNode;

// Got BinaryHeap from: http://eloquentjavascript.net/1st_edition/appendix2.html
function BinaryHeap(scoreFunction){
  this.content = [];
  this.scoreFunction = scoreFunction;
}

BinaryHeap.prototype = {
  top: function() {
    if (this.content.length > 0) {
      return this.content[0];
    }
    return undefined;
  },

  push: function(element) {
    // Add the new element to the end of the array.
    this.content.push(element);
    // Allow it to bubble up.
    this.bubbleUp(this.content.length - 1);
  },

  pop: function() {
    // Store the first element so we can return it later.
    var result = this.content[0];
    // Get the element at the end of the array.
    var end = this.content.pop();
    // If there are any elements left, put the end element at the
    // start, and let it sink down.
    if (this.content.length > 0) {
      this.content[0] = end;
      this.sinkDown(0);
    }
    return result;
  },

  remove: function(node) {
    var length = this.content.length;
    // To remove a value, we must search through the array to find
    // it.
    for (var i = 0; i < length; i++) {
      if (this.content[i] != node) continue;
      // When it is found, the process seen in 'pop' is repeated
      // to fill up the hole.
      var end = this.content.pop();
      // If the element we popped was the one we needed to remove,
      // we're done.
      if (i == length - 1) break;
      // Otherwise, we replace the removed element with the popped
      // one, and allow it to float up or sink down as appropriate.
      this.content[i] = end;
      this.bubbleUp(i);
      this.sinkDown(i);
      break;
    }
  },

  size: function() {
    return this.content.length;
  },

  bubbleUp: function(n) {
    // Fetch the element that has to be moved.
    var element = this.content[n], score = this.scoreFunction(element);
    // When at 0, an element can not go up any further.
    while (n > 0) {
      // Compute the parent element's index, and fetch it.
      var parentN = Math.floor((n + 1) / 2) - 1,
      parent = this.content[parentN];
      // If the parent has a lesser score, things are in order and we
      // are done.
      if (score >= this.scoreFunction(parent))
        break;

      // Otherwise, swap the parent with the current element and
      // continue.
      this.content[parentN] = element;
      this.content[n] = parent;
      n = parentN;
    }
  },

  sinkDown: function(n) {
    // Look up the target element and its score.
    var length = this.content.length,
    element = this.content[n],
    elemScore = this.scoreFunction(element);

    while(true) {
      // Compute the indices of the child elements.
      var child2N = (n + 1) * 2, child1N = child2N - 1;
      // This is used to store the new position of the element,
      // if any.
      var swap = null;
      // If the first child exists (is inside the array)...
      if (child1N < length) {
        // Look it up and compute its score.
        var child1 = this.content[child1N],
        child1Score = this.scoreFunction(child1);
        // If the score is less than our element's, we need to swap.
        if (child1Score < elemScore)
          swap = child1N;
      }
      // Do the same checks for the other child.
      if (child2N < length) {
        var child2 = this.content[child2N],
        child2Score = this.scoreFunction(child2);
        if (child2Score < (swap == null ? elemScore : child1Score))
          swap = child2N;
      }

      // No need to swap further, we are done.
      if (swap == null) break;

      // Otherwise, swap and continue.
      this.content[n] = this.content[swap];
      this.content[swap] = element;
      n = swap;
    }
  }
};

class Cache {
  constructor() {
    this.cache = new Map();
  }

  has(key) {
    return this.cache.has(key);
  }

  get(key) {
    return this.cache.get(key);
  }

  add(key, value) {
    return this.cache.set(key, value);
  }
}

// export default BinaryHeap;

const G_COST = 1;

//neighbors
	//grid: 2d boolean array of passable terrain
	//cell: associative array with attributes cell.x and cell.y containing the component coordinates of a cell
	//speed: the speed of the unit given in r^2 units
	//
	//returns the set of all coordinates that are neighbors to cell given the speed
	//		each element of the set is an array where the 0 element is the x component and the 1 element is the y
	function neighbors(grid, cell, speed) {
		const relative_neighbors = {'4':[[0,1],[1,0],[1,1],[2,0],[0,2],
										[0,-1],[1,-1],[0,-2],
										[-1,0],[-1,1],[-2,0],
										[-1,-1]],
									'9':[[0,1],[1,0],[1,1],[2,0],[0,2],
										[0,-1],[1,-1],[0,-2],
										[-1,0],[-1,1],[-2,0],
										[-1,-1],
										[0,3],[0,-3],[3,0],[-3,0],
										[1,2],[-1,2],[1,-2],[-1,-2],
										[2,1],[-2,1],[2,-1],[-2,-1]]};
		
		var neighborCells = new Set(); //set of nieghbors to be returned
		
		//for all potential neighbors
		for(var i of relative_neighbors[speed]){
			//in bounds
			if(cell.x+i[0]>=0 && cell.x+i[0]<grid.length && cell.y+i[1]>=0 && cell.y+i[1]<grid.length){
				//point is passable
				if(grid[cell.y+i[1]][cell.x+i[0]]===true){
					neighborCells.add([cell.x+i[0],cell.y+i[1]]);
				}
			}
		}
		
		return neighborCells;
	}


function manhattan(pos1, pos2) {
  return Math.abs(pos1[0] - pos2[0]) + Math.abs(pos1[1] - pos2[1]);
}


var manhattan_cache = new Cache();

function tie_breaker_manhattan(pos1, pos2) {
  return manhattan(pos1, pos2) * (1.0 + 1/1000);
}

function is_over(open_set, end) {
  if (open_set.size() === 0) {
    return true;
  } else {
    let curr = open_set.top().coord;
    return (curr[0] === end[0] && curr[1] === end[1]);
  }
}


/**
 * Finds path from start to end using A*.
 * It is meant to be fast but not necessarily accurate.
 * Will be replaced with something more accurate once robot.js is stable.
 * @todo Add Error checking for oob destination.
 * @param {Array<boolean>} grid 
 * @param {Array<Array<number>>} start 
 * @param {Array<Array<number>>} end 
 */
function a_star(grid, start, end, speed) {
  var open_set = new BinaryHeap(function(element) {return element.f;});
  open_set.push(new AStarNode(0, start, undefined, 0));
  var closed = new Set();

  while (!is_over(open_set, end)) {
    let current = open_set.pop();
    let cost = current.g + G_COST;
    closed.add(current.coord.toString());
    var unvisited_n = [];
    for (var neighbor of neighbors(grid, {x: current.coord[0], y: current.coord[1]}, speed)) {
      if (!closed.has(neighbor.toString())) {
        unvisited_n.push(neighbor);
      }
    }
    for (let i = 0; i < unvisited_n.length; ++i) {
      open_set.push(new AStarNode(cost + tie_breaker_manhattan(unvisited_n[i], end), unvisited_n[i], current, cost));
    }
  }
  return trace_path(open_set.top());
}

function trace_path(end) {
  if (end === undefined) {
    return Error('Unable to find path.');
  }
  if (end.parent === undefined) {
    return [];
  }
  var current = end;
  var path = [];
  while (current !== undefined) {
    path.push(current.coord);
    current = current.parent;
  }
  path = path.reverse();
  var dPath = [];
  for (var i = 0; i < path.length - 1; ++i) {
    dPath.push([path[i + 1][0] - path[i][0], path[i + 1][1] - path[i][1]]);
  }
  return dPath;
}


function make_uniform_grid(size, prob = 0) {
  var grid = [];
  for (let i = 0; i < size; ++i) {
    var row = [];
    for (let j = 0; j < size; ++j) {
      if (Math.floor(Math.random()*100) > prob) {
        row.push(true);
      } else {
        row.push(false);
      }
    }
    grid.push(row);
  }
  return grid;
}

function print_grid(grid, path, start, end) {
  var path_locations = [start];
  for (let i = 1; i < path.length; ++i) {
    path_locations.push([path_locations[i - 1][0] + path[i][0], path_locations[i - 1][1] + path[i][1]]);
  }
  path_locations.push(end);
  for (let i = 0; i < grid.length; ++i) {
    for (let j = 0; j < grid.length; ++j) {
      var c = '.';
      if (grid[i][j] === false) {
        c = 'X';
      } else if (path_locations.find(function (p) { return p[0] === i && p[1] === j; }) !== undefined) {
        c = 'P';
      } else {
        c = '.';
      }
      process.stdout.write(c);
      process.stdout.write(' ');
    }
    console.log(' ');
  }
}

var grid = make_uniform_grid(10, 10);
const START = [0, 0];
const END = [9, 9];
print_grid(grid, a_star(grid, START, END, 9), START, END);
