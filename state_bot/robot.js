import { BCAbstractRobot, SPECS } from 'battlecode';
import nav from './nav.js';
import { END_OF_PATH, Path } from './path.js';
import { manhattan } from './pathfinder.js';
import { CastleState } from './CastleState.js';
import { CrusaderState } from './CrusaderState.js';

var path = new Path();
var step = -1;
var state = undefined;

class MyRobot extends BCAbstractRobot {

  /**
   * @returns An action command (command pattern) that tells the API which action the robot
   *          should perform. If no action should be taken then just return; is fine.
   *          However make sure to have a return statement somewhere in this code.
   *          If no return statement is given a reference error will usually occur.
   */
  turn() {
    step++;

    if (state === undefined) {
      this.assign_state(this.me.unit);
    }
    state.check_state();
    return state.act();
  }

  /**
   * Procedure to assign the correct state for the current unit.
   * Is an instance of the factory method design pattern.
   * https://sourcemaking.com/design_patterns/factory_method
   * @param unit_type The current unit's build info.
   * @returns undefined
   */
  assign_state(unit_type) {
    if (unit_type === SPECS.CRUSADER) {
      state = new CrusaderState(this);
    } else if (unit_type === SPECS.CASTLE) {
      state = new CastleState(this);
    }
    else {
      throw Error('NO STATE!!!');
    }
  }

  /**
   * @returns All visible enemies in range.
   */
  visible_enemies() {
    enemies = [];
    for (var robot of this.getVisibleRobots()) {
      if (this.is_enemy(robot)) {
        enemies.push(robot);
      }
    }
    return enemies;
  }

  /**
   * Is robot on enemy team?
   * @returns boolean
   */
  is_enemy(robot) {
    return robot.team !== this.me.team;
  }

  /**
   * Attack enemy robot.
   * @param enemy 
   */
  attack_enemy(enemy) {
    return this.attack(this.me.x - enemy[0], this.me.y - enemy[1]);
  }

  move_unit() {
    if (!path.valid()) {
      this.log("Crusader: " + this.me.id.toString() + " is trying to move on invalid path.");
      return;
    }
    var choice = path.next();
    if (choice === END_OF_PATH) {
      return;
    } else {
      return this.move(choice[0], choice[1]);
    }
    
  }

  radius(pos, r) {
    var coords = [];
    for (var i = pos[0] - r; i < pos[0] + r; ++i) {
      for (var j = pos[1] - r; j < pos[1] + r; ++j) {
        if (i !== 0 && j !== 0) {
          coords.push([i, j]);
        }
      }
    }
    return coords;
  }

  my_pos() {
    return [this.me.x, this.me.y];
  }

  make_path(start, goal) {
    path.make(this.getPassableMap(), start, goal, SPECS.UNITS[this.me.unit].SPEED);
  }

  /**
   * Describes a value and logs it into the battlecode log system.
   * @param {string} desc 
   * @param {string} value 
   */
  log_value(desc, value) {
    this.log(desc + value);
  }

}

var robot = new MyRobot();