import BinaryHeap from './binary_heap.js';
import Cache from './cache.js';
import Node from './node.js';

//neighbors
	//grid: 2d boolean array of passable terrain
	//cell: associative array with attributes cell.x and cell.y containing the component coordinates of a cell
	//speed: the speed of the unit given in r^2 units
	//
	//returns the set of all coordinates that are neighbors to cell given the speed
	//		each element of the set is an array where the 0 element is the x component and the 1 element is the y
	function neighbors(grid, cell, speed) {
		var neighborCells = new Set(); //set of nieghbors to be returned
		
		var realSpeed; //speed converted to r units
		for(var i=1; i**2<=speed;i++){
			realSpeed = i**2;
		}
		
		//only consider points +/- realSpeed from cell
		for(var x=-realSpeed;x<=realSpeed;x++){
			for(var y=-realSpeed;y<=realSpeed;y++){
				//point is within speed radius
				if((x**2+y**2)<=speed){
					//point is in bounds
					if(cell.x+x>=0 && cell.x+x<grid.length && cell.y+y>=0 && cell.y+y<grid.length){
						//point is passable
						if(grid[cell.y+y][cell.x+x]===true){
							neighborCells.add([cell.x+x,cell.y+y]);
						}
					}
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
  var dist = 0;
  var key = pos1.toString().concat(pos2.toString());
  if (manhattan_cache.has(key)) {
    dist = manhattan_cache.get(key);
  } else {
    dist = manhattan(pos1, pos2) * (1.0 + 1/1000);
    manhattan_cache.add(key);
  }
  return dist;
}

/**
 * Finds path from start to end using Greedy Best First Search.
 * It is meant to be fast but not necessarily accurate.
 * Will be replaced with something more accurate once robot.js is stable.
 * @todo Add Error checking for oob destination.
 * @param {Array<boolean>} grid 
 * @param {Array<Array<number>>} start 
 * @param {Array<Array<number>>} end 
 */
function best_first_search(grid, start, end, speed) {
  var open_set = new BinaryHeap(function(element) {return element.f;});
  open_set.push(new Node(0, start, undefined));
  var closed = new Set();
  closed.add(start);

  while (open_set.size() !== 0) {
    var current = open_set.pop();
    if (end[0] === current.coord[0] && end[1] === current.coord[1]) {
      return trace_path(current);
    }
    closed.add(current.coord.toString());
    var unvisited_n = [];
    for (var neighbor of neighbors(grid, {x: current.coord[0], y: current.coord[1]}, speed)) {
      if (!closed.has(neighbor.toString())) {
        unvisited_n.push(neighbor);
      }
    }
    for (let i = 0; i < unvisited_n.length; ++i) {
      open_set.push(new Node(tie_breaker_manhattan(unvisited_n[i], end), unvisited_n[i], current));
    }
  }
  return Error('Unable to find path.');
}

function trace_path(end) {
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


export { manhattan, best_first_search };
