import { Path } from 'path.js';

const helper = {};


helper.new_path = (grid, start, end, speed) => {
  let path = new Path();
  path.make(grid, start, end, speed);
  return path;
};

/**
 * Is the designated (x, y) a resource?
 * Works for both karbonite and fuel.
 * @param {number} x
 * @param {number} y
 * @param {boolean} resource_map
 * @returns {boolean}
 */
helper.at_resource = (x, y, resource_map) => {
  return resource[y][x];
}

/**
 * Difference between two coordinates
 */
helper.difference = (pos1, pos2) => {
  return [pos1.x - pos2.x, pos1.y - pos2.y];
}

export default helper;