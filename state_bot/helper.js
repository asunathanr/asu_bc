import { Path } from 'path.js';
import { manhattan } from './pathfinder.js';
import CONSTANTS from './constants.js';

const helper = {};

/**
 * @param {MyRobot.me} unit: The robot under consideration. If current bot is desired bot use this.me as the argument.
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
};

/**
 * Converts a coordinate represented as an associative array to an array.
 * @param assoc_coords: {x, y}
 * @returns {array}
 */
helper.convert_assoc_coord = (assoc_coord) => {
  return [assoc_coord.x, assoc_coord.y];
};

/**
 * @returns The amount of resources a unit holds based on resource_type
 */
helper.resource_value = (unit, resource_type) => {
  let value = 0;
  switch (resource_type) {
    case CONSTANTS.RESOURCE_TYPE.KARBONITE:
      value = unit.karbonite;
      break;
    case CONSTANTS.RESOURCE_TYPE.FUEL:
      value = unit.fuel;
      break;
    default:
      throw Error('resource_value function call failed: resource_type argument was neither karbonite or fuel.');
  }
  return value;
};

helper.resource_map = (robot, resource_type) => {
  let value = 0;
  switch (resource_type) {
    case CONSTANTS.RESOURCE_TYPE.KARBONITE:
      value = robot.getKarboniteMap();
      break;
    case CONSTANTS.RESOURCE_TYPE.FUEL:
      value = robot.getFuelMap();
      break;
    default:
      value = Error('resource_value function call failed: resource_type argument was neither karbonite or fuel.');
  }
  return value;
};

helper.resource_locations = (robot, resource_type) => {
  const resource_map = helper.resource_map(robot, resource_type);
  let resource_locations = [];
  for (let y = 0; y < resource_map.length; ++y) {
    for (let x = 0; x < resource_map.length; ++x) {
      if (resource_map[y][x]) {
        resource_locations.push([x, y]);
      }
    }
  }
  return resource_locations;
};

helper.same_position = (pos1, pos2) => {
  return pos1[0] === pos2[0] && pos1[1] === pos2[1];
};

helper.empty_resource_locations = (robot, resource_type) => {
  const all_locations = helper.resource_locations(robot, resource_type);
  robot.log("All locations: " + all_locations[0].toString());
  return all_locations.filter((loc) => {
    return robot.getVisibleRobotMap()[loc[1]][loc[0]] < 1;
  });
};

helper.random_item = (arr) => {
  const ERROR_NAME = 'random_item: ';
  if (arr.length === 0) {
    return Error(ERROR_NAME.concat('array is empty'));
  }
  return arr[Math.floor(Math.random() * arr.length)];
};

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

/**
 * filters visible robots for robots that are currently radioing
 * @param self: { MyRobot } object
 * @returns list of robots that are signaling
 */
helper.getRadioingRobots = (self) => {
  return self.getVisibleRobots().filter((r) => {
    return self.isRadioing(r);
  });
}

/**
 * hashes the current value by mod 256
 * @param signal: the integer to be hased
 * @returns the mod 256 of the signal
 */
helper.castleHash = (signal) => {
    return signal%256;
}

export default helper;