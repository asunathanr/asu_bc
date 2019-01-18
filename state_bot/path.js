import { a_star } from 'pathfinder.js';

const END_OF_PATH = -1;

/**
 * Encapsulates an array of coordinates which form a path.
 * @property cells: Cells which form a path
 * @property pos: The current cell in path.
 */
class Path {
  constructor(cells = [], pos = 0) {
    this.cells = cells;
    this.pos = pos;
  }

  valid() {
    return !this.empty() && this.pos < this.cells.length;
  }

  empty() {
    return this.cells.length === 0;
  }

  at_path_end() {
    return this.pos >= this.cells.length || this.empty();
  }

  /**
   * Travel to next cell in path
   */
  next() {
    var cell = undefined;
    if (this.cells.length > 0 && this.pos < this.cells.length) {
      cell = this.cells[this.pos];
      this.pos++;
    } else if (this.pos >= this.cells.length) {
      cell = END_OF_PATH;
    } else {
      cell = Error('No new path');
    }
    return cell;
  }

  /**
   * Retrieve previous node
   */
  prev() {
    if (this.pos === 0) {
      return undefined;
    } else {
      this.pos--;
      return this.cells[this.pos];
    }
  }

  curr() {
    if (this.valid()) {
      return this.cells[this.pos];
    } else {
      return undefined;
    }
  }

  reverse() {
    let reversedPath = this.cells.reverse();
    this.cells = reversedPath.map((cell) => {
      return [-cell[0], -cell[1]];
    });
    this.pos = 0;
    return new Path(this.cells, this.pos);
  }

  make(grid, start, goal, speed) {
    this.pos = 0;
    this.cells = a_star(grid, start, goal, speed);
  }
}

export { END_OF_PATH, Path };