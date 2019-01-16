import AStarNode from './astar_node.js';
import BinaryHeap from './binary_heap.js';
import Cache from './cache.js';

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
    return (curr[0] === end && curr[1] === end[1]);
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
  closed.add(start);

  while (!is_over(open_set, end)) {
    var current = open_set.pop();
    let cost = current.g + G_COST;
    closed.add(current.coord.toString());
    var unvisited_n = [];
    for (var neighbor of neighbors(grid, {x: current.coord[0], y: current.coord[1]}, speed)) {
      if (!closed.has(neighbor.toString())) {
        unvisited_n.push(neighbor);
      }
    }
    for (let i = 0; i < unvisited_n.length; ++i) {
      open_set.push(new AStarNode(cost + manhattan(unvisited_n[i], end), unvisited_n[i], current, cost));
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


export { manhattan, a_star, best_first_search };
