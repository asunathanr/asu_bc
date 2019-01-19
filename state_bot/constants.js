import { SPECS } from './battlecode';

/**
 * @file speeds.js
 * @author Nathan Robertson
 * Defines project constants
 */

 const CONSTANTS = {};

 CONSTANTS.CRUSADER_SPEED = SPECS.UNITS[SPECS.CRUSADER].SPEED;
 CONSTANTS.PILGRIM_SPEED = SPECS.UNITS[SPECS.PILGRIM].SPEED;
 CONSTANTS.PROPHET_SPEED = SPECS.UNITS[SPECS.PROPHET].SPEED;
 CONSTANTS.PREACHER_SPEED = SPECS.UNITS[SPECS.PREACHER].SPEED;

 
 CONSTANTS.ADJACENT_DELTAS = [[0, 1], [0, -1], [1, 0], [-1, 0], [-1, 1], [1, -1], [-1, -1], [1, 1]];

 CONSTANTS.DEBUG = true;
 
 export default CONSTANTS;