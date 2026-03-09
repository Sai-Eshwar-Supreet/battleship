import { createElementRecursively } from "../dom/dom-factory.js";
import {Vector2Int} from '../../core/math/vector2int.js';

function buildPlacementView(width, height){
    const root = document.querySelector('#root');

    if(!root){
        throw new Error('There is no root element in the HTML');
    }
    const blueprint = {
  type: "section",
  classList: ["placement-screen"],
  children: [
    {
      type: "header",
      classList: ["placement-header"],
      children: [
        {
          type: "h1",
          classList: ["placement-title"],
          textContent: "Deploy Your Fleet",
        },
        {
          type: "p",
          classList: ["placement-help"],
          textContent: "Click grid to place ships • Press R to rotate",
        },
      ],
    },

    {
      type: "div",
      classList: ["placement-layout"],
      children: [

        {
          type: "div",
          classList: ["placement-board-area"],
          children: [
            {
              type: "div",
              attributes: {
                id: "placement-board",
              },
              classList: ["board"],
            },
          ],
        },

        {
          type: "aside",
          classList: ["placement-panel"],
          children: [

            {
              type: "div",
              classList: ["ship-preview-panel"],
              children: [
                {
                  type: "span",
                  classList: ["preview-label"],
                  textContent: "Current Ship",
                },
                {
                  type: "div",
                  attributes: {
                    id: "current-ship-display",
                  },
                },
              ],
            },

            {
              type: "div",
              attributes: {
                id: "placement-tools",
              },
              classList: ["placement-controls"],
              children: [
                {
                  type: "button",
                  textContent: "Revert",
                  dataset: { action: "placement:revert" },
                },
                {
                  type: "button",
                  textContent: "Auto place remaining",
                  dataset: { action: "placement:auto-place-remaining" },
                },
                {
                  type: "button",
                  textContent: "Auto place all",
                  dataset: { action: "placement:auto-place-all" },
                },
                {
                  type: "button",
                  classList: ["confirm-btn"],
                  textContent: "Confirm",
                  dataset: { action: "placement:confirm" },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

    let ui = null;
    let placementTools;
    let placementBoard;
    let cellGrid = [];
    let currentShipDisplay;
    let currentHover = null;
    let confirmButton = null;
    let listeners = Object.freeze({
        'placement:rotate': [],
        'placement:revert': [],
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
        confirmButton = ui.querySelector('.confirm-btn');


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
                cell.classList.remove('ship-unit', 'valid-place', 'invalid-place');
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
        currentShipDisplay.innerHTML = '';
        for(let i =0; i < length; i++){
            const ship = document.createElement('div');
            ship.classList.add('ship-unit');

            currentShipDisplay.appendChild(ship);
        } 
    }

    function updateRotation(orientation){
        if(typeof orientation !== 'string'){
            throw new TypeError('Expects orientation of type string');
        }

        currentShipDisplay.dataset.orientation = orientation;
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
        confirmButton = null;
        for(let listenerId of Object.keys(listeners)){
            listeners[listenerId].length = 0; 
        }

        window.removeEventListener('keydown', handleRotatePress);
    }

    function on(listenerId, callback){
        const listenerList = listeners[listenerId];

        if(!listenerList){
            return;
        }

        listenerList.push(callback);
    }

    function setConfirm(active){
        if(typeof active !== 'boolean'){
            throw new TypeError('Expects active of type boolean');
        }
        confirmButton.disabled = !active;
    }

    return {mount, unmount, setConfirm, updateRotation, updateHover, resetHover, resetBoardState, placeShip, updateCurrentShip, on};
}

export {buildPlacementView};