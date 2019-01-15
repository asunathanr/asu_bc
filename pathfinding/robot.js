import { BCAbstractRobot, SPECS } from 'battlecode';
import Path from 'path.js';
import { best_first_search, manhattan } from 'pathfinder.js';



function valid_coord(grid, coord) {
  return coord[0] > -1 && coord[1] > -1 && coord[0] < grid.length && coord[1] < grid.length;
}

// Controls behavior for crusader.
class CrusaderState {
  constructor(crusader) {
    this.current_state = this.initialState;
    var x = crusader.me.x;
    var y = crusader.me.y;
    this.destination = {x:0,y:0};
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
    function find_enemy_castle(my_x, y) {
      var midpoint = crusader.getPassableMap().length / 2;
      return [0, 0];
    }
    crusader.make_path(crusader.my_pos(), [0, 0]);
    this.change_state(this.moveState);
    return this.act(crusader);
  }

  moveState(crusader) {
    if (Math.floor(manhattan(crusader.my_pos(), [this.destination.x, this.destination.y])) === 1) {
      this.change_state(this.attackState);
      return this.act(crusader);
    }
    return crusader.move_unit();
  }

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
    castle.log("In build state");
    if (this.build_q.length === 0) {
      this.changeState(this.idleState);
      return;
    }
    var unit = this.build_q.shift();
    var dAdj = [[0, 1], [1, 0], [-1, 0], [0, -1], [1, 1], [-1, -1], [-1, 1], [1, -1]];
    var adjCells = dAdj.map(function(adj) { return [castle.me.x + adj[0], castle.me.y + adj[1]]; });
    var validCells = adjCells.filter(function(cell) { 
      return castle.getPassableMap()[cell[1], cell[0]];
    });
    var chosenPosIndex = Math.floor(Math.random() * validCells.length);
    var chosenPos = validCells[chosenPosIndex];
    var chosenDxy = [castle.me.x - chosenPos[0], castle.me.y - chosenPos[1]];
    castle.log("Unit" + unit.toString());
    castle.log("Position: " + chosenDxy.toString());
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

  turn() {
    step++;

    if (state === undefined) {
      this.assign_state(this.me.unit);
    }
    return state.act(this);
  }

  assign_state(unit_type) {
    if (unit_type === SPECS.CRUSADER) {
      state = new CrusaderState(this);
    } else if (unit_type === SPECS.CASTLE) {
      state = new CastleState();
    }
  }

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

  rand_coord() {
    var n = this.radius(this.my_pos(), 3);
    var filtered_coords = [];
    for (var i = 0; i < n.length; ++i) {
      var neighbor_x = n[i][0];
      var neighbor_y = n[i][1];
      if (this.getPassableMap()[neighbor_y][neighbor_x]
           && valid_coord(this.getPassableMap(), [neighbor_x, neighbor_y])) {
        filtered_coords.push(n[i]);
      }
    }

    var pos = Math.floor(Math.random() * filtered_coords.length);
    this.log(filtered_coords.length);
    return filtered_coords[pos];
  }

  make_path(start, goal) {
    path.make(this.getPassableMap(), start, goal, SPECS.UNITS[this.me.unit].SPEED);
  }

  log_value(desc, value) {
    this.log(desc + value.toString());
  }

}


var robot = new MyRobot();

