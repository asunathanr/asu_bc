import helper from './helper.js';
import { SPECS } from './battlecode';
import { manhattan, neighbors } from './pathfinder.js';
import CONSTANTS from './constants.js';
import nav from './nav.js';

/**
 * Performs behavior for a pilgrim with movement.
 */
export class LoopState {
  constructor(pilgrim) {
    this.pilgrim = pilgrim;
    this.pilgrim.log("Pilgrim " + pilgrim.me.id.toString() + " is in loop state");
    this.state = new LoopToDest(this.pilgrim);
  }

  check_state() {
    this.state = this.state.check_state();
    return this;
  }

  act() {
    return this.state.act();
  }
}


class LoopDeposit {
  constructor(pilgrim) {
    this.pilgrim = pilgrim;
    this.castle_pos = this._detect_castle();
  }

  check_state() {
    if (this.pilgrim.me.karbonite > 0 || this.pilgrim.me.fuel > 25) {
      return this;
    }
    return new LoopToDest(this.pilgrim);
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
        return [robot.x, robot.y];
      }
    }
    return Error('Error: No Castles were visible when trying to deduce a drop-off point.');
  }
}

class LoopGather {
  constructor(pilgrim) {
    this.pilgrim = pilgrim;
  }

  check_state() {
    if (this.pilgrim.me.karbonite >= SPECS.UNITS[SPECS.PILGRIM].KARBONITE_CAPACITY
      || this.pilgrim.me.fuel >= SPECS.UNITS[SPECS.PILGRIM].FUEL_CAPACITY) {
     return new LoopToCastle(this.pilgrim);
    } 
    else {
     return this;
    }
  } 

  act() {
    return this.pilgrim.mine();
  }
}

class LoopToDest {
  constructor(pilgrim) {
    this.pilgrim = pilgrim;
    this.resource_location = this._pick_nearest_resource();
    this.pilgrim.log("Traveling to resource location: " + this.resource_location.x.toString() + ','+ this.resource_location.y.toString());
    this.path = helper.new_path(
      this.pilgrim.map,
      this.pilgrim.my_pos(),
      [this.resource_location.x, this.resource_location.y], 
      CONSTANTS.PILGRIM_SPEED
    );
  }

  check_state() {
    if (helper.is_adjacent(this.pilgrim.my_pos(), [this.resource_location.x, this.resource_location.y])) {
      return new LoopGather(this.pilgrim);
    }
    if (this.path.at_path_end()) {
      return new LoopGather(this.pilgrim);
    }
    return this;
  } 

  act() {
    if (neighbors(this.pilgrim.map, this.pilgrim.my_pos(), CONSTANTS.PILGRIM_SPEED).has([this.resource_location.x, this.resource_location.y])) {
      return this.pilgrim.move(this.resource_location.x - this.pilgrim.my_pos()[0], this.resource_location.y - this.pilgrim.my_pos()[1]);
    }
    if (this.path.at_path_end()) {
      return;
    } 
    let next = this.path.next();
    return this.pilgrim.move(next[0], next[1]);
  }
  
  _pick_nearest_resource() {
    let nearest_karb = nav.getClosestKarbonite({x: this.pilgrim.me.x, y: this.pilgrim.me.y}, this.pilgrim.getKarboniteMap());
    let nearest_fuel = nav.getClosestKarbonite({x: this.pilgrim.me.x, y: this.pilgrim.me.y}, this.pilgrim.getFuelMap());
    let karb_dist = manhattan(this.pilgrim.my_pos(), [nearest_karb.x, nearest_karb.y]);
    let fuel_dist = manhattan(this.pilgrim.my_pos(), [nearest_fuel.x, nearest_fuel.y]);
    if (Math.floor(Math.min(karb_dist, fuel_dist)) === karb_dist) {
      return nearest_karb;
    } else {
      return nearest_fuel;
    }
  }
}

class LoopToCastle {
  constructor(pilgrim) {
    this.pilgrim = pilgrim;
    this.castle = this._choose_dump_point();
    this.deposit_path = helper.new_path(this.pilgrim.map, this.pilgrim.my_pos(), this.castle, CONSTANTS.PILGRIM_SPEED);
  }

  check_state() {
    if (helper.is_adjacent(this.pilgrim.my_pos(), this.castle)) {
      return new LoopDeposit(this.pilgrim);
    }
    if (this.deposit_path.at_path_end()) {
      return new LoopDeposit(this.pilgrim);
    }
    return this;
  } 

  act() {
    if (this.deposit_path.at_path_end()) {
      return; 
    }
    let next = this.deposit_path.next();
    this.pilgrim.log("Next cell for pilgrim: " + next.toString());
    return this.pilgrim.move(next[0], next[1]);
  }

  _detect_castle() {
    for (let robot of this.pilgrim.getVisibleRobots()) {
      if (robot.unit === SPECS.CASTLE) {
        return [robot.x, robot.y];
      }
    }
    return Error('Error: No Castles were visible when trying to deduce a drop-off point.');
  }

  /**
   * Pick an adjacent tile next to castle
   */
  _choose_dump_point() {
    var castle = this._detect_castle();
    let adjPoints = [];
    for (let d of CONSTANTS.ADJACENT_DELTAS) {
      
      adjPoints.push([castle[0] + d[0], castle[1] + d[1]]);
    }
    let emptyAdjPoints = [];
    for (var adj of adjPoints) {
      if (this.pilgrim.map[adj[1]][adj[0]]) {
        emptyAdjPoints.push(adj);
      }
    }
    return emptyAdjPoints[Math.floor(Math.random() * emptyAdjPoints.length)];
  }
}