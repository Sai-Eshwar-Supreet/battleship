import { createElementRecursively } from "../dom/dom-factory.js";
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
                        textContent:'Revert',
                        dataset: {
                            action: "placement:reset"
                        }
                    },
                    {
                        type: 'button',
                        textContent:'Auto place remaining',
                        dataset: {
                            action: "placement:auto-place-remaining"
                        }
                    },
                    {
                        type: 'button',
                        textContent:'Auto place all',
                        dataset: {
                            action: "placement:auto-place-all"
                        }
                    },
                    {
                        type: 'button',
                        textContent:'Confirm',
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
    let currentHover = null;
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

        for(let rowIndex = 0; rowIndex < height; rowIndex++){
            const row = [];
            for(let colIndex = 0;  colIndex< width; colIndex++){
                const cellElement = document.createElement('div');
                cellElement.classList.add('cell');
                cellElement.dataset.row = rowIndex ;
                cellElement.dataset.col = colIndex;
                cellElement.addEventListener('mouseenter', handleCellEnter);
                cellElement.addEventListener('mouseleave', handleCellExit);
                cellElement.addEventListener('click', handleCellClick);

                placementBoard.appendChild(cellElement);
                row.push(cellElement);
            }

            cellGrid.push(row);
        }


        window.addEventListener('keydown', handleRotatePress);

        root.appendChild(ui);
    }

    function handleRotatePress(event){
        if(event.key === 'r'){
            listeners['placement:rotate'].forEach(listener => listener?.(currentHover));
        }
    }

    function handleCellEnter(event){
        const trigger = event.target.closest('[data-row]');

        if(!trigger){
            return;
        }

        const row = trigger.dataset.row;
        const col = trigger.dataset.col;

        if(!row || !col){
            return;
        }

        currentHover = new Vector2Int(Number(col), Number(row));
        listeners['cell:enter'].forEach(listener => listener?.(currentHover));
   }

    function handleCellExit(event){
        const trigger = event.target.closest('[data-row]');

        if(!trigger){
            return;
        }

        const row = trigger.dataset.row;
        const col = trigger.dataset.col;

        if(!row || !col){
            return;
        }

        currentHover = null;
        listeners['cell:leave'].forEach(listener => listener?.(new Vector2Int(Number(col), Number(row))));
   }

   function updateHover(chain, canPlace){
    if(!chain) return;
    for(let point of chain){
        const cell = cellGrid[point.y][point.x];

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
    if(!chain) return;
    for(let point of chain){
        const cell = cellGrid[point.y][point.x];

        cell.classList.remove('valid-place');
        cell.classList.remove('invalid-place');
    }
   }

    function handleCellClick(event){
        const trigger = event.target.closest('[data-row]');

        if(!trigger){
            return;
        }

        const row = trigger.dataset.row;
        const col = trigger.dataset.col;

        if(!row || !col){
            return;
        }


        listeners['cell:click'].forEach(listener => listener?.(new Vector2Int(Number(col), Number(row))));
    }

    function placeShip(chain){
        if(!chain) return;
        for(let point of chain){
            const cell = cellGrid[point.y][point.x];

            cell.classList.remove('valid-place');
            cell.classList.remove('invalid-place');
            cell.classList.add('ship-unit');
        }
    }

    function resetBoardState(){
        for(let row of cellGrid){
            for(let cell of row){
                cell.classList.remove('ship-unit')
            }
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
            ship.classList.add('ship-unit');

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

    return {mount, unmount, updateHover, resetHover, resetBoardState, placeShip, updateCurrentShip, on};
}

export {buildPlacementView};