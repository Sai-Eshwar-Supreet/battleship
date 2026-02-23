class State{
    #type;

    constructor(type){
        if (typeof type !== 'string') {
            throw new TypeError('State type must be a string');
        }

        this.#type = type;
    }

    get type(){
        return this.#type;
    }

    toString(){
        return this.#type;
    }
}

export {State}