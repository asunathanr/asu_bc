class PilgrimState extends AbstractState {
  constructor(pilgrim) {
    super();
    this.pilgrim = pilgrim;
    this.destination;
    this.origin = [this.pilgrim.me.x, this.pilgrim.me.y];
  }

  checkState() {
    this.current_state = this.current_state();
  }

  act() {
    let action = undefined;
    let state = this.current_state;
    if (state === this.moveState) {
      action = this.pilgrim.move_unit();
    } else if (state === this.gatherState) {
      action = this.pilgrim.mine();
    } else {
    }
    return action;
  }

  initialState() {

  }

  moveState() {

  }

  gatherState() {

  }

  buildState() {
    
  }
}