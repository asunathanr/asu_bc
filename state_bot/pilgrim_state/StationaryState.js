import { Path } from '../path.js';
import helper from '../helper.js';

/**
 * Performs behavior for a pilgrim without movement.
 */
export class StationaryState {
  constructor(pilgrim) {
    this.pilgrim = pilgrim;
  }

  initial_state() {
    this.state = new StationaryGather(this.pilgrim);
  }

  check_state() {
    this.state = this.state.check_state();
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