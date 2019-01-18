import { AbstractState } from './AbstractState.js';
import { SPECS } from './battlecode';
import { Path } from './path.js';
import nav from 'nav.js';

const DEBUG = true;

/**
 * State machine to control pilgrim units.
 * @property actions: A map of pilgrim states to pilgrim actions.
 * @property current_state: Which state to act upon next.
 * @property {MyRobot} pilgrim: The pilgrim to API interface class.
 * @property castle_dxy: Where to deposit resources.
 * @property destination: Resource location.
 * @property path: The set path between resource cell and delivery position.
 */
export class PilgrimState extends AbstractState {
  constructor(pilgrim) {
    super();
    this.current_state = this.initial_state;
    this.pilgrim = pilgrim;
    this.destination = nav.getClosestKarbonite({x: pilgrim.me.x, y: pilgrim.me.y}, pilgrim.getKarboniteMap());
    this.origin = {x: this.pilgrim.me.x, y: this.pilgrim.me.y};
    this.pilgrim.make_path(this.pilgrim.my_pos(), [this.destination.x, this.destination.y]);
    this.actions = this._make_actions();
  }

  initial_state() {
    if (this.pilgrim.getKarboniteMap()[this.pilgrim.me.y][this.pilgrim.me.x] ||
        this.pilgrim.getFuelMap()[this.pilgrim.me.y][this.pilgrim.me.x]) {
      return this.gather_state;
    } else {
      return this.travel_to_resource_state;
    }
  }

  check_state() {
    this.current_state = this.current_state();
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
    if (this.pilgrim.at_goal()) {
      return this.gather_state;
    }
    return this.travel_to_resource_state;
  }

  travel_to_castle_state() {
    if (this.pilgrim.at_goal()) {
      return this.deposit_state;
    }
    return this.travel_to_castle_state;
  }

  gather_state() {
    if (this.pilgrim.me.karbonite === SPECS.UNITS[this.pilgrim.me.unit].KARBONITE_CAPACITY
       || this.pilgrim.me.fuel === SPECS.UNITS[this.pilgrim.me.unit].FUEL_CAPACITY) {
      let castle = this._detect_castle();
      this.pilgrim.make_path(this.pilgrim.my_pos(), [castle.x, castle.y]);
      return this.travel_to_castle_state;
    } else {
      return this.gather_state;
    }
  }

  deposit_state() {
    if (this.pilgrim.me.karbonite > 0 || this.pilgrim.me.fuel > 25) {
      return this.deposit_state;
    }
    this.pilgrim.make_path(this.pilgrim.my_pos(), [this.origin.x, this.origin.y]);
    return this.travel_to_castle_state;
  }

  build_state() {
    return this.move_state;
  }


  // ACTIONS

  deposit_action() {
    if (this.pilgrim.me.karbonite > 0) {
      let castle_pos = this._detect_castle();
      let castle_dxy = {x: castle_pos[0] - this.pilgrim.me.x, y: castle_pos[1] - this.pilgrim.me.y};
      return this.pilgrim.give(castle_dxy.x, castle_dxy.y, this.pilgrim.karbonite, 0);
    } 
    else {
      return;
    }
    
  }

  gather_action() {
    return this.pilgrim.mine();
  }

  travel_to_castle_action() {
    if (this.pilgrim.at_goal()) {
      return; 
    }
    return this.pilgrim.move_unit();
  }

  travel_to_resource_action() {
    if (this.pilgrim.at_goal()) {
      return;
    }
    return this.pilgrim.move_unit();
  }

  build_action() {
    return;
  }

  _detect_castle() {
    for (let robot of this.pilgrim.getVisibleRobots()) {
      if (robot.unit === SPECS['CASTLE']) {
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
}

