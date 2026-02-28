import { assertEnum } from "../../../core/validation/enum-validation.js";
import { GameBoard } from "../gameboard.js";

class Player{
    #name;
    #type;
    #board;
    #strategy;

    constructor(name, type, strategy){

        if(typeof name !== 'string'){
            throw new TypeError('Expects name to be a string');
        }

        this.#name = name;
        assertEnum(Player.type, type, 'Player Type');
        this.#type = type;
        this.#board = new GameBoard();
        this.setStrategy(strategy);
    }

    get name() {
        return this.#name;
    }

    get type(){
        return this.#type;
    }

    get board(){
        return this.#board;
    }

    setStrategy(strategy){
        if (!strategy || typeof strategy.requestMove !== 'function' || typeof strategy.onAttackResult !== 'function') {
            throw new TypeError('Invalid attack strategy');
        }
        this.#strategy = strategy;
    }

    async requestMove(){
        return await this.#strategy.requestMove();
    }

    static type = Object.freeze({
        human: 'human',
        computer: 'computer',
    });
}

export { Player }