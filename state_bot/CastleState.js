import { AbstractState } from './AbstractState.js';
import { SPECS } from 'battlecode';
import nav from './nav.js';
import helper from './helper.js';

const CRUSADER_TYPE = SPECS.CRUSADER;
const PILGRIM_TYPE = SPECS.PILGRIM;
const MAX_VISIBLE_PILGRIMS = 3;

/**
 * CastleState is the state machine for the Castle units
 * @property current_state: stores a function that when called in check_states will check game
 *           state and change state accordingly.
 * @property castle: stores the MyRobot object which contains this class.
 * @property build_locations: a list of potential build locations (passable).
 * @property attackable: robots in attack range of the castle.
 * @property my_half: {xlo,xhi,ylo,yhi} object containg bounds describing this units half of the map.
 * @property units: dictionary of r.id:r.unit
 * @property unit_counts: dictionary of r.unit:unit_count
 * @property my_castle_locations: list of coordinate objects where my castles are.
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
        this.my_half = {xlo:0, xhi:this.castle.map.length, ylo:0, yhi:this.castle.map.length};
        this.units = new Map();
        this.unit_counts = {'0':0,'1':0,'2':0,'3':0,'4':0,'5':0};
        this.my_castles = [];
    }

    /**
     * initial_state: calculates potential build locations for use in build_state
     * @returns if unable to build crusader, returns idle_state
     *          else returns build_state
     */
    initial_state () {
        //get location of other castles
        this.my_castles = this.castle.getVisibleRobots();

        //calculate a valid build locations
        const dAdj = [[0, 1], [1, 0], [-1, 0], [0, -1], [1, 1], [-1, -1], [-1, 1], [1, -1]];
        let castle = this.castle;
        var adjCells = dAdj.map(function(adj) {
            return [castle.me.x + adj[0], castle.me.y + adj[1]]; 
        });
        this.build_locations = adjCells.filter(function(cell) { 
            return castle.getPassableMap()[cell[1], cell[0]];
        });
        
        //calculate my_half bounds
        this.my_half = nav.getHalfBounds({x:this.castle.me.x,y:this.castle.me.y},this.castle.map);
        
        /*
        let expansionLocs = nav.getExpansionLocs(this.castle,this.my_half);
        while(expansionLocs.size() > 0){
            let loc = expansionLocs.pop();
            this.castle.log("Expansion location at: " + loc['x'] +','+ loc['y']);
        }
        */
        
        // Unassigned resource cells in build location
        if (this.build_locations.length > 0) {
            this.empty_resource_cells = [];
            for (let cell of this.build_locations) {
                if (castle.getKarboniteMap()[cell[1]][cell[0]] || castle.getFuelMap()[cell[1]][cell[0]]) {
                    this.empty_resource_cells.push(cell);
                }
            }
        }

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
        //this.castle.castleTalk(this.castle.me.unit);
        //update number of each unit
        this.unit_counts = {'0':0,'1':0,'2':0,'3':0,'4':0,'5':0};
        let radioing = this.castle.getVisibleRobots();
        let tempMap = new Map();
        for(let r of radioing){
            if(this.units.has(r.id)){
                tempMap.set(r.id,this.units.get(r.id));
            }
            else{
                tempMap.set(r.id,r.unit);
            }
            this.unit_counts[tempMap.get(r.id)]++;
        }
        this.units = tempMap;

        //this.castle.log("turn is " + this.castle.me.turn);
        //this.castle.log("# of castles: "+ this.unit_counts[SPECS.CASTLE]);
        
        //this.castle.log("# of churches: "+ this.unit_counts[SPECS.CHURCH]);
        //this.castle.log("# of pilgrims: "+ this.unit_counts[SPECS.PILGRIM]);
        //this.castle.log("# of crusaders: "+ this.unit_counts[SPECS.CRUSADER]);
        //this.castle.log("# of prophets: "+ this.unit_counts[SPECS.PROPHET]);
        //this.castle.log("# of preachers: "+ this.unit_counts[SPECS.PREACHER]);
        

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
        let visible_pilgrims = helper.filter_by_type(this.castle.getVisibleRobots(), SPECS.PILGRIM);
        let unit;
        if (visible_pilgrims.length < MAX_VISIBLE_PILGRIMS) {
            unit = PILGRIM_TYPE;
        } 
        else {
            unit = CRUSADER_TYPE;
        }
        return unit;
    }

    // Decide spawn location for units
    pick_spawn_location() {
        var chosenPosIndex = Math.floor(Math.random() * this.build_locations.length);
        var chosenPos = this.build_locations[chosenPosIndex];
        var chosenDxy = [this.castle.me.x - chosenPos[0], this.castle.me.y - chosenPos[1]];
        let build_type = this.pick_unit();
        if (build_type === PILGRIM_TYPE && this.empty_resource_cells.length > 0) {
            chosenPos = this.empty_resource_cells.pop();
            chosenDxy = [this.castle.me.x - chosenPos[0], this.castle.me.y - chosenPos[1]];
        }
        return chosenDxy;
    }
}