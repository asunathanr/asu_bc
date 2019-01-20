import { AbstractState } from './AbstractState.js';
import { LoopState } from './LoopState.js';
import { StationaryState } from './StationaryState.js';


/**
 * State machine to control pilgrim units.
 * @property current_state: Which state to act upon next.
 * @property {MyRobot} pilgrim: Reference to current pilgrim.
 */
export class PilgrimState extends AbstractState {
  constructor(pilgrim) {
    super();
    this.current_state = new InitialState(pilgrim);
    this.pilgrim = pilgrim;
  }

  check_state() {
    this.current_state = this.current_state.check_state();
  }

  act() {
    return this.current_state.act();
  }
}

/**
 * @property {MyRobot} pilgrim: Reference to current pilgrim bot.
 */
class InitialState {
  constructor(pilgrim) {
    this.pilgrim = pilgrim;
  }

  check_state() {
    let new_state;
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


