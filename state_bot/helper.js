import { Path } from 'path.js';
import { manhattan } from './pathfinder.js';

const helper = {};

/**
 * @param {MyRobot} unit: The robot under consideration. If current bot is desired bot use this.me as the argument.
 * @param {CONSTANTS.RESOURCE_TYPE} resource_type:
 * @param {function} predicate_fn: Takes one argument which is either fuel or karbonite values of unit.
 * @returns {boolean} Whether fn is true or false.
 */
helper.check_resource = (unit, resource_type, predicate_fn) => {
  switch (resource_type) {
    case CONSTANTS.RESOURCE_TYPE.KARBONITE:
      return predicate_fn(unit.karbonite);
    case CONSTANTS.RESOURCE_TYPE.FUEL:
      return predicate_fn(unit.fuel);
    default:
      Error('check_resource function call failed: resource_type argument was neither karbonite or fuel.');
  }
}

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
 * @returns if cell is occupied by a robot.
 */
helper.is_occupied = (robot_map, cell) => {
  return robot_map[cell[1]][cell[0]] > 0;
}



/**
 * Difference between two coordinates
 */
helper.difference = (pos1, pos2) => {
  return [pos1.x - pos2.x, pos1.y - pos2.y];
}

export default helper;