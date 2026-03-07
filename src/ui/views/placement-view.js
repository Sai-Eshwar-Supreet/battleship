import { createElementRecursively } from "../dom/dom-factory";
import {Vector2Int} from '../../core/math/vector2int.js';

function buildPlacementView(width, height){
    const root = document.querySelector('#root');

    if(!root){
        throw new Error('There is no root element in the HTML');
    }
    const blueprint = {
        type: "div",
        classList: [],
        children: [
            {
                type: "div",
                classList: [],
                children: [
                    {
                        type: 'div',
                        attributes: {
                            id: 'placement-board',
                        },
                    },
                    {
                        type: 'div',
                        attributes: {
                            id: 'current-ship-display',
                        },
                    },
                ]
            },
            {
                type: "div",
                attributes: {
                    id: 'placement-tools',
                },
                classList: [],
                children: [
                    {
                        type: 'button',
                        dataset: {
                            action: "placement:revert"
                        }
                    },
                    {
                        type: 'button',
                        dataset: {
                            action: "placement:auto-place-remaining"
                        }
                    },
                    {
                        type: 'button',
                        dataset: {
                            action: "placement:auto-place-all"
                        }
                    },
                    {
                        type: 'button',
                        dataset: {
                            action: "placement:confirm"
                        }
                    },
                ]
            },
        ],
    };

    let ui = null;
    let placementTools;
    let placementBoard;
    let cellGrid = [];
    let currentShipDisplay;
    let listeners = Object.freeze({
        'placement:rotate': [],
        'placement:reset': [],
        'placement:auto-place-all': [],
        'placement:auto-place-remaining': [],
        'placement:confirm': [],
        'cell:enter': [],
        'cell:leave': [],
        'cell:click': [],
    });

    function mount(){
        if(ui){
            throw new Error('Cannot mount the same ui twice');
        }

        ui = createElementRecursively(blueprint);
        placementTools = ui.querySelector('#placement-tools');
        placementBoard = ui.querySelector('#placement-board');
        currentShipDisplay = ui.querySelector('#current-ship-display');


        placementTools.addEventListener('click', handleToolUse);

        for(let x = 0; x < width; x++){
            const col = [];
            for(let y = 0;  y< height; y++){
                const cellElement = document.createElement('div');
                cellElement.dataset.x = x;
                cellElement.dataset.y = y;

                placementBoard.appendChild(cellElement);
                col.push(cellElement);
            }

            cellGrid.push(col);
        }

        placementBoard.addEventListener('mouseenter', handleCellEnter);
        placementBoard.addEventListener('mouseleave', handleCellExit);
        placementBoard.addEventListener('click', handleCellClick);

        root.appendChild(ui);
    }

    function handleCellEnter(event){
        const trigger = event.target.closest('[data-x]');

        if(!trigger){
            return;
        }

        const x = trigger.dataset.x;
        const y = trigger.dataset.y;

        if(!x || !y){
            return;
        }


        listeners['cell:enter'].forEach(listener => listener?.(new Vector2Int(x, y)));
   }

    function handleCellExit(event){
        const trigger = event.target.closest('[data-x]');

        if(!trigger){
            return;
        }

        const x = trigger.dataset.x;
        const y = trigger.dataset.y;

        if(!x || !y){
            return;
        }


        listeners['cell:exit'].forEach(listener => listener?.(new Vector2Int(x, y)));
   }

   function updateHover(chain, canPlace){
    for(let point of chain){
        const cell = cellGrid[point.x][point.y];

        if(canPlace) {
            cell.classList.remove('invalid-place');
            cell.classList.add('valid-place');
        }
        else {
            cell.classList.add('invalid-place');
            cell.classList.remove('valid-place');
        }
    }
   }

   function resetHover(chain){
    for(let point of chain){
        const cell = cellGrid[point.x][point.y];

        cell.classList.remove('valid-place');
        cell.classList.remove('invalid-place');
    }
   }

    function handleCellClick(event){
        const trigger = event.target.closest('[data-x]');

        if(!trigger){
            return;
        }

        const x = trigger.dataset.x;
        const y = trigger.dataset.y;

        if(!x || !y){
            return;
        }


        listeners['cell:click'].forEach(listener => listener?.(new Vector2Int(x, y)));
    }

    function placeShip(chain){
        for(let point of chain){
            const cell = cellGrid[point.x][point.y];

            cell.classList.add('ship-unit normal');
        }
    }

    function handleToolUse(event){
        const trigger = event.target.closest('[data-action]');

        if(!trigger){
            return;
        }

        const action = trigger.dataset.action;

        if(!action){
            return;
        }

        const listenerList = listeners[action];

        if(!listenerList){
            return;
        }

        for(let listener of listenerList){
            listener?.();
        }

    }

    function updateCurrentShip(length){
        currentShipDisplay.innerHTML = null;
        for(let i =0; i < length; i++){
            const ship = document.createElement('div');
            ship.classList.add('ship-unit normal');

            currentShipDisplay.appendChild(ship);
        } 
    }

    function unmount(){
        if(!ui){
            throw new Error('Unmount request is invalid');
        }
        
        root.removeChild(ui);
        ui = null;
        placementTools = null;
        placementBoard = null;
        cellGrid = [];
        currentShipDisplay = null;
        for(let listenerId of Object.keys(listeners)){
            listeners[listenerId].length = 0; 
        }
        
    }

    function on(listenerId, callback){
        const listenerList = listeners[listenerId];

        if(!listenerList){
            return;
        }

        listenerList.push(callback);
    }

    return {mount, unmount, updateHover, resetHover, placeShip, updateCurrentShip, on};
}

export {buildPlacementView};