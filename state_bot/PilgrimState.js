import { AbstractState } from './AbstractState.js';
import { SPECS } from './battlecode';
import { Path } from './path.js';
import nav from 'nav.js';


/**
 * State machine to control pilgrim units.
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
    this.path.make(this.pilgrim.map, this.pilgrim.my_pos(), [this.destination.x, this.destination.y], SPECS.UNITS[pilgrim.me.unit].SPEED);
  }

  initial_state() {
    return this.travel_to_resource_state;
  }

  check_state() {
    this.current_state = this.current_state();
  }

  act() {
    let action = null;
    let state = this.current_state;
    if (state === this.move_state && !this.path.at_path_end()) {
      let choice = this.path.next();
      action = this.pilgrim.move(choice[0], choice[1]);
    } 
    else if (state === this.gather_state) {
      action = this.pilgrim.mine();
    } 
    else if (state === this.deposit_state) {
      action = this.pilgrim.give(this.castle_dxy.x, this.castle_dxy.y);
      this.pilgrim.log("Current karbonite: " + this.pilgrim.karbonite);
    } 
    else {
    }
    return action;
  }

  
  travel_to_resource_state() {
    if (this.path.at_path_end() && this.pilgrim.karbonite == 0) {
      return this.gather_state;
    }
    return this.travel_to_resource_state;
  }

  travel_to_castle_state() {
    if (this.path.at_path_end() && this.pilgrim.karbonite > 0) {
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

  _detect_castle() {
    for (let robot of this.pilgrim.getVisibleRobots()) {
      if (robot.unit === SPECS['CASTLE']) {
        return {x: robot.x - this.pilgrim.me.x, y: robot.y - this.pilgrim.me.y};
      }
    }
    return Error('Error: No Castles were visible when trying to deduce a drop-off point.');
  }
}

