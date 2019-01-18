import { AbstractState } from './AbstractState.js';
import { SPECS } from './battlecode';
import { LoopState } from './pilgrim_state/LoopState.js';
import { StationaryState } from './pilgrim_state/StationaryState.js';
import SPEEDS from './speeds.js';
import helper from './helper.js';
import nav from 'nav.js';

const DEBUG = true;

/**
 * State machine to control pilgrim units.
 * @property actions: A map of pilgrim states to pilgrim actions.
 * @property current_state: Which state to act upon next.
 * @property {MyRobot} pilgrim: The pilgrim to API interface class.
 * @property castle_pos: Where to deposit resources.
 * @property destination: Resource location.
 * @property path: The set path between resource cell and delivery position.
 */
export class PilgrimState extends AbstractState {
  constructor(pilgrim) {
    super();
    this.current_state = this.initial_state;
    this.pilgrim = pilgrim;
    this.castle_pos = this._detect_castle();
    this.resource_location = nav.getClosestKarbonite({x: pilgrim.me.x, y: pilgrim.me.y}, pilgrim.getKarboniteMap());
    this.deposit_path = null;
    this.gather_path = null;
    this.origin = {x: this.pilgrim.me.x, y: this.pilgrim.me.y};
    this.actions = this._make_actions();
  }

  initial_state() {
    if (this.pilgrim.getKarboniteMap()[this.pilgrim.me.y][this.pilgrim.me.x] ||
        this.pilgrim.getFuelMap()[this.pilgrim.me.y][this.pilgrim.me.x]) {
          return new StationaryState(this.pilgrim);
    }
    return new LoopState(this.pilgrim);
  }

  check_state() {
    this.current_state = this.current_state.check_state();
  }

  act() {
    if (DEBUG) {
      this._log_state();
    }
    let action = this.actions.get(this.current_state);
    if (action === undefined) {
      this.pilgrim.log("Undefined action! Current state: " + this.current_state.toString());
      return;
    }
    return action.bind(this)();
  }


  // STATES

  travel_to_resource_state() {
    if (this.gather_path === null) {
      this.gather_path = helper.new_path(
        this.pilgrim.map,
        this.pilgrim.my_pos(),
        [this.resource_location.x,
        this.resource_location.y], 
        SPEEDS.PILGRIM
      );
    }
    if (this.gather_path.at_path_end()) {
      this.gather_path.reset();
      return this.gather_state;
    }
    return this.travel_to_resource_state;
  }

  travel_to_castle_state() {
    if (this.deposit_path === null) {
      let castle = this._choose_dump_point();
      this.deposit_path = helper.new_path(this.pilgrim.map, this.pilgrim.my_pos(), [castle.x, castle.y], SPEEDS.PILGRIM);
    } 
    if (this.deposit_path.at_path_end()) {
      return this.deposit_state;
    }
    return this.travel_to_castle_state;
  }

  gather_state() {
    if (this.pilgrim.me.karbonite >= SPECS.UNITS[SPECS.PILGRIM].KARBONITE_CAPACITY
       || this.pilgrim.me.fuel >= SPECS.UNITS[SPECS.PILGRIM].FUEL_CAPACITY) {
      return this.travel_to_castle_state;
    } else {
      return this.gather_state;
    }
  }

  deposit_state() {
    if (this.pilgrim.me.karbonite > 0 || this.pilgrim.me.fuel > 25) {
      return this.deposit_state;
    }
    return this.travel_to_resource_state;
  }

  build_state() {
    return this.move_state;
  }


  // ACTIONS

  deposit_action() {
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

  gather_action() {
    return this.pilgrim.mine();
  }

  travel_to_castle_action() {
    if (this.deposit_path === null) {
      let castle = this._choose_dump_point();
      this.deposit_path = helper.new_path(this.pilgrim.map, this.pilgrim.my_pos(), castle, SPEEDS.PILGRIM);
    } 
    if (this.deposit_path.empty() || this.deposit_path.at_path_end()) {
      return; 
    }
    let next = this.deposit_path.next();
    this.pilgrim.log("Next cell for pilgrim: " + next.toString());
    return this.pilgrim.move(next[0], next[1]);
  }

  travel_to_resource_action() {
    
    if (this.gather_path.at_path_end()) {
      return;
    } 
    this.pilgrim.log('Is path valid? ' + this.gather_path.valid().toString());
    let next = this.gather_path.next();
    return this.pilgrim.move(next[0], next[1]);
  }

  build_action() {
    return;
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

  _log_state() {
    let str = '';
    if (this.current_state === this.gather_state) {
      str = "Pilgrim " + this.pilgrim.id.toString() + " is gathering resources.";
    } else if (this.current_state === this.deposit_state) {
      str = "Pilgrim " + this.pilgrim.id.toString() + " is depositing resources.";
    } else if (this.current_state === this.travel_to_castle_state) {
      str = "Pilgrim is traveling to castle";
    } else if (this.current_state === this.travel_to_resource_state) {
      str = "Pilgrim is traveling to resource";
    } else {
      str = "Unknown state";
    }
    this.pilgrim.log(str);
  }

  _make_actions() {
    let actions = new Map();
    actions.set(this.gather_state, this.gather_action);
    actions.set(this.deposit_state, this.deposit_action);
    actions.set(this.travel_to_castle_state, this.travel_to_castle_action);
    actions.set(this.travel_to_resource_state, this.travel_to_resource_action);
    actions.set(this.build_state, this.build_action);
    return actions;
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

  _get_path(start, end) {
    return helper.new_path(this.pilgrim.map, start, end);
  }
}

