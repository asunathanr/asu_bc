import helper from './helper.js';
import { SPECS } from './battlecode';
import { manhattan } from './pathfinder.js';
import SPEEDS from './speeds.js';
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
        this.pilgrim.log("Castle is at " + robot.x.toString() + ',' + robot.y.toString());
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
    this.path = helper.new_path(
      this.pilgrim.map,
      this.pilgrim.my_pos(),
      [this.resource_location.x, this.resource_location.y], 
      SPEEDS.PILGRIM
    );
  }

  check_state() {
    if (this.path.at_path_end()) {
      return new LoopGather(this.pilgrim);
    }
    return this;
  } 

  act() {
    if (this.path.at_path_end()) {
      return;
    } 
    let next = this.path.next();
    return this.pilgrim.move(next[0], next[1]);
  }
  
  _pick_nearest_resource() {
    let nearest_karb = nav.getClosestKarbonite({x: pilgrim.me.x, y: pilgrim.me.y}, pilgrim.getKarboniteMap());
    let nearest_fuel = nav.getClosestKarbonite({x: pilgrim.me.x, y: pilgrim.me.y}, pilgrim.getFuelMap());
    let karb_dist = manhattan(this.pilgrim.my_pos(), [this.nearest_karb.x, this.nearest_karb.y]);
    let fuel_dist = manhattan(this.pilgrim.my_pos(), [this.nearest_fuel.x, this.nearest_fuel.y]);
    return nearest_karb ? Math.min(karb_dist, fuel_dist) : nearest_fuel;
  }
}

class LoopToCastle {
  constructor(pilgrim) {
    this.pilgrim = pilgrim;
    let castle = this._choose_dump_point();
    this.deposit_path = helper.new_path(this.pilgrim.map, this.pilgrim.my_pos(), castle, SPEEDS.PILGRIM);
  }

  check_state() {
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
        this.pilgrim.log("Castle is at " + robot.x.toString() + ',' + robot.y.toString());
        return [robot.x, robot.y];
      }
    }
    return Error('Error: No Castles were visible when trying to deduce a drop-off point.');
  }

  _choose_dump_point() {
    var castle = this._detect_castle();
    let adjPoints = [];
    for (let d of [[0, 1], [0, -1], [1, 0], [-1, 0], [-1, 1], [1, -1], [-1, -1], [1, 1]]) {
      
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