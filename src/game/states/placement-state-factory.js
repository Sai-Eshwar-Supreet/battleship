import { Vector2Int } from '../../core/math/vector2int.js';
import {createState} from '../../core/state/state-factory.js';
import { buildPlacementView } from '../../ui/views/placement-view.js';
import { Player } from '../entities/player/player.js';
import { PlacementSystem } from '../systems/placement-system.js';

function createPlacementState(ctx){
    let placementView = null;
    let placementSystem = null;
    let direction = Vector2Int.right;

    function enter(){
        placementView =  buildPlacementView();
        placementView.mount();

        placementView.on('placement:rotate', toggleDirection);
        placementView.on('placement:reset', resetPlacement);
        placementView.on('placement:auto-place-all', autoPlaceAll);
        placementView.on('placement:auto-place-remaining', autoPlaceRemaining);
        placementView.on('placement:confirm', confirmPlacement);
        placementView.on('cell:enter', validatePlacementHover);
        placementView.on('cell:exit', resetPlacementHover);
        placementView.on('cell:click', placeShip);

        placementSystem = new PlacementSystem();
        placementSystem.startPlacement(ctx.players[Player.type.computer].board, ctx.buildFleet(), Date.now());
        placementSystem.autoPlaceAll();
        placementSystem.finalizePlacement();

        placementSystem.reset();
        placementSystem.startPlacement(ctx.players[Player.type.human].board, ctx.buildFleet(), Date.now() * 2);
        const length = placementSystem.getCurrentShip().length;
        placementView.updateCurrentShip(length);
    }

    function toggleDirection(){
        direction = direction.equals(Vector2Int.right)? Vector2Int.down : Vector2Int.right;
    }

    function resetPlacement(){
        placementSystem.resetPlacement();
    }

    function autoPlaceAll(){
        placementSystem.autoPlaceAll();
    }
    function autoPlaceRemaining(){
        placementSystem.autoPlaceRemaining();
    }
    function confirmPlacement(){
        placementSystem.finalizePlacement();
    }
    function validatePlacementHover(origin){
        const placementData = placementSystem.getPlacementData(origin, direction);


        placementView.updateHover(placementData.chain, placementData.canPlace);
    }
    function resetPlacementHover(origin){
        const placementData = placementSystem.getPlacementData(origin, direction);


        placementView.resetHover(placementData.chain);
    }

    function placeShip(origin){
        if(placementSystem.placeCurrentShip(origin, direction)){
            const chain = placementSystem.getPlacementData(origin, direction).chain;
            placementView.placeShip(chain)
            const length = placementSystem.getCurrentShip().length;
            placementView.updateCurrentShip(length);
        }
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
    
    return createState('MENU', {enter, exit, update});
}

export { createPlacementState };