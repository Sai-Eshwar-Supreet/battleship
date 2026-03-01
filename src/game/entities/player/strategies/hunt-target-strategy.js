import { Vector2Int } from "../../../../core/math/vector2int";
import { RNG } from "../../../../core/random/rng";
import { GameClock } from "../../../../core/time/game-clock";
import { assertEnum } from "../../../../core/validation/enum-validation";
import { Cell } from "../../../cell";


export default function createHuntTargetStrategy({width, height, difficultyConfig, seed = Date.now()}){
    if (!Number.isInteger(width) || width <= 0) {
        throw new TypeError('Invalid board width');
    }
    if (!Number.isInteger(height) || height <= 0) {
        throw new TypeError('Invalid board height');
    }

    const minBound = Vector2Int.origin;
    const maxBound = new Vector2Int(width - 1, height - 1);
    const rng = new RNG(seed);
    const gameClock = new GameClock();

    // untried cells and hunt queue
    const untried = new Set();
    
    for(let x = 0; x < width; x++){
        for(let y = 0; y < height; y++){
            untried.add(createKey(x,y));
        }
    }

    const allKeys = Array.from(untried.values());
    const evenQueue = rng.shuffle(allKeys.values()).filter(k => parityOf(k) === 0);
    const oddQueue = rng.shuffle(allKeys.values()).filter(k => parityOf(k) !== 0);

    // targeting state
    let anchor = null;
    let targets = null;
    let searchDirection = null;
    let missTolerance = 0;
    
    // helpers
    function createKey(x, y){
        return `${x},${y}`;
    }

    function keyOf(vector){
        return createKey(vector.x, vector.y)
    }

    function vectorOf(key){
        let [x, y] = key.split(',').map(Number);
        return new Vector2Int(x, y);
    }

    function parityOf(key){
        let [x, y] = key.split(',').map(Number);
        return (x + y) % 2;
    }

    function shouldTarget(){
        return targets?.length > 0 
            && difficultyConfig.targeting.canTarget 
            && rng.next() < difficultyConfig.targeting.accuracy;
    }

    function neighborsOf(vec) {
        return [Vector2Int.right, Vector2Int.left, Vector2Int.up, Vector2Int.down]
            .map(dir => vec.add(dir))
            .filter(v => v.isWithin(minBound, maxBound))
            .map(keyOf);
    }
    
    function buildChain(origin, direction){
        const chain = [];
        let cursor = origin.add(direction);

        while(cursor.isWithin(minBound, maxBound)){
            const key = keyOf(cursor);
            if(!untried.has(key)){
                break;
            }
            chain.push(key);
            cursor = cursor.add(direction);
        }

        return chain;
    }
        
    function buildTargets(secondHit){
        const forward = buildChain(anchor, searchDirection);
        const backward = buildChain(secondHit, searchDirection.negate());
        return [...forward, ...backward];
    }
    
    function resetTargeting(){
        anchor = null;
        targets = null;
        searchDirection = null;
        missTolerance = 0;
    }

    function popHunt(){
        for(const queue of [evenQueue, oddQueue]){
            while(queue.length > 0){
                const key = queue.pop();
                if(untried.has(key)){
                    untried.delete(key);
                    return vectorOf(key);
                }
            }
        }

        throw new Error('No moves remaining');
    }

    function popTarget(){
        while(targets.length > 0){
            const key = targets.shift();

            if(untried.has(key)){
                untried.delete(key);
                return vectorOf(key);
            }
        }

        resetTargeting();
        return popHunt();
    }
    
    function requestMove(){
        const promise = new Promise((resolve) => {
            const delay = rng.nextFloat(difficultyConfig.timing.minDelayMs, difficultyConfig.timing.maxDelayMs);
            
            function callback(){
                const move = shouldTarget()? popTarget() : popHunt();
                resolve(move);
            }

            gameClock.delay(delay, callback);
        });

        return promise;
    }

    function onHit(_move){
        if(!difficultyConfig.memory.rememberShots){
            return;
        }
        
        // successful hit resets patience
        missTolerance = 0;

        // update memory
        if(anchor === null){ // first hit determines anchor
            anchor = _move;
            targets = rng.shuffle(neighborsOf(anchor).filter(k => untried.has(k)));
            return;
        }
        
        if(searchDirection === null){ // second hit determines direction
            const delta = _move.subtract(anchor);

            if(Math.abs(delta.x) + Math.abs(delta.y) !== 1) {
                throw new Error('Invalid move: target hit must be adjacent to anchor');
            }

            searchDirection = new Vector2Int(Math.sign(delta.x), Math.sign(delta.y));
            targets = buildTargets(_move);
            return;
        }
    }

    function onMiss(){
        if(!shouldTarget()) {
            return;
        }

        missTolerance++;
        if(missTolerance > difficultyConfig.memory.maxMissTolerance){
            resetTargeting();
        }
    }

    function onAttackResult(_move, _result){
        if(!Vector2Int.isValid(_move)){
            throw new TypeError('Expects _move to be a Vector2Int');
        }

        assertEnum(Cell.cellFlag, _result, "Cell flag");

        if(_result === Cell.cellFlag.hit){
            onHit(_move);
        }else if(_result === Cell.cellFlag.miss){
            onMiss();
        }
    }

    return Object.freeze({requestMove, onAttackResult});
}