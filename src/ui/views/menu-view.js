import { createElementRecursively } from "../dom/dom-factory.js";

function buildMenuView(playerName, difficulty){
    const root = document.querySelector('#root');

    if(!root){
        throw new Error('There is no root element in the HTML');
    }

    const blueprint = {
        type: "div",
        classList: [],
        children: [
            {
                type: "form",
                attributes: {
                    id: 'menu-form',
                },
                classList: [],
                children: [
                    {
                        type: "h1",
                        textContent: "BATTLESHIP",
                    },
                    {
                        type: "input",
                        attributes: {
                            id: "player-name",
                            type: "text",
                            name: "playerName",
                            value: playerName,
                        }
                    },
                    {
                        type: "select",
                        attributes: {
                            id: "difficulty-select",
                            name: "difficulty",
                        },
                        children: [
                            {
                                type: "button",
                                children: [
                                    {
                                        type: "selectedcontent"
                                    }
                                ]
                            },
                            {
                                type: "option",
                                textContent: "Easy",
                                attributes: {
                                    value: "easy",
                                    selected: Boolean(difficulty.id === 'easy')
                                }
                            },
                            {
                                type: "option",
                                textContent: "Normal",
                                attributes: {
                                    value: "normal",
                                    selected: Boolean(difficulty.id === 'normal')
                                }
                            },
                            {
                                type: "option",
                                textContent: "Hard",
                                attributes: {
                                    value: "hard",
                                    selected: Boolean(difficulty.id === 'hard')
                                }
                            },
                        ]
                    },
                    {
                        type: "button",
                        textContent: "Start Game",
                    },
                ]
            }
        ],
    };

    let ui = null;
    let menuForm;
    let handlers = [];

    function mount(){
        if(ui){
            throw new Error('Cannot mount the same ui twice');
        }

        ui = createElementRecursively(blueprint);
        menuForm = ui.querySelector('#menu-form');


        menuForm.addEventListener('submit', menuSubmitHandler);

        root.appendChild(ui);
    }

    function unmount(){
        if(!ui){
            throw new Error('Unmount request is invalid');
        }
        
        root.removeChild(ui);
        ui = null;
        menuForm = null;
        handlers = [];
    }

    function menuSubmitHandler(event){
        event.preventDefault();
        const formData = new FormData(event.target);

        const playerName = formData.get('playerName');
        const difficultyId = formData.get('difficulty');

        handlers.forEach(callback => callback?.({playerName, difficultyId}));
    }

    function onGameStart(callback){
        if(typeof callback !== 'function'){
            throw new TypeError('Expects a function as callback');
        }
        handlers.push(callback);
    }

    return {mount, unmount, onGameStart};
}

export {buildMenuView};