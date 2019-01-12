const assert = require('assert').strict;

function make_uniform_grid(size) {
  grid = [];
  for (let i = 0; i < size; ++i) {
    var row = [];
    for (let j = 0; j < size; ++j) {
      if (Math.floor(Math.random()*100) > 0) {
        row.push(true);
      } else {
        row.push(false);
      }
    }
    grid.push(row);
  }
  return grid;
}

function print_grid(grid, path, start) {
  var path_locations = [start];
  for (let i = 1; i < grid.length; ++i) {
    path_locations.push([path_locations[i - 1][0] + path[i][0], path_locations[i - 1][1] + path[i][1]]);
  }
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

var global_grid = make_uniform_grid(8);

function valid_coord(grid, coord) {
  return coord[0] > -1 && coord[1] > -1 && coord[0] < grid.length && coord[1] < grid.length;
}

// From: https://stackoverflow.com/questions/3115982/how-to-check-if-two-arrays-are-equal-with-javascript
function arraysEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length != b.length) return false;

  // If you don't care about the order of the elements inside
  // the array, you should sort both arrays here.
  // Please note that calling sort on an array will modify that array.
  // you might want to clone your array first.

  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
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
    if (valid_coord(grid, test_cell) && grid[test_cell[0]][test_cell[1]] === true) {
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
  arr.sort(function(v1, v2) { return v1.f < v2.f; });
  return arr;
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
    dPath.push([path[i][0] - path[i + 1][0], path[i][1] - path[i + 1][1]]);
  }
  return dPath;
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flat
function flatten(arr) {
  return arr.reduce((acc, val) => acc.concat(val), []);
}

// Script part of script

// manhattan distance tests
assert(manhattan([0, 0], [0, 0]) === 0);
assert(manhattan([0, 0], [0, 1]) === 1);
assert(manhattan([0, 0], [1, 1]) === 2);

console.log(neighbors(global_grid, [0, 0]));

// neighbors test
assert(arraysEqual(flatten([[0, 1], [1, 0], [1, 1]]), flatten(neighbors(global_grid, [0, 0]))));
assert(neighbors(global_grid, [1, 1]).length === 8);

// is valid coord test
assert(valid_coord(global_grid, [0, 0]));
assert(!valid_coord(global_grid, [-1, -1]));
assert(!valid_coord(global_grid, [global_grid.length + 1, global_grid.length + 1]));

assert.deepStrictEqual(best_first_search(make_uniform_grid(5), [0, 0], [0, 1]), [[0, 1]]);
assert.deepStrictEqual(best_first_search(make_uniform_grid(5), [0, 0], [0, 3]), [[0, 1]]);

path = best_first_search(global_grid, [0, 0], [6, 7]);
print_grid(global_grid, path, [0, 0]);
//console.log(path);