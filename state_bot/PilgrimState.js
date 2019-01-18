import { AbstractState } from './AbstractState.js';
import { SPECS } from './battlecode';
import { LoopState } from './LoopState.js';
import { StationaryState } from './StationaryState.js';
import SPEEDS from './speeds.js';
import helper from './helper.js';
import nav from 'nav.js';

const DEBUG = true;

class InitialState {
  constructor(pilgrim) {
    this.pilgrim = pilgrim;
  }

  check_state() {
    var new_state;
    if (this.pilgrim.getKarboniteMap()[this.pilgrim.me.y][this.pilgrim.me.x] ||
        this.pilgrim.getFuelMap()[this.pilgrim.me.y][this.pilgrim.me.x]) {
          new_state = new StationaryState(this.pilgrim);
    } else {
      new_state = new LoopState(this.pilgrim);
    }
    new_state.check_state();
    return new_state;
  }
}


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
    this.current_state = new InitialState(pilgrim);
    this.pilgrim = pilgrim;
    this.resource_location = nav.getClosestKarbonite({x: pilgrim.me.x, y: pilgrim.me.y}, pilgrim.getKarboniteMap());
    this.deposit_path = null;
    this.gather_path = null;
  }

  check_state() {
    this.current_state = this.current_state.check_state();
  }

  act() {
    return this.current_state.act();
  }
}


