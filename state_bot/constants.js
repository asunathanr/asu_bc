import { SPECS } from './battlecode';

/**
 * @file speeds.js
 * @author Nathan Robertson
 * Defines speed constants
 */

 const CONSTANTS = {};

 CONSTANTS.CRUSADER_SPEED = SPECS.UNITS[SPECS.CRUSADER].SPEED;
 CONSTANTS.PILGRIM_SPEED = SPECS.UNITS[SPECS.PILGRIM].SPEED;
 
 CONSTANTS.ADJACENT_DELTAS = [[0, 1], [0, -1], [1, 0], [-1, 0], [-1, 1], [1, -1], [-1, -1], [1, 1]];
 
 export default CONSTANTS;