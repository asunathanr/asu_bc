import { BCAbstractRobot, SPECS } from 'battlecode';


// Got BinaryHeap from: http://eloquentjavascript.net/1st_edition/appendix2.html
function BinaryHeap(scoreFunction){
  this.content = [];
  this.scoreFunction = scoreFunction;
}

BinaryHeap.prototype = {
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

function valid_coord(grid, coord) {
  return coord[0] > -1 && coord[1] > -1 && coord[0] < grid.length && coord[1] < grid.length;
}

function neighbors(grid, cell) {

  const directions = [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [-1, -1], [-1, 1], [1, -1]];
  var coords = [];
  for (let i = 0; i < directions.length; ++i) {
    var dir = directions[i];
    coords.push([cell[0] + dir[0], cell[1] + dir[1]]);
  }
  var empty_cells = [];
  for (let i = 0; i < coords.length; ++i) {
    var test_cell = coords[i];
    if (valid_coord(grid, test_cell) === true && grid[test_cell[0]][test_cell[1]] === true) {
      empty_cells.push(test_cell);
    }
  }
  return empty_cells;
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

function best_first_search(grid, start, end) {
  var queue = new BinaryHeap(function(element) {return element.f;});
  queue.push(new Node(manhattan(start, end), start, undefined));
  var closed = new Set();

  while (queue.size() !== 0) {
    var current = queue.pop();
    if (end[0] === current.coord[0] && end[1] === current.coord[1]) {
      return trace_path(current);
    }
    closed = closed.add(current.coord);
    var n = neighbors(grid, current.coord);
    var unvisited_n = [];
    for (let i = 0; i < n.length; ++i) {
      if (closed.has(n[i]) === false) {
        unvisited_n.push(n[i]);
      }
    }
    for (let i = 0; i < unvisited_n.length; ++i) {
      queue.push(new Node(manhattan(unvisited_n[i], end), unvisited_n[i], current));
    }
  }
  return undefined;
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

const END_OF_PATH = -1;

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
  make(grid, start, goal) {
    this.pos = 0;
    this.cells = best_first_search(grid, start, goal);
  }
}

// Controls behavior for crusader.
class CrusaderState {
  constructor(crusader) {
    this.current_state = this.initialState;
    this.enemy_castle = undefined;
  }

  // Swap to different state. Next state will be performed next round
  change_state(new_state) {
    this.current_state = new_state;
  }

  // Perform tasks for current state.
  act(crusader) {
    this.current_state(crusader);
  }

  // On creation deduce location of enemy castle and head for it.
  initialState(crusader) {
    var nearby_allies = crusader.getVisibleRobots();
    var castle_pos = undefined;
    for (var ally of nearby_allies) {
      if (ally.unit === 0) {
        castle_pos = [ally.x, ally.y];
      }
    }
    function find_enemy_castle(my_x, y) {
      var midpoint = crusader.getPassableMap().length / 2;
      return [crusader.getPassableMap().length - my_x, y];
    }
    crusader.make_path(crusader.my_pos(), find_enemy_castle(castle_pos[0], castle_pos[1]));
    this.enemy_castle = castle_pos;
    this.change_state(this.moveState);
    return crusader.move_unit();
  }

  moveState(crusader) {
    var next_pos = crusader.move_unit();
    if (crusader.getVisibleRobotMap()[this.enemy_castle[0]][this.enemy_castle[1]]) {
      this.change_state(this.attackState);
    }
    return crusader.move_unit();
  }

  attackState(crusader) {
    var pos = [this.enemy_castle[0] - crusader.x, this.enemy_castle[1] - crusader.y];
    return crusader.attack_enemy(pos[0], pos[1]);
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
    this.currentState(castle);
  }

  // Build crusaders for the next 5 turns
  initialState(castle) {
    for (var i = 0; i < 5; ++i) {
      this.build_q.push(SPECS['CRUSADER']);
    }
    this.changeState(buildState);
  }

  buildState(castle) {
    
    if (build_q.length === 0) {

    }
    unit = build_q.shift();
  }

  idleState(castle) {

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
      state = new CrusaderState();
    } else if (unit_type === SPECS.CASTLE) {
      state = new CastleState();
    }
  }

  castle_turn() {
    this.log("CASTLE");
    for (var robot of this.getVisibleRobots()) {
      if (this.isRadioing(robot)) {
        console.log("Castletalk message: " + robot.castle_talk.toString());
      }
    }
    if (can_afford_action(unit_cost(SPECS, "CRUSADER"), this.fuel) && step % 10 === 0) {
      console.log("Building a crusader.");
      var n = neighbors(this.getPassableMap(), this.my_pos());
      var pos = n[Math.floor(Math.random() * n.length)];
      return this.buildUnit(SPECS.CRUSADER, pos[0] - this.me.x, pos[1] - this.me.y);
    } else {
      return;
    }
  }

  crusader_turn() {
    this.castleTalk(10);
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
      return undefined;
    }
    var choice = path.next();
    return this.move(choice[0], choice[1]);
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
      if (this.getPassableMap()[neighbor_x][neighbor_y]
           && valid_coord(this.getPassableMap(), [neighbor_x, neighbor_y])) {
        filtered_coords.push(n[i]);
      }
    }

    var pos = Math.floor(Math.random() * filtered_coords.length);
    this.log(filtered_coords.length);
    return filtered_coords[pos];
  }

  make_path(start, goal) {
    path.make(this.getPassableMap(), start, goal);
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

