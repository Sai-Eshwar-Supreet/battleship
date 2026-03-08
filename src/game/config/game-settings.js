import { DIFFICULTY } from "./difficulty-config.js";

let playerName = 'Player';
let difficulty = DIFFICULTY.NORMAL;

function getSettings(){
    return { playerName , difficulty};
}

function setSettings(name, difficultyId){
    if(typeof name !== 'string'){
        throw new TypeError("Expects a string playerName");
    }

    if(typeof difficultyId !== 'string'){
        throw new TypeError("Expects a string difficultyId");
    }
    
    const newDifficulty = Object.values(DIFFICULTY).find(d => d.id === difficultyId);

    if(!newDifficulty){
        throw new Error('Difficulty id is invalid');
    }

    playerName = name;
    difficulty = newDifficulty;
}

export {getSettings, setSettings};