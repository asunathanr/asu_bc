import AbstractState from './abstract_state.js';


class PilgrimState extends AbstractState {
  constructor(pilgrim) {
    super();
    this.pilgrim = pilgrim;
    this.destination;
    this.origin = [this.pilgrim.me.x, this.pilgrim.me.y];
  }

  check_state() {
    this.current_state = this.current_state();
  }

  act() {
    let action = null;
    let state = this.current_state;
    if (state === this.move_state) {
      action = this.pilgrim.move_unit();
    } else if (state === this.gather_state) {
      action = this.pilgrim.mine();
    } else {
    }
    return action;
  }

  initial_state() {
    this.current_state = this.move_state;
  }

  move_state() {
    if (this.pilgrim.me.x === this.destination[0]
        && this.pilgrim.me.y === this.destination[1]) {
          this.current_state = this.gather_state;
    }
  }

  gather_state() {
    this.pilgrim.make_path(this.destination, this.origin);
    this.current_state = this.move_state;
  }

  build_state() {
    this.current_state
  }
}