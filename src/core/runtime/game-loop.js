import { GameController } from "../../game/controllers/game-controller.js";

class GameLoop{
    #lastTime;
    #boundLoop;
    #canLoop;

    #gameController;
    constructor(){
        this.#lastTime = null;
        this.#gameController = new GameController();
        this.#boundLoop = this.loop.bind(this);
        this.#canLoop = false;
    }
    
    start(){
        if(this.#canLoop){
            return;
        }

        this.#canLoop = true;
        this.#gameController.start();
        requestAnimationFrame(this.#boundLoop);
    }
    
    stop(){
        if(!this.#canLoop){
            return;
        }
        
        this.#canLoop = false;
        this.#lastTime = null;
    }
    
    loop(time){
        if(!this.#canLoop){
            return;
        }

        this.#lastTime ??= time;
        const dt = time - this.#lastTime;
        this.#lastTime = time;

        this.update(dt);

        requestAnimationFrame(this.#boundLoop);
    }

    update(dt) {
        this.#gameController.update(dt);
    }
}

export {GameLoop}