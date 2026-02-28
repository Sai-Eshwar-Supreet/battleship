export function deepFreeze(obj){
    if(!obj || (typeof obj !== 'object' && typeof obj !== 'function') || Object.isFrozen(obj)){
        return obj;
    }

    Object.freeze(obj);

    Object.getOwnPropertyNames(obj).forEach(key => deepFreeze(obj[key]));
    
    return obj;
}