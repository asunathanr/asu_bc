import { a_star } from 'pathfinder.js';

const END_OF_PATH = -1;

/**
 * Encapsulates an array of coordinates which form a path.
 * @property cells: Cells which form a path
 * @property pos: The current cell in path.
 */
class Path {
  constructor(cells, pos) {
    this.cells = cells;
    this.pos = pos;
  }

  valid() {
    return this.cells !== undefined ||
     this.pos !== undefined ||
    (!this.empty() && this.pos < this.cells.length);
  }

  empty() {
    return this.cells.length === 0;
  }

  at_path_end() {
    return this.pos >= this.cells.length || this.empty();
  }

  /**
   * Reset path to starting cell.
   */
  reset() {
    this.pos = 0;
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

  truncate(by) {
    this.cells.pop();
  }

  make(grid, start, goal, speed) {
    this.pos = 0;
    this.cells = a_star(grid, start, goal, speed);
    if (this.cells === undefined) {
      Error('Newly created path is invalid.');
    }
  }

  /**
   * @returns {string} Serialized path
   */
  serialize() {
    serializedPath = '';
    if (!(cells instanceof Array)) {
      return "Path is not an array, typeof Path is ".concat(typeof(this.cells));
    }
    for (let cell of this.cells) {
      serializedPath.concat(cell.toString());
    }
    return serializedPath;
  }
}

export { END_OF_PATH, Path };