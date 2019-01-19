import { Path } from 'path.js';
import { manhattan } from './pathfinder.js';

const helper = {};


helper.new_path = (grid, start, end, speed) => {
  let path = new Path();
  path.make(grid, start, end, speed);
  return path;
};

/**
 * Filter a list of robots down to a single unit type.
 */
helper.filter_by_type = (robots, desired_type) => {
  return robots.filter((robot) => {
    return robot.unit === desired_type;
  });
}

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
 * Tells whether one location is one tile away from another.
 * @param {array} location1: First location to check for adjacency.
 * @param {array} location2: Second location to check for adjacency.
 * @returns {boolean} if location1 is one tile away from location two.
 */
helper.is_adjacent = (location1, location2) => {
  return manhattan(location1, location2) === 1;
}

/**
 * Difference between two coordinates
 */
helper.difference = (pos1, pos2) => {
  return [pos1.x - pos2.x, pos1.y - pos2.y];
}

export default helper;