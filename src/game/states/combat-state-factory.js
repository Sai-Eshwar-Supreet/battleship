import {createState} from '../../core/state/state-factory.js';
import { buildCombatView } from '../../ui/views/combat-view.js';
import { BOARD_HEIGHT, BOARD_WIDTH } from '../config/game-config.js';
import { Player } from '../entities/player/player.js';
import { CombatSystem } from '../systems/combat-system.js';

function createCombatState(ctx){
    let combatView = null;
    let combatSystem = null;

    function enter(){
        combatView =  buildCombatView(BOARD_WIDTH, BOARD_HEIGHT);
        combatView.mount();

        combatView.on('return-to-menu', returnToMenu);
        combatView.on('restart', restart);

        combatSystem = new CombatSystem();

        const human = ctx.players[Player.type.human];
        const computer = ctx.players[Player.type.computer];

        combatSystem.startCombat(human, computer);

        const humanShipPositions = human.board.getAllShipLocations();

        for(let position of humanShipPositions){
            combatView.showShipAt(position);
        }

        combatView.updateNames(human.name, computer.name);
        combatView.updateHealth(Player.type.human, human.health);
        combatView.updateHealth(Player.type.computer, computer.health);
        
        executeTurn();
    }

    async function executeTurn(){
        const opponentType = combatSystem.getCurrentOpponent().type;
        const currentPlayer = combatSystem.getCurrentPlayer();
        combatView.updateTurn(currentPlayer.name)
        combatView.setInputActive(currentPlayer.type === Player.type.human);
        const response = await combatSystem.executeTurn();

        combatView.updateHealth(opponentType, ctx.players[opponentType].health);

        if(response.success){
            combatView.updateCell(opponentType, response.position, response.result);
        }

        if(combatSystem?.isCombatComplete()){
            combatView.endCombat(combatSystem.getWinner());
        }else{
            executeTurn();
        }
    }

    function returnToMenu(){
        ctx.requestState('MENU');
    }

    function restart(){
        ctx.requestState('PRE_GAME');
    }
    
    function update(){
        //noop
    }
    
    function exit(){
        combatView?.unmount();
        combatView = null;
        combatSystem = null;
    }
    
    return createState('COMBAT', {enter, exit, update});
}

export { createCombatState };