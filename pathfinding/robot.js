import { BCAbstractRobot, SPECS } from 'battlecode';
import BinaryHeap from './binary_heap.js';
import nav from './nav.js';

const END_OF_PATH = -1;


function valid_coord(grid, coord) {
  return coord[0] > -1 && coord[1] > -1 && coord[0] < grid.length && coord[1] < grid.length;
}

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

class Node {
  constructor(f, coord, parent) {
    this.f = f;
    this.coord = coord;
    this.parent = parent;
  }

  lt(other) {
    return this.f < other.f;
  }
}

function merge(node, arr) {
  arr.push(node);
  return arr;
}

function manhattan(pos1, pos2) {
  return Math.abs(pos1[0] - pos2[0]) + Math.abs(pos1[1] - pos2[1]);
}

/**
 * Finds path from start to end using Greedy Best First Search.
 * It is meant to be fast but not necessarily accurate.
 * Will be replaced with something more accurate once robot.js is stable.
 * @param {Array<boolean>} grid 
 * @param {Array<Array<number>>} start 
 * @param {Array<Array<number>>} end 
 */
function best_first_search(grid, start, end, speed=SPECS['PILGRIM'].SPEED) {
  var open_set = new BinaryHeap(function(element) {return element.f;});
  open_set.push(new Node(0, start, undefined));
  var closed = new Set();
  closed.add(start);

  while (open_set.size() !== 0) {
    var current = open_set.pop();
    if (end[0] === current.coord[0] && end[1] === current.coord[1]) {
      return trace_path(current);
    }
    closed = closed.add(current.coord.toString());
    var x = current.coord[0];
    var y = current.coord[1];
    var unvisited_n = [];
    for (var neighbor of neighbors(grid, {x, y}, speed)) {
      if (!closed.has(neighbor.toString())) {
        unvisited_n.push(neighbor);
      }
    }
    for (let i = 0; i < unvisited_n.length; ++i) {
      open_set.push(new Node(manhattan(unvisited_n[i], end), unvisited_n[i], current));
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

function can_afford_action(cost, reserve) {
  return cost < reserve;
}

function unit_cost(specs, unit) {
  return specs["UNITS"][specs[unit]]["CONSTRUCTION_FUEL"];
}



// Encapsulates an array of coordinates which form a path.
class Path {
  constructor() {
    this.cells = [];
    this.pos = 0;
  }
  valid() {
    return this.cells.length > 0;
  }
  next() {
    var cell = undefined;
    if (this.cells.length > 0 && this.pos < this.cells.length) {
      cell = this.cells[this.pos];
      this.pos++;
    } else if (this.pos >= this.cells.length) {
      cell = END_OF_PATH;
    } else {
      cell = undefined;
    }
    return cell;
  }
  make(grid, start, goal, speed=SPECS['PILGRIM'].SPEED) {
    this.pos = 0;
    this.cells = best_first_search(grid, start, goal, speed);
  }
}

// Controls behavior for crusader.
class CrusaderState {
  constructor(crusader) {
    this.current_state = this.initialState;
    var x = crusader.me.x;
    var y = crusader.me.y;
    this.destination = {x:0,y:0};
  }

  // Swap to different state. Next state will be performed next round
  change_state(new_state) {
    this.current_state = new_state;
  }

  // Perform tasks for current state.
  act(crusader) {
    return this.current_state(crusader);
  }

  // On creation deduce location of enemy castle and head for it.
  initialState(crusader) {
    function find_enemy_castle(my_x, y) {
      var midpoint = crusader.getPassableMap().length / 2;
      return [0, 0];
    }
    crusader.make_path(crusader.my_pos(), [0, 0]);
    this.change_state(this.moveState);
    return this.act(crusader);
  }

  moveState(crusader) {
    if (Math.floor(manhattan(crusader.my_pos(), [this.destination.x, this.destination.y])) === 1) {
      this.change_state(this.attackState);
      return this.act(crusader);
    }
    return crusader.move_unit();
  }

  attackState(crusader) {
    var self = crusader;
    // get attackable robots
    var attackable = self.getVisibleRobots().filter((r) => {
      if (! self.isVisible(r)){
          return false;
      }
      const dist = (r.x-self.me.x)**2 + (r.y-self.me.y)**2;
      if (r.team !== self.me.team
          && SPECS.UNITS[SPECS.CRUSADER].ATTACK_RADIUS[0] <= dist
          && dist <= SPECS.UNITS[SPECS.CRUSADER].ATTACK_RADIUS[1]) {
          return true;
      }
      return false;
    });
    if (attackable.length > 0) {
      var r = attackable[0];
      crusader.log('' + r);
      crusader.log('attacking! ' + r + ' at loc ' + (r.x - crusader.me.x, r.y - crusader.me.y));
      return crusader.attack(r.x - crusader.me.x, r.y - crusader.me.y);
    }
    return;
  }

}

// Set of behaviors for a castle.
class CastleState {
  constructor() {
    this.currentState = this.initialState;
    this.build_q = [];
  }

  changeState(nextState) {
    this.currentState = nextState;
  }

  // Do castle stuff depending on current state.
  act(castle) {
    return this.currentState(castle);
  }

  // Build crusaders for the next 5 turns
  initialState(castle) {
    for (var i = 0; i < 1; ++i) {
      this.build_q.push(SPECS['CRUSADER']);
    }
    this.changeState(this.buildState);
  }

  // Pump out units in build queue one unit at a time.
  // If build q is exhausted it switches to idle state.
  buildState(castle) {
    castle.log("In build state");
    if (this.build_q.length === 0) {
      this.changeState(this.idleState);
      return;
    }
    var unit = this.build_q.shift();
    var dAdj = [[0, 1], [1, 0], [-1, 0], [0, -1], [1, 1], [-1, -1], [-1, 1], [1, -1]];
    var adjCells = dAdj.map(function(adj) { return [castle.me.x + adj[0], castle.me.y + adj[1]]; });
    var validCells = adjCells.filter(function(cell) { 
      return castle.getPassableMap()[cell[1], cell[0]];
    });
    var chosenPosIndex = Math.floor(Math.random() * validCells.length);
    var chosenPos = validCells[chosenPosIndex];
    var chosenDxy = [castle.me.x - chosenPos[0], castle.me.y - chosenPos[1]];
    castle.log("Unit" + unit.toString());
    castle.log("Position: " + chosenDxy.toString());
    return castle.buildUnit(unit, chosenDxy[1], chosenDxy[0]);
  }

  // Do nothing -- may update later to check for messages.
  idleState(castle) {
    return;
  }
}


var path = new Path();
var step = -1;
var state = undefined;


class MyRobot extends BCAbstractRobot {

  turn() {
    step++;

    if (state === undefined) {
      this.assign_state(this.me.unit);
    }

    if (this.me.unit === SPECS.CRUSADER) {
      return this.crusader_turn();
    } else if (this.me.unit === SPECS.CASTLE) {
      return this.castle_turn();
    } else if (this.me.unit === SPECS.PILGRIM) {
      return this.pilgrim_turn();
    } else {
      return;
    }

  }

  assign_state(unit_type) {
    if (unit_type === SPECS.CRUSADER) {
      state = new CrusaderState(this);
    } else if (unit_type === SPECS.CASTLE) {
      state = new CastleState();
    }
  }

  castle_turn() {
    this.log("CASTLE");
    return state.act(this);
  }

  crusader_turn() {
    this.log("CRUSADER: " + this.me.id);
    return state.act(this);
  }

  pilgrim_turn() {
    return;
  }

  visible_enemies() {
    enemies = [];
    for (var robot of this.getVisibleRobots()) {
      if (this.is_enemy(robot)) {
        enemies.push(robot);
      }
    }
    return enemies;
  }

  is_enemy(robot) {
    return robot.team !== this.me.team;
  }

  attack_enemy(enemy) {
    return this.attack(this.me.x - enemy[0], this.me.y - enemy[1]);
  }

  move_unit() {
    if (!path.valid()) {
      this.log("Crusader: " + this.me.id.toString() + " is trying to move on invalid path.");
      return;
    }
    var choice = path.next();
    if (choice === END_OF_PATH) {
      return;
    } else {
      return this.move(choice[0], choice[1]);
    }
    
  }

  radius(pos, r) {
    var coords = [];
    for (var i = pos[0] - r; i < pos[0] + r; ++i) {
      for (var j = pos[1] - r; j < pos[1] + r; ++j) {
        if (i !== 0 && j !== 0) {
          coords.push([i, j]);
        }
      }
    }
    return coords;
  }

  my_pos() {
    return [this.me.x, this.me.y];
  }

  rand_coord() {
    var n = this.radius(this.my_pos(), 3);
    var filtered_coords = [];
    for (var i = 0; i < n.length; ++i) {
      var neighbor_x = n[i][0];
      var neighbor_y = n[i][1];
      if (this.getPassableMap()[neighbor_y][neighbor_x]
           && valid_coord(this.getPassableMap(), [neighbor_x, neighbor_y])) {
        filtered_coords.push(n[i]);
      }
    }

    var pos = Math.floor(Math.random() * filtered_coords.length);
    this.log(filtered_coords.length);
    return filtered_coords[pos];
  }

  make_path(start, goal) {
    path.make(this.getPassableMap(), start, goal, SPECS.UNITS[this.me.unit].SPEED);
  }

  log_value(desc, value) {
    this.log(desc + value.toString());
  }

  convert_boolean_map(map) {
    var converted_map = [];
    for (var i = 0; i < map.length; i++) {
      converted_map.push(map[i].map(Number));
    }
    return converted_map;
  }

}


var robot = new MyRobot();

