import { a_star } from 'pathfinder.js';

const END_OF_PATH = -1;

/**
 * Encapsulates an array of coordinates which form a path.
 * @property cells: Cells which form a path
 * @property pos: The current cell in path.
 */
class Path {
  constructor() {
    this.cells = [];
    this.pos = 0;
  }

  valid() {
    return this.cells.length > 0;
  }

  at_path_end() {
    return this.pos >= this.cells.length;
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

  reverse() {
    let reversedPath = this.cells.reverse();
    this.cells = reversedPath.map((cell) => {
      return [-cell[0], -cell[1]];
    });
    this.pos = 0;
  }

  make(grid, start, goal, speed) {
    this.pos = 0;
    this.cells = a_star(grid, start, goal, speed);
  }
}

export { END_OF_PATH, Path };