import { AbstractState } from './AbstractState.js';
import { SPECS } from 'battlecode';
import nav from './nav.js';

/**
 * CrusaderState is state machine for crusader units
 * @property current_state: stores a function that when called in check_states will check game
 *           state and change state accordingly.
 * @property crusader: stores the MyRobot object which contains this class.
 * @property destination is where the bot is trying to go {x: y:}
 * @property attackable: list of attackable grids
 */
export class CrusaderState extends AbstractState{

    /**
     * @param crusader: is the MyRobot object (would be this the the clas that contains this class)
     */
    constructor (crusader) {
        super(crusader);
        this.current_state = this.initial_state; //all robots start at an initial state
        this.crusader = crusader;
        this.destination = {x:crusader.me.x ,y:crusader.me.y}; //initialize destination to own dest
        this.attackable = [];
    }

    /**
     * initial_state is the begining state of all robots
     * @returns move_state after computing location of enemy castle
     */
    initial_state () {
        //set destination to reflected spawn location (hopefully enemy castle adjacent)
        this.destination = nav.reflect({x:this.crusader.me.x, y:this.crusader.me.y}, this.crusader.map, nav.isHorizontalReflection(this.crusader.map));
        this.crusader.make_path(this.crusader.my_pos(), [this.destination.x, this.destination.y]);

        return this.move_state;
    }

    /**
     * move_state signals the robot to return a move action
     * @returns attack_state if there is an attackable unit in range
     *          else returns move state
     *          Also calculates a new destination if old destination is reached
     */
    move_state () {
        // get attackable robots
	    this.attackable = this.attackable = this.crusader.getAttackableRobots();
        //if attackable units, go to attack_state
        if(this.attackable.length > 0){
            return this.attack_state;
        }
        //if destintaion is reached, change destination to random point on enemy half of map
        else if(this.crusader.me.x===this.destination.x && this.crusader.me.y===this.destination.y) {
            this.crusader.log(this.crusader.id, " has reached his destination, choosing new dest");
            let newDestination = nav.getRandHalfGrid(this.crusader);
            this.destination.x = newDestination[0];
            this.destination.y = newDestination[1];

            this.crusader.make_path(this.crusader.my_pos(), [this.destination.x, this.destination.y]);
        }
        return this.move_state;
    }

    /**
     * attack_state signals the crusader to attack an attackable unit
     * @returns attack state if there are enemies to attack
     *          else returns move state
     */
    attack_state () {
        // get attackable robots
	    this.attackable = this.crusader.getAttackableRobots();

        //continue to remain in attack_state if there are remaining enemies to attack
        if(this.attackable.length >0){
            return this.attack_state;
        }
        //otherwise change to move_state
        else{
            return this.move_state;
        }
    }

    /**
     * check_state changes the current_state based on the game state of unit
     */
    check_state () {
        this.current_state = this.current_state();
    }

    /**
     * @returns the action to be done by crusader based on the current state
     */
    act() {
        if(this.current_state===this.initial_state) {
            return Error("Should not act in initial State!");
        }
        else if(this.current_state===this.move_state){
            return this.crusader.move_unit();
        }
        else if(this.current_state===this.attack_state){
            var r = this.attackable[0];
            /*
            this.crusader.log('' + r);
            this.crusader.log('attacking! ' + r + ' at loc ' + (r.x - this.crusader.me.x, r.y - this.crusader.me.y));
            */
            return this.crusader.attack(r.x - this.crusader.me.x, r.y - this.crusader.me.y);
        }
        else {
            return Error("Invalid State, cannot act");
        }
    }
}