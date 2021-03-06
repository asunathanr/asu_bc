import { BCAbstractRobot, SPECS } from 'battlecode';
import { isHorizontalReflection } from './horizontal_sym.js';
import nav from './nav.js';
import { END_OF_PATH, Path } from './path.js';
import { manhattan } from './pathfinder.js';


class CrusaderState {
  /**
   * CrusaderState is a finite state machine which handles behavior for a crusader.
   * @property current_state: When act is called the function stored in current_state will be called.
   * @property destination: A coordinate indicating the current destination.
   */
  constructor(crusader) {
    this.current_state = this.initialState;
    this.destination = nav.reflect({x:crusader.me.x, y:crusader.me.y}, crusader.map, isHorizontalReflection(crusader.map));
  }

  // Swap to different state. Next state will be performed next round
  change_state(new_state) {
    this.current_state = new_state;
  }

  // Perform tasks for current state.
  act(crusader) {
    return this.current_state(crusader);
  }

  // On creation deduce location of enemy castle and head for it.
  initialState(crusader) {
    crusader.make_path(crusader.my_pos(), [this.destination.x, this.destination.y]);
    this.change_state(this.moveState);
    return this.act(crusader);
  }

  /**
   * Keep moving along assigned path while able.
   * @todo Change state if destination reached.
   * @param {MyRobot} crusader 
   */
  moveState(crusader) {
    if (Math.floor(manhattan(crusader.my_pos(), [this.destination.x, this.destination.y])) === 1) {
      this.change_state(this.attackState);
      return this.act(crusader);
    }
    return crusader.move_unit();
  }

  /**
   * Attack an enemy in range.
   * @todo Swap to different state if no enemies in range. 
   * @param {MyRobot} crusader 
   */
  attackState(crusader) {
    var self = crusader;
    // get attackable robots
    var attackable = self.getVisibleRobots().filter((r) => {
      if (! self.isVisible(r)){
          return false;
      }
      const dist = (r.x-self.me.x)**2 + (r.y-self.me.y)**2;
      if (r.team !== self.me.team
          && SPECS.UNITS[SPECS.CRUSADER].ATTACK_RADIUS[0] <= dist
          && dist <= SPECS.UNITS[SPECS.CRUSADER].ATTACK_RADIUS[1]) {
          return true;
      }
      return false;
    });
    if (attackable.length > 0) {
      var r = attackable[0];
      crusader.log('' + r);
      crusader.log('attacking! ' + r + ' at loc ' + (r.x - crusader.me.x, r.y - crusader.me.y));
      return crusader.attack(r.x - crusader.me.x, r.y - crusader.me.y);
    }
    return;
  }

}

// Set of behaviors for a castle.
// A finite state machine
class CastleState {
  constructor() {
    this.currentState = this.initialState;
    this.build_q = [];
  }

  // SWAPPIN' STATE
  // https://www.youtube.com/watch?v=rcWhqrymYD8
  changeState(nextState) {
    this.currentState = nextState;
  }

  // Do castle stuff depending on current state.
  act(castle) {
    return this.currentState(castle);
  }

  // Build crusaders for the next 5 turns
  initialState(castle) {
    for (var i = 0; i < 4; ++i) {
      this.build_q.push(SPECS['CRUSADER']);
    }
    this.changeState(this.buildState);
    return;
  }

  // Pump out units in build queue one unit at a time.
  // If build q is exhausted it switches to idle state.
  buildState(castle) {
    if (this.build_q.length === 0) {
      this.changeState(this.idleState);
      return;
    }
    var unit = this.build_q.shift();
    var dAdj = [[0, 1], [1, 0], [-1, 0], [0, -1], [1, 1], [-1, -1], [-1, 1], [1, -1]];
    var adjCells = dAdj.map(function(adj) {
       return [castle.me.x + adj[0], castle.me.y + adj[1]]; 
    });
    var validCells = adjCells.filter(function(cell) { 
      return castle.getPassableMap()[cell[1], cell[0]];
    });
    var chosenPosIndex = Math.floor(Math.random() * validCells.length);
    var chosenPos = validCells[chosenPosIndex];
    var chosenDxy = [castle.me.x - chosenPos[0], castle.me.y - chosenPos[1]];
    return castle.buildUnit(unit, chosenDxy[1], chosenDxy[0]);
  }

  // Do nothing -- may update later to check for messages.
  idleState(castle) {
    return;
  }
}


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
    return state.act(this);
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
      state = new CastleState();
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
