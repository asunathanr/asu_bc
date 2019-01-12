import { BCAbstractRobot, SPECS } from 'battlecode';

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
  return arr.sort(function (v1, v2) { return v1.f < v2.f; });
}

function manhattan(pos1, pos2) {
  return Math.abs(pos1[0] - pos2[0]) + Math.abs(pos1[1] - pos2[1]);
}

function best_first_search(grid, start, end) {
  var queue = [];
  queue.push(new Node(manhattan(start, end), start, undefined));
  var closed = new Set();

  while (queue.length !== 0) {
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
      queue = merge(new Node(manhattan(unvisited_n[i], end), unvisited_n[i], current), queue);
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

function can_perform_action(cost, reserve) {
  return cost < reserve;
}


var path = [];
var step = -1;


class MyRobot extends BCAbstractRobot {

  turn() {
    step++;
    if (this.me.unit === SPECS.CRUSADER) {
      return this.crusader_turn();
    }

    else if (this.me.unit === SPECS.CASTLE) {
      return this.castle_turn();
    }

  }

  castle_turn() {
    this.log("CASTLE");
    if (step % 10 === 0) {
      //this.log("Building a crusader at " + (this.me.x+1) + ", " + (this.me.y+1));
      var n = neighbors(this.getPassableMap(), this.my_pos());
      var pos = n[Math.floor(Math.random() * n.length)];
      return this.buildUnit(SPECS.CRUSADER, pos[0] - this.me.x, pos[1] - this.me.y);
    } else {
      return; // this.log("Castle health: " + this.me.health);
    }
  }

  crusader_turn() {
    // this.log("Crusader health: " + this.me.health);
    this.log("CRUSADER" + this.me.id);
    if (path.length < 1) {
      path = this.make_path(this.my_pos(), this.rand_coord());
    }
    var choice = path.pop();
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
      var temp = n[i];
      if (this.getPassableMap()[temp[0]][temp[1]] === true && valid_coord(this.getPassableMap(), temp)) {
        filtered_coords.push(n[i]);
      }
    }

    var pos = Math.floor(Math.random() * filtered_coords.length);
    this.log(filtered_coords.length);
    return filtered_coords[pos];
  }

  make_path(start, goal) {
    return best_first_search(
      this.getPassableMap(),
      start,
      goal
    );
  }

  convert_boolean_map(map) {
    var converted_map = [];
    for (var i = 0; i < map.length; i++) {
      converted_map.push(map[i].map(Number));
    }
    return converted_map;
  }

  distance(p1, p2) {
    return Math.abs(p1[0] - p2[0]) + Math.abs(p1[1] - p2[1]);
  }

}


var robot = new MyRobot();

