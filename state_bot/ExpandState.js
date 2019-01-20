import CONSTANTS from './constants.js';
import { SPECS } from 'battlecode';
import helper from './helper.js';
import nav from './nav.js';

/**
 * Makes the pilgrim find the nearest resource cluster and expand to it.
 */
export class ExpandState {
  constructor(pilgrim) {
    this.pilgrim = pilgrim;
    this.church_pos = nav.getExpansionLocs(this.pilgrim, {xlo:0, xhi:this.pilgrim.map.length, ylo:0, yhi:this.pilgrim.map.length}).pop();
    this.destination = this._pick_destination();
    this.current_state = new TravelState(this.pilgrim, this);
  }

  check_state() {
    this.current_state = this.current_state.check_state();
    return this;
  }

  get_expansion_destination() {
    return this.destination;
  }

  get_church_pos() {
    return this.church_pos;
  }

  act() {
    return this.current_state.act();
  }
  
  /**
   * Choose destination for pilgrim to travel to.
   */
  _pick_destination() {
    let possible_destinations = [];
    for (let adjDelta of CONSTANTS.ADJACENT_DELTAS) {
      let cell = [adjDelta[0] + this.pilgrim.my_pos()[0], adjDelta[1] + this.pilgrim.my_pos()[1]];
      if (!helper.is_occupied(this.pilgrim.getVisibleRobotMap(), cell) && helper.on_map(this.pilgrim.map.length, cell)) {
        if (this.pilgrim.map[cell[1]][cell[0]]) {
          possible_destinations.push(cell);
        }
      }
    }

    // If possible destinations failed will just travel to (0, 0). Probably want to change this.
    if (possible_destinations.length === 0) {
      return {x: 0, y: 0};
    }
    this.pilgrim.log("Chosen destination: " + possible_destinations[0].toString());
    return possible_destinations[0];
  }
}

class TravelState {
  constructor(pilgrim, parent) {
    this.pilgrim = pilgrim;
    this.parent = parent;
    this.path = helper.new_path(this.pilgrim.map, this.pilgrim.my_pos(), helper.convert_assoc_coord(this.parent.get_expansion_destination()), CONSTANTS.PILGRIM_SPEED);
  }

  check_state() {
    if (helper.same_position(this.pilgrim.my_pos(), helper.convert_assoc_coord(this.parent.get_expansion_destination()))) {
      return new BuildChurchState(this.pilgrim, this.parent);
    }
    return this;
  }

  act() {
    let next = this.path.next();
    return this.pilgrim.move(next[0], next[1]);
  }
}

class BuildChurchState {
  constructor(pilgrim, parent) {
    this.pilgrim = pilgrim;
    this.parent = parent;
  }

  check_state() {
    return new IdleState(this.pilgrim, this.parent);
  }

  act() {
    let buildDelta = {
       x: this.parent.get_church_pos().x - this.pilgrim.my_pos()[0],
       y: this.parent.get_church_pos().y - this.pilgrim.my_pos()[1]
    }
    return this.pilgrim.buildUnit(SPECS.CHURCH, buildDelta.x, buildDelta.y);
  }
}


class IdleState {
  constructor(pilgrim, parent) {
    this.pilgrim = pilgrim;
    this.parent = parent;
  }

  check_state() {
    return this;
  }

  act() {
    return;
  }
}