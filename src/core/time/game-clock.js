class GameClock{
    #timers;
    #disposed;

    constructor(){
        this.#timers = new Set();
        this.#disposed = false;
    }

    get disposed(){
        return this.#disposed;
    }

    delay(ms, callback){
        if(this.#disposed){
            throw new Error('GameClock has been disposed');
        }

        if(!Number.isInteger(ms) || ms <= 0){
            throw new TypeError('Delay ms should be a positive non-zero integer');
        }

        if(typeof callback !== 'function'){
            throw new TypeError('Expects callback to be a function');
        }

        const timerID = setTimeout(() => {
            this.#timers.delete(timerID);
            callback();
        }, ms);

        this.#timers.add(timerID);

        return timerID;
    }

    cancel(timerID){
        if(this.#disposed){
            throw new Error('GameClock has been disposed');
        }

        if(this.#timers.has(timerID)){
            clearTimeout(timerID);
            this.#timers.delete(timerID);

            return true;
        }

        return false;
    }

    cancelAll(){
        if(this.#disposed){
            throw new Error('GameClock has been disposed');
        }

        for(let timerID of this.#timers){
            clearTimeout(timerID);
        }

        this.#timers.clear();
    }

    reset(){
        for(let timerID of this.#timers){
            clearTimeout(timerID);
        }

        this.#timers.clear();
        this.#disposed = false;
    }

    dispose(){
        this.cancelAll();
        this.#disposed = true;
    }
}

export { GameClock }