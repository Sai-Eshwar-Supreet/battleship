import { Vector2Int } from "../../../../core/math/vector2int";
import { RNG } from "../../../../core/random/rng";

export default function createRandomShotStrategy({width, height, seed = Date.now()}){
    if (!Number.isInteger(width) || width <= 0) {
        throw new TypeError('Invalid board width');
    }
    if (!Number.isInteger(height) || height <= 0) {
        throw new TypeError('Invalid board height');
    }

    const rng = new RNG(seed);

    let untriedCoords = [];
    
    for(let x = 0; x < width; x++){
        for(let y = 0; y < height; y++){
            untriedCoords.push(new Vector2Int(x,y));
        }
    }
    
    
    untriedCoords = rng.shuffle(untriedCoords);

    function requestMove(){
        if(untriedCoords.length === 0){
            throw new Error('No remaining moves');
        }

        return Promise.resolve(untriedCoords.pop());
    }

    // hook it to attack resolves in the controller
    function onAttackResult(_move, _result){
        // noop
    }

    return Object.freeze({requestMove, onAttackResult});
}