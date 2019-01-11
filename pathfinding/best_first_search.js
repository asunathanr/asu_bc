const heap = require('heap');

// to store element and its priority 
class QElement {
  constructor(element, priority, parent) {
    this.element = element;
    this.priority = priority;
    this.parent = parent;
  }
}

// PriorityQueue class 
class PriorityQueue {

  // An array is used to implement priority 
  constructor() {
    this.items = [];
  }

  // functions to be implemented 
  // enqueue(item, priority) 
  // dequeue() 
  // front() 
  // isEmpty() 
  // printPQueue() 


  // enqueue function to add element 
  // to the queue as per priority 
  enqueue(element, priority, parent) {
    // creating object from queue element 
    var qElement = new QElement(element, priority, parent);
    var contain = false;

    // iterating through the entire 
    // item array to add element at the 
    // correct location of the Queue 
    for (var i = 0; i < this.items.length; i++) {
      if (this.items[i].priority < qElement.priority) {
        // Once the correct location is found it is 
        // enqueued 
        this.items.splice(i, 0, qElement);
        contain = true;
        break;
      }
    }

    // if the element have the highest priority 
    // it is added at the end of the queue 
    if (!contain) {
      this.items.push(qElement);
    }
  }

  size() {
    return this.items.length;
  }


  // dequeue method to remove 
  // element from the queue 
  dequeue() {
    // return the dequeued element 
    // and remove it. 
    // if the queue is empty 
    // returns Underflow 
    if (this.isEmpty())
      return "Underflow";
    return this.items.shift();
  }

  isEmpty() {
    return this.items.length == 0;
  }
}


function make_uniform_grid(size) {
  grid = [];
  for (let i = 0; i < size; ++i) {
    row = []
    for (let j = 0; j < size; ++j) {
      row.push(true);
    }
    grid.push(row);
  }
  return grid;
}

var global_grid = make_uniform_grid(2);

function valid_coord(grid, coord) {
  return coord[0] > -1 && coord[1] > -1 && coord[0] < grid.length && coord[1] < grid.length;
}

function neighbors(grid, cell) {

  const directions = [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [-1, -1], [-1, 1], [1, -1]];
  var coords = []
  for (let i = 0; i < directions.length; ++i) {
    var dir = directions[i];
    coords.push([cell[0] + dir[0], cell[1] + dir[1]]);
  }
  var empty_cells = []
  for (let i = 0; i < coords.length; ++i) {
    var test_cell = coords[i];
    if (valid_coord(grid, test_cell) && grid[test_cell[0]][test_cell[1]]) {
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

function manhattan(pos1, pos2) {
  return Math.abs(pos1[0] - pos2[0]) + Math.abs(pos1[0] - pos2[0]);
}

function best_first_search(grid, start, end) {
  var queue = new heap(function(x, y) { return x.lt(y); });
  queue.push(new Node(manhattan(start, end), start, undefined));
  var closed = new Set();

  while (queue.size() !== 0) {
    var current = queue.dequeue();
    if (end[0] === current.element[0] && end[1] === current.element[1]) {
      return current;
    }
    closed = closed.add(current.element);
    var n = neighbors(grid, current.element);
    var unvisited_n = [];
    for (let i = 0; i < n.length; ++i) {
      if (closed.has(n[i]) === false) {
        unvisited_n.push(n[i]);
      }
    }
    for (let i = 0; i < unvisited_n.length; ++i) {
      queue.enqueue(unvisited_n[i], manhattan(unvisited_n[i], end), current);
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
    path.push(current.element);
    current = current.parent;
  }
  var dPath = [];
  for (var i = 0; i < path.length - 1; ++i) {
    dPath.push([path[i][0] - path[i + 1][0], path[i][1] - path[i + 1][1]]);
  }
  return dPath;
}

path = trace_path(best_first_search(global_grid, [0, 0], [0, 1]));
console.log(path);