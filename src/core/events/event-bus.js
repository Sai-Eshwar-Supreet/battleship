const eventBus = (
    function() {
        const events = {};

        function createEvent(type){
            if(events[type]){
                return;
            }
            
            events[type] = [];
        }

        function on(type, ...handlers){
            if(!events[type]){
                createEvent(type);
            }
            
            events[type].push(...handlers);
        }

        function off(type, handler){
            let handlers = events[type];
        
            if(!handlers){
                return;
            }
        
            if(handler){
                let index = handlers.findIndex( item  => item === handler);
                if(index !== -1) handlers.splice(index, 1);
            }
        }

        function emit(type, data){
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