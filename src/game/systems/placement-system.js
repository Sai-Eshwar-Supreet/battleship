import { Vector2Int } from '../../core/math/vector2int.js';
import { RNG } from '../../core/random/rng';
import { BOARD_HEIGHT, BOARD_WIDTH, FLEET_CONFIG } from '../config/game-config.js';
import { Ship } from '../entities/ship.js';

const placementSystem = (
    function() {
        const rng = new RNG(Date.now());
        function placeShips(board, payload){
            if(payload?.randomizeShips){
                board.reset();
                randomizeShips(board);
                return true;
            }
            
            if(payload?.placementData){
                const pos = payload.placementData.position;
                const direction = payload.placementData.direction;
                const shipData = payload.placementData.shipData;
                if(board.canPlaceShip(pos, direction, shipData.length)){
                    const ship = new Ship(shipData);
                    board.placeShip(ship, pos, direction);
                    return true;
                }
            }

            return false;
        }

        function randomizeShips(board){
            const directions = [Vector2Int.right, Vector2Int.up];

            for(let shipData of FLEET_CONFIG){
                let placed = false;
                let attempts = 0;
                while(!placed && attempts < 1000){
                    attempts++;
                    const direction = rng.pick(directions);

                    if(direction.equals(Vector2Int.right)){
                        const col = rng.nextInt(0, BOARD_WIDTH - shipData.length);
                        const row = rng.nextInt(0, BOARD_HEIGHT);
                        const coord = new Vector2Int(col, row);
                        
                        if(board.canPlaceShip(coord, direction, shipData.length)){
                            const ship = new Ship(shipData);
                            board.placeShip(ship, coord, direction);
                            placed = true;
                        }
                    }else{
                        const col = rng.nextInt(0, BOARD_WIDTH);
                        const row = rng.nextInt(0, BOARD_HEIGHT - shipData.length);
                        const coord = new Vector2Int(col, row);
                        
                        if(board.canPlaceShip(coord, direction, shipData.length)){
                            const ship = new Ship(shipData);
                            board.placeShip(ship, coord, direction);
                            placed = true;
                        }
                    }
                }
                if (!placed) throw new Error('Failed to place ship');
            }
        }

        return {
            placeShips
        }
    }
)();

export default placementSystem;