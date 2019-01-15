import { best_first_search } from 'pathfinder.js';

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

  make(grid, start, goal, speed) {
    this.pos = 0;
    this.cells = best_first_search(grid, start, goal, speed);
  }
}

export { END_OF_PATH, Path };