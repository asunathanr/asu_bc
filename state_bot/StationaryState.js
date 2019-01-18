import { Path } from './path.js';
import helper from './helper.js';
import { SPECS } from 'battlecode';

/**
 * Performs behavior for a pilgrim without movement.
 */
export class StationaryState {
  constructor(pilgrim) {
    this.pilgrim = pilgrim;
    this.pilgrim.log("Pilgrim " + pilgrim.me.id.toString() + " is in stationary state");
    this.state = new StationaryGather(this.pilgrim);
  }

  check_state() {
    this.state = this.state.check_state();
    return this;
  } 

  act() {
    return this.state.act();
  }
}


/**
 * 
 */
class StationaryDeposit {
  constructor(pilgrim) {
    this.pilgrim = pilgrim;
    this.castle_pos = this._detect_castle();
  }

  check_state() {
    if (this.pilgrim.me.karbonite > 0 || this.pilgrim.me.fuel > 25) {
      return this;
    }
    return new StationaryGather(this.pilgrim);
  }

  act() {
    let castle_dxy = {x: this.castle_pos[0] - this.pilgrim.me.x, y: this.castle_pos[1] - this.pilgrim.me.y};
    if (this.pilgrim.me.karbonite > 0) {
      return this.pilgrim.give(castle_dxy.x, castle_dxy.y, this.pilgrim.me.karbonite, 0);
    } else if (this.pilgrim.me.fuel > 0) {
      return this.pilgrim.give(castle_dxy.x, castle_dxy.y, 0, this.pilgrim.me.fuel);
    }
    else {
      return;
    }
  }

  _detect_castle() {
    for (let robot of this.pilgrim.getVisibleRobots()) {
      if (robot.unit === SPECS.CASTLE) {
        this.pilgrim.log("Castle is at " + robot.x.toString() + ',' + robot.y.toString());
        return [robot.x, robot.y];
      }
    }
    return Error('Error: No Castles were visible when trying to deduce a drop-off point.');
  }

}


/**
 * Gather resources in location.
 */
class StationaryGather {
  constructor(pilgrim) {
    this.pilgrim = pilgrim;
  }

  check_state() {
    if (this.pilgrim.me.karbonite >= SPECS.UNITS[SPECS.PILGRIM].KARBONITE_CAPACITY
      || this.pilgrim.me.fuel >= SPECS.UNITS[SPECS.PILGRIM].FUEL_CAPACITY) {
     return new StationaryDeposit(this.pilgrim);
   } else {
     return this;
   }
  }

  act() {
    return this.pilgrim.mine();
  }
}