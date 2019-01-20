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