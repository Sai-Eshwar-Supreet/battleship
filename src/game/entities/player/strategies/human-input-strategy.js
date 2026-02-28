import {eventBus} from '../../../../core/events/event-bus.js';

export default function createHumanInputStrategy(){
    function requestMove(){
        const promise = new Promise((resolve) => {
            const handler = (position) => {
                eventBus.off('HUMAN_ATTACK_INPUT', handler);
                resolve(position);
            }

            eventBus.on('HUMAN_ATTACK_INPUT', handler);
        });
        return promise;
    }

    // hook it to attack resolves in the controller
    function onAttackResult(_move, _result){
        // noop
    }

    return Object.freeze({requestMove, onAttackResult});
}