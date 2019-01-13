const assert = require('assert').strict;

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
    dPath.push([path[i][0] - path[i + 1][0], path[i][1] - path[i + 1][1]]);
  }
  return dPath;
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flat
function flatten(arr) {
  return arr.reduce((acc, val) => acc.concat(val), []);
}

function assertSamePath(path1, path2) {
  
}

// Script part of script

// manhattan distance tests
assert(manhattan([0, 0], [0, 0]) === 0);
assert(manhattan([0, 0], [0, 1]) === 1);
assert(manhattan([0, 0], [1, 1]) === 2);

// neighbors test
assert(arraysEqual(flatten([[0, 1], [1, 0], [1, 1]]), flatten(neighbors(global_grid, [0, 0]))));
assert(neighbors(global_grid, [1, 1]).length === 8);

// is valid coord test
assert(valid_coord(global_grid, [0, 0]));
assert(!valid_coord(global_grid, [-1, -1]));
assert(!valid_coord(global_grid, [global_grid.length + 1, global_grid.length + 1]));

assert.deepStrictEqual(best_first_search(make_uniform_grid(5), [0, 0], [0, 1]), [[0, 1]]);

path = best_first_search(global_grid, [0, 0], [6, 7]);
print_grid(global_grid, path, [0, 0]);
