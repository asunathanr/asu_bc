import { AbstractState } from './AbstractState.js';
import { SPECS } from 'battlecode';

const CRUSADER_TYPE = SPECS.CRUSADER;
const PILGRIM_TYPE = SPECS.PILGRIM;

/**
 * CastleState is the state machine for the Castle units
 * @property current_state: stores a function that when called in check_states will check game
 *           state and change state accordingly.
 * @property castle: stores the MyRobot object which contains this class.
 * @property build_locations: a list of potential build locations (passable).
 * @property attackable: robots in attack range of the castle.
 */
export class CastleState extends AbstractState {

    /**
     * @param castle: is the MyRobot object (would be this the the clas that contains this class)
     */
    constructor (castle) {
        super(castle);
        this.current_state = this.initial_state; //all robots start at an initial state
        this.castle = castle;
        this.build_locations = [];
        this.empty_resource_cells = [];
        this.prev_unit = null;
        this.attackable = [];
    }

    /**
     * initial_state: calculates potential build locations for use in build_state
     * @returns if unable to build crusader, returns idle_state
     *          else returns build_state
     */
    initial_state () {
        //calculate a valid build locations
        const dAdj = [[0, 1], [1, 0], [-1, 0], [0, -1], [1, 1], [-1, -1], [-1, 1], [1, -1]];
        let castle = this.castle;
        var adjCells = dAdj.map(function(adj) {
            return [castle.me.x + adj[0], castle.me.y + adj[1]]; 
        });
        this.build_locations = adjCells.filter(function(cell) { 
            return castle.getPassableMap()[cell[1], cell[0]];
        });
        
        this.empty_resource_cells = this.build_locations.filter((cell) => {
            return this.castle.getKarboniteMap()[cell[1]][cell[0]] || this.castle.getFuelMap()[cell[1]][cell[0]];
        });

        //check if able to build crusader
        if (SPECS.UNITS[CRUSADER_TYPE].CONSTRUCTION_FUEL > this.castle.fuel &&
            SPECS.UNITS[CRUSADER_TYPE].CONSTRUCTION_KARBONITE > this.castle.karbonite) {
                return this.idle_state;
        }

        return this.build_state;
    }

    /**
     * build_state: checks if able to build more units
     * @returns if unable to build crusader, returns idle_state
     *          else returns build_state
     */
    build_state () {
        if (SPECS.UNITS[CRUSADER_TYPE].CONSTRUCTION_FUEL > this.castle.fuel ||
            SPECS.UNITS[CRUSADER_TYPE].CONSTRUCTION_KARBONITE > this.castle.karbonite) {
                return this.idle_state;
        } else 
        return this.build_state;
    }

    attack_state() {
        // get attackable robots
	    this.attackable = this.castle.getAttackableRobots();
        //if attackable units, go to attack_state
        if(this.attackable.length > 0){
            return this.attack_state;
        }
        else if (SPECS.UNITS[CRUSADER_TYPE].CONSTRUCTION_FUEL > this.castle.fuel ||
            SPECS.UNITS[CRUSADER_TYPE].CONSTRUCTION_KARBONITE > this.castle.karbonite) {
                return this.idle_state;
        }
        return this.build_state;
    }

    /**
     * idle_state: checks if able to build more units
     * @returns if unable to build crusader, returns idle_state
     *          else returns build_state
     */
    idle_state () {
        if (SPECS.UNITS[CRUSADER_TYPE].CONSTRUCTION_FUEL < this.castle.fuel &&
            SPECS.UNITS[CRUSADER_TYPE].CONSTRUCTION_KARBONITE < this.castle.karbonite) {
                return this.build_state;
        }
        this.attackable = this.castle.getAttackableRobots();
        //if attackable units, go to attack_state
        if(this.attackable.length > 0){
            return this.attack_state;
        }
        return this.idle_state;
    }

    /**
     * check_state changes the current_state based on the game state of unit
     */
    check_state () {
        this.current_state = this.current_state();
    }

    /**
     * @returns the action to be done by castle based on the current state
     */
    act() {
        if(this.current_state === this.initial_state) {
            return Error("should not act on initial_state");
        }
        else if (this.current_state === this.build_state) {
            let chosenDxy = this.pick_spawn_location();
            let build_type = this.pick_unit();
            this.prev_unit = build_type;
            return this.castle.buildUnit(build_type, chosenDxy[1], chosenDxy[0]);
        }
        else if (this.current_state === this.idle_state) {
            return;
        }
        else if (this.current_state === this.attack_state){
            var r = this.attackable[0];
            return this.castle.attack(r.x - this.castle.me.x, r.y - this.castle.me.y);
        }
        else {
            return Error("Invalid State, cannot act");
        }
    }

    /**
     * Picks which unit to build.
     * Hides unit decision logic from other parts of code.
     * @returns Which unit to build.
     */
    pick_unit() {
        let unit = CRUSADER_TYPE;
        if (this.prev_unit !== null) {
            unit = CRUSADER_TYPE;
        } 
        else {
            unit = PILGRIM_TYPE;
        }
        return unit;
    }

    // Decide spawn location for pilgrim
    pick_spawn_location() {
        var chosenPosIndex = Math.floor(Math.random() * this.build_locations.length);
        var chosenPos = this.build_locations[chosenPosIndex];
        var chosenDxy = [this.castle.me.x - chosenPos[0], this.castle.me.y - chosenPos[1]];
        let build_type = this.pick_unit();
        if (build_type === PILGRIM_TYPE) {
            chosenPos = this.empty_resource_cells.pop();
            chosenDxy = [this.castle.me.x - chosenPos[0], this.castle.me.y - chosenPos[1]];
        }
        return chosenDxy;
    }
}