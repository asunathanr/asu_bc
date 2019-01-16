class AbstractState {
    constructor (unit) {
        this.current_state = this.intial_state;
        throw Error("Absract Class!");

    }

    initial_state (unit) {
        throw Error("Abstract Class!");
    }

    check_state (unit) {
        throw Error("Abstract Class!");
    }

    act(unit) {
        throw Error("Abstract Class!");
    }
}

export default AbstractState; 