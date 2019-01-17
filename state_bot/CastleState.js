import { AbstractState } from './AbstractState.js';
import { SPECS } from 'battlecode';

const CRUSADER_TYPE = SPECS.CRUSADER;

/**
 * CastleState is the state machine for the Castle units
 * @property current_state: stores a function that when called in check_states will check game
 *           state and change state accordingly.
 * @property castle: stores the MyRobot object which contains this class.
 * @property build_locations: a list of potential build locations (passable).
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
        }
        return this.build_state;
    }

    /**
     * idle_state: checks if able to build more units
     * @returns if unable to build crusader, returns idle_state
     *          else returns build_state
     */
    idle_state () {
        if (SPECS.UNITS[CRUSADER_TYPE].CONSTRUCTION_FUEL > this.castle.fuel ||
            SPECS.UNITS[CRUSADER_TYPE].CONSTRUCTION_KARBONITE > this.castle.karbonite) {
                return this.idle_state;
        }
        return this.build_state;
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
            var chosenPosIndex = Math.floor(Math.random() * this.build_locations.length);
            var chosenPos = this.build_locations[chosenPosIndex];
            var chosenDxy = [this.castle.me.x - chosenPos[0], this.castle.me.y - chosenPos[1]];
            return this.castle.buildUnit(CRUSADER_TYPE, chosenDxy[1], chosenDxy[0]);
        }
        else if (this.current_state === this.idle_state) {
            return;
        }
        else {
            return Error("Invalid State, cannot act");
        }
    }
}