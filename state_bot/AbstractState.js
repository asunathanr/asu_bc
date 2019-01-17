/**
 * AbstractState is an abstract class which defines behaviour for all unit state machines
 * @property current_state: stores a function that when called in check_states will check game
 *           state and change state accordingly.
 * @property unit: stores the MyRobot object which contains this class.
 */
export class AbstractState {

    /**
     * @param unit: is the MyRobot object (would be this the the clas that contains this class)
     */
    constructor (unit) {
        
    }

    /**
     * initial_state is the begining state of all robots
     * @returns the the new state based on the game state
     */
    initial_state () {
        throw Error("Abstract Class!");

        return;
    }

    /**
     * check_state changes the current_state based on the game state of unit
     */
    check_state () {
        this.current_state = this.current_state();
        throw Error("Abstract Class!");
    }

    /**
     * @returns the action to be done by MyRobot based on the current state
     */
    act() {
        throw Error("Abstract Class!");
    }
}