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
    if (this.destination.x === this.pilgrim.my_pos()[0] && this.destination.y === this.pilgrim.my_pos()[1]) {
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
    return this.actions.get(this.current_state).bind(this)();
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
    if (this.destination.x !== this.pilgrim.my_pos()[0] && this.destination.y !== this.pilgrim.my_pos()[1]) {
      return this.travel_to_castle_state;
    } else {
      return this.gather_state;
    }
  }

  deposit_state() {
    return this.travel_to_resource_state;
  }

  build_state() {
    return this.move_state;
  }


  // ACTIONS

  gather_action() {
    this.pilgrim.make_path(this.pilgrim.my_pos(), [this.origin.x, this.origin.y]);
    return this.pilgrim.mine();
  }

  travel_to_castle_action() {
    if (self.pilgrim.at_goal()) {
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

