
/**
function make_uniform_grid(size) {
  var grid = [];
  for (let i = 0; i < size; ++i) {
    var row = []
    for (let j = 0; j < size; ++j) {
      row.push(true);
    }
    grid.push(row);
  }
  return grid;
}
*/

//var global_grid = make_uniform_grid(2);

function valid_coord(coord) {
  return coord[0] > -1 && coord[1] > -1 && coord[0] < global_grid.length && coord[1] < global_grid.length;
}

function neighbors(cell) {
  
  const directions = [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [-1, -1], [-1, 1], [1, -1]];
  var coords = []
  for (let i = 0; i < directions.length; ++i) {
    var dir = directions[i];
    coords.push([cell[0] + dir[0], cell[1] + dir[1]]);
  }
  var empty_cells = []
  for (let i = 0; i < coords.length; ++i) {
    var test_cell = coords[i];
    if (valid_coord(test_cell) && global_grid[test_cell[0]][test_cell[1]]) {
      empty_cells.push(test_cell);
    }
  }
  return empty_cells;
}

class Node {
  constructor(coord, parent) {
    this.coord = coord;
    this.parent = parent;
  }
}

function breadth_first_search(start, end, neighbors_fn) {
  var queue = [];
  var closed = new Set();
  queue.push(new Node(start, undefined));

  while (queue.length !== 0) {
      var current = queue.shift();
      if (end[0] === current.coord[0] && end[1] === current.coord[1]) {
          return current;
      }
      closed = closed.add(current.coord);
      var n = neighbors_fn(current.coord);
      var unvisited_n = [];
      for (let i = 0; i < n.length; ++i) {
          if (closed.has(n[i]) === false) {
              unvisited_n.push(n[i]);
          }
      }
      for (let i = 0; i < unvisited_n.length; ++i) {
          queue.push(new Node(unvisited_n[i], current));
      }
  }
  return undefined;
}

function trace_path(end) {
  if (end.parent == undefined) {
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
//console.log(global_grid[0][0]);
//path = trace_path(breadth_first_search([0, 0], [0, 1], neighbors));
//console.log(path);