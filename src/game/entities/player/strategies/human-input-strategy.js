import {eventBus} from '../../../../core/events/event-bus.js';


function getAttackPosition(){
    const promise = new Promise((resolve) => {
        const handler = (position) => {
            eventBus.off('HUMAN_ATTACK_INPUT', handler);
            resolve(position);
        }

        eventBus.on('HUMAN_ATTACK_INPUT', handler);
    });
    return promise;
}
export default {getAttackPosition};