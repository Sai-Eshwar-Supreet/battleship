function createElement({type, textContent = undefined, classList = [], dataset = {}, attributes = {} }){
    if(!type || typeof(type) !== 'string') throw Error(`Expected type string. Provided: ${type}`);

    const element = document.createElement(type);

    if(!!textContent && typeof textContent === 'string') element.textContent = textContent;

    if(Array.isArray(classList) && classList.length > 0){
        element.classList.add(...classList.filter(c => (!!c && typeof c === "string")));
    }

    if(!!dataset && typeof dataset === "object"){
        for(let [key, value] of Object.entries(dataset)){
            element.dataset[key] = String(value);
        }
    }

    if(!!attributes && typeof attributes === "object"){
        for(let [key, value] of Object.entries(attributes)){
            if(key in element) element[key] = value;
            else element.setAttribute(key, String(value));
        }
    }

    return element;
}

function createElementRecursively(blueprint){
     if(!blueprint || (typeof blueprint !== 'object')) return;
    const parent = createElement(blueprint);

    if(!parent) return;

    const children = blueprint.children;

    if(!!children && Array.isArray(children)){

        const nodes = children
            .map(childBlueprint => createElementRecursively(childBlueprint))
            .filter(Boolean);

        parent.append(...nodes);
    }

    return parent;
}

export {createElement, createElementRecursively};