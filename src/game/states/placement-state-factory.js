import { Vector2Int } from '../../core/math/vector2int.js';
import {createState} from '../../core/state/state-factory.js';
import { buildPlacementView } from '../../ui/views/placement-view.js';
import { BOARD_HEIGHT, BOARD_WIDTH } from '../config/game-config.js';
import { Player } from '../entities/player/player.js';
import { PlacementSystem } from '../systems/placement-system.js';

function createPlacementState(ctx){
    let placementView = null;
    let placementSystem = null;
    let direction = Vector2Int.right;

    function enter(){
        placementView =  buildPlacementView(BOARD_WIDTH, BOARD_HEIGHT);
        placementView.mount();

        placementView.on('placement:rotate', toggleDirection);
        placementView.on('placement:revert', resetPlacement);
        placementView.on('placement:auto-place-all', autoPlaceAll);
        placementView.on('placement:auto-place-remaining', autoPlaceRemaining);
        placementView.on('placement:confirm', confirmPlacement);
        placementView.on('cell:enter', validatePlacementHover);
        placementView.on('cell:leave', resetPlacementHover);
        placementView.on('cell:click', placeShip);

        placementSystem = new PlacementSystem();
        placementSystem.startPlacement(ctx.players[Player.type.computer].board, ctx.buildFleet(), Date.now());
        placementSystem.autoPlaceAll();
        placementSystem.finalizePlacement();

        placementSystem.reset();
        placementSystem.startPlacement(ctx.players[Player.type.human].board, ctx.buildFleet(), Date.now() * 2);
        const length = placementSystem.getCurrentShip().length;
        placementView.updateCurrentShip(length);
        
        placementView.updateRotation(direction.equals(Vector2Int.up)? 'vertical' : 'horizontal');
    }

    function toggleDirection(origin){
        if(!origin) return;
        let placementData = placementSystem.getPlacementData(origin, direction);
        placementView.resetHover(placementData?.chain);

        direction = direction.equals(Vector2Int.right)? Vector2Int.up : Vector2Int.right;
        
        placementView.updateRotation(direction.equals(Vector2Int.up)? 'vertical' : 'horizontal');
        
        placementData = placementSystem.getPlacementData(origin, direction);
        placementView.updateHover(placementData?.chain, placementData?.canPlace);
    }

    function resetPlacement(){
        placementSystem.resetPlacement();
        placementView.resetBoardState();
        const length = placementSystem.getCurrentShip()?.length;
        placementView.updateCurrentShip(length);
    }

    function autoPlaceAll(){
        placementView.resetBoardState();
        placementSystem.autoPlaceAll((chain) => {
            placementView.placeShip(chain)
            const length = placementSystem.getCurrentShip()?.length;
            placementView.updateCurrentShip(length);
        });


    }
    function autoPlaceRemaining(){
        placementSystem.autoPlaceRemaining((chain) => {
            placementView.placeShip(chain)
            const length = placementSystem.getCurrentShip()?.length;
            placementView.updateCurrentShip(length);
        });
    }
    function confirmPlacement(){
        placementSystem.finalizePlacement();
    }
    function validatePlacementHover(origin){
        const placementData = placementSystem.getPlacementData(origin, direction);


        placementView.updateHover(placementData?.chain, placementData?.canPlace);
    }
    function resetPlacementHover(origin){
        const placementData = placementSystem.getPlacementData(origin, direction);


        placementView.resetHover(placementData?.chain);
    }

    function placeShip(origin){
        placementSystem.placeCurrentShip(origin, direction, (chain) => {
            placementView.placeShip(chain)
            const length = placementSystem.getCurrentShip()?.length;
            placementView.updateCurrentShip(length);
        });
    }
    
    function update(){
        if(placementSystem?.isPlacementComplete()){
            ctx.requestState('COMBAT');
        }
    }
    
    function exit(){
        placementView?.unmount();
        placementView = null;
        placementSystem = null;
    }
    
    return createState('PLACEMENT', {enter, exit, update});
}

export { createPlacementState };