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
    this.castle_dxy = this._detect_castle();
    this.destination = nav.getClosestKarbonite({x: pilgrim.me.x, y: pilgrim.me.y}, pilgrim.getKarboniteMap());
    this.origin = {x: this.pilgrim.me.x, y:this.pilgrim.me.y};
    this.path = new Path();
    this.deposit_path = undefined;
    this.path.make(this.pilgrim.map, this.pilgrim.my_pos(), [this.destination.x, this.destination.y], SPECS.UNITS[pilgrim.me.unit].SPEED);
    this.actions = this._make_actions();
  }

  initial_state() {
    return this.travel_to_resource_state;
  }

  check_state() {
    this.current_state = this.current_state();
  }

  act() {
    if (DEBUG) {
      this._log_state();
    }
    let action = this.actions.get(this.current_state);
    this.pilgrim.log("Current action " + action.toString());
    return action;
  }


  // STATES

  travel_to_resource_state() {
    if (this.path.at_path_end()) {
      return this.gather_state;
    }
    return this.travel_to_resource_state;
  }

  travel_to_castle_state() {
    if (this.path.at_path_end()) {
      return this.deposit_state;
    }
    return this.travel_to_castle_state;
  }

  gather_state() {
    this.path.reverse();
    return this.travel_to_castle_state;
  }

  deposit_state() {
    this.path.reverse();
    return this.travel_to_resource_state;
  }

  build_state() {
    return this.move_state;
  }

  // ACTIONS

  gather_action() {
    return this.pilgrim.mine();
  }

  travel_to_castle_action() {
    if (this.path.at_path_end()) {
      return; 
    }
    if (this.deposit_path === undefined) {
      this.deposit_path = new Path();
      this.deposit_path.make(
        this.pilgrim.map,
        this.pilgrim.my_pos(),
        this._detect_castle(),
        SPECS.UNITS[pilgrim.me.unit].SPEED);
    }
    let choice = this.path.next();
    return this.pilgrim.move(choice[0], choice[1]);
  }

  travel_to_resource_action() {
    if (this.path.at_path_end()) {
      return;
    }
    let choice = this.path.next();
    return this.pilgrim.move(choice[0], choice[1]);
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

