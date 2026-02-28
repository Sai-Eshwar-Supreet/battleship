import { Vector2Int } from "../../../../../core/math/vector2int";
import { RNG } from "../../../../../core/random/rng";
import { assertEnum } from "../../../../../core/validation/enum-validation";
import { Cell } from "../../../cell";


export default function createHuntTargetStrategy({width, height, seed = Date.now()}){
    if (!Number.isInteger(width) || width <= 0) {
        throw new TypeError('Invalid board width');
    }
    if (!Number.isInteger(height) || height <= 0) {
        throw new TypeError('Invalid board height');
    }

    const minBound = Vector2Int.origin;
    const maxBound = new Vector2Int(width - 1, height - 1);
    const rng = new RNG(seed);

    const untried = new Set();
    
    for(let x = 0; x < width; x++){
        for(let y = 0; y < height; y++){
            untried.add(createKey(x,y));
        }
    }

    const allKeys = Array.from(untried.values());
    const evenQueue = rng.shuffle(allKeys.values()).filter(k => parityOf(k) === 0);
    const oddQueue = rng.shuffle(allKeys.values()).filter(k => parityOf(k) !== 0);

    let anchor = null;
    let targets = null;
    let searchDirection = null;

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

    function isTargeting(){
        return targets !== null;
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
        
    function buildCandidates(secondHit){
        const forward = buildChain(anchor, searchDirection);
        const backward = buildChain(secondHit, searchDirection.negate());
        return [...forward, ...backward];
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

    function popCandidate(){
        while(targets.length > 0){
            const key = targets.shift();

            if(untried.has(key)){
                untried.delete(key);
                return vectorOf(key);
            }
        }

        reset();
        return popHunt();
    }
    
    function requestMove(){
        const move = isTargeting()? popCandidate() : popHunt();
        return Promise.resolve(move);
    }

    function onHit(_move){
        if(anchor === null){
            anchor = _move;
            targets = rng.shuffle(neighborsOf(anchor).filter(k => untried.has(k)));
            return;
        }
        
        if(searchDirection === null){
            const delta = _move.subtract(anchor);

            if(Math.abs(delta.x) + Math.abs(delta.y) !== 1) {
                throw new Error('Invalid move: target hit must be adjacent to anchor');
            }

            searchDirection = new Vector2Int(Math.sign(delta.x), Math.sign(delta.y));
            targets = buildCandidates(_move);
        }
    }

    function onAttackResult(_move, _result){
        if(!Vector2Int.isValid(_move)){
            throw new TypeError('Expects _move to be a Vector2Int');
        }

        assertEnum(Cell.cellFlag, _result, "Cell flag");

        if(_result === Cell.cellFlag.hit){
            onHit(_move);
        }
    }

    function reset(){
        anchor = null;
        targets = null;
        searchDirection = null;
    }

    return Object.freeze({requestMove, onAttackResult});
}