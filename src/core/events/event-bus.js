const eventBus = (
    function() {
        const events = {};

        function createEvent(type){
            if(typeof type !== 'string'){
                throw new TypeError('Expects type to be a string');
            }

            if(events[type]){
                return;
            }
            
            events[type] = [];
        }

        function on(type, ...handlers){
            if(typeof type !== 'string'){
                throw new TypeError('Expects type to be a string');
            }

            if(handlers.some(handler => typeof handler !== 'function')){
                throw new TypeError('Expects all handlers to be functions');
            }

            if(!handlers || handlers.length === 0){
                throw new RangeError('Expects one or more handlers for subscription');
            }

            if(!events[type]){
                createEvent(type);
            }
            
            events[type].push(...handlers);
        }

        function off(type, handler){
            if(typeof type !== 'string'){
                throw new TypeError('Expects type to be a string');
            }

            if(typeof handler !== 'function'){
                throw new TypeError('Expects handler to be a function');
            }

            let handlers = events[type];
        
            if(!handlers){
                return;
            }
        
            let index = handlers.findIndex( item  => item === handler);
            if(index !== -1) handlers.splice(index, 1);
        }

        function emit(type, data){
            if(typeof type !== 'string'){
                throw new TypeError('Expects type to be a string');
            }

            let handlers = events[type];
            
            if(!handlers){
                createEvent(type);
                handlers = events[type];
            }
            
            for(let handler of handlers){
                handler(data);
            }
        }

        function clear(){
            const keys = Object.keys(events);

            for(let key of keys){
                delete events[key];
            }
        }

        return {
            on,
            off,
            emit,
            clear
        };
    }
)();


export { eventBus };