const visualTreeParams = {
    ws:null,
    mounted:false,
    sent:false,
    root:'container'
}
class addStyleComponent{
    constructor(style)
    {

        this.defaultStyle = style;
        this.capitals = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const refineX = (x) =>{
            let dummy = x;
            for(let index in dummy)
            {
               if(this.capitals.includes(dummy[index]))
               {
                    let idNum = dummy.indexOf(dummy[index]);
                    dummy = dummy.slice(0,idNum)+`-${dummy[index].toLowerCase()}`+dummy.slice(idNum+1,dummy.length)
               }
            }
            return dummy;
        }
        this.merge = (useObj) =>{
            let string = new String();
            for(let [x,y] of Object.entries(useObj))
            {
                x = refineX(x);
                let styleEntity = `${x}: ${y}; `
                string += styleEntity;
            }
            return string;
        }
        this.mergedStyle = this.merge(this.defaultStyle);

        this.update = (cmd = {}) =>{
            let returnable;
            let newStyle = new Object;
            Object.assign(newStyle,this.defaultStyle);
            
            const operation = (obj = {}) =>{
                let {method,style} = obj;
                switch(true)
                {
                    case method === 'remove':
                        style = style === undefined ? [] : style;
                        for(let x of style)
                        {
                            if(x in newStyle)
                            {
                                delete newStyle[x];
                            }
                        }
                        returnable = this.merge(newStyle);
                    break;
                    case method === 'add':
                        style = style === undefined ? {} : style;
                        for(let [y,z = ''] of Object.entries(style))
                        {
                            newStyle[y] = z;
                        }
                        returnable = this.merge(newStyle);
                    break;
                    case method === 'use':
                        style = style === undefined ? [] : style;
                        const newStylePatch = new Object();
                        for(let x of style)
                        {
                            if(x in newStyle)
                            {
                                newStylePatch[x] = newStyle[x]
                            }
                        };
                        newStyle = newStylePatch
                        // console.log(newStyle,newStylePatch)
                        returnable = this.merge(newStylePatch)
                    break;
                    default:
                        returnable = this.mergedStyle;
                }
            }

            try{
                cmd.forEach(val =>{
                    operation(val)
                })
            }
            catch(err)
            {
                operation(cmd)
            }
            return returnable;
        }
    }
}
export const sydDOM = new Object();
export const virtualDom = new Object();
export const DomType = new Object();
export const styleComponent = new Object();
export const setStyle = (styleArray = []) =>{
    let returnable = []
    const run = ({nameTag,style = {}}) =>{
        if(nameTag === undefined)
        {
            console.error("please enter a style name for reference")
        }else{
            styleComponent[nameTag] = new addStyleComponent(style).update;
            returnable.push(styleComponent[nameTag]());
        }
    }
    switch(true)
    {
        case styleArray.length !== undefined:
            // styleArray.style = styleArray.style === undefined ? {} : styleArray.style;
            for(let elem of styleArray)
            {
                run(elem)
            }
        break;
        default:
            styleArray.style = styleArray.style === undefined ? {} : styleArray.style;
            run(styleArray)
    }
   return returnable.length === 1 ? returnable[0] : returnable;
}
//RENDER SECTION

class creator{
    constructor({tagname,attribute,children,Dom,createState})
    {
        this.element = document.createElement(tagname);
        switch(true)
        {
            case Dom !== null:  
                virtualDom[Dom] = this.element;
                DomType[Dom] = Dom;
        }
        Object.keys(attribute).forEach((val,id,array)=>{
            let value = attribute[val] === 'true' ? true : attribute[val]
            value = attribute[val] === 'false' ? false : value
            this.element.setAttribute(val,value)
        })
        children.forEach(val =>{
           const child = render(val);
           this.element.appendChild(child);
        })
    }
}
export const render = (vapp) =>{
    if(typeof vapp === 'string') 
    {
        return document.createTextNode(vapp)
    }else return new creator(vapp).element
}

//MOUNT SECTION

export const mount = (VDom) =>{
    const Dom = render(VDom);
    document.getElementById('root').replaceWith(Dom);
    visualTreeParams.mounted = true;
    if(visualTreeParams['ws'] !== null)
    {
        visualTreeParams['ws'].addEventListener('open', e =>{
            console.log(visualTreeParams['root'])
            visualTreeParams['ws'].send(JSON.stringify({header:'visualTree',data:sydDOM[visualTreeParams['root']]()}));
        })
        visualTreeParams.sent = true;
    }
    return Dom
}


// DIFFING ALGORITHM

class diffAlgo{
    constructor(type,oldVApp,newVApp)
    {
        this.oldVApp = oldVApp;
        this.newVApp = newVApp;
        this.$dom = virtualDom[type];
        this.Ndom = [];
        this.patches = new Array();
        diffAlgo.startDiffing(this)
    }
    static startDiffing(params)
    {
        const {oldVApp,newVApp,$dom} = params;
        let {patches} = params;

        const startTagComparison = (oldVApp,newVApp) =>{
            switch(true)
            {
                case oldVApp.tagname === newVApp.tagname:
                    return true;
                break;
                default:
                    return false;
            }
        }


        const updateAttr = (oldVAppAttr,newVAppAttr,parent) =>{
            for(let [x,y] of Object.entries(newVAppAttr))
            {
                switch(true)
                {
                    case !(x in oldVAppAttr) || y !== oldVAppAttr[x]:
                        patches.push(
                            [parent,parent =>{
                                parent.setAttribute(x,y)
                            }]
                        )
                    break;
                }
            }

            for(let [x,y] of Object.entries(oldVAppAttr))
            {
                if(!(x in newVAppAttr))
                {
                    patches.push(
                        [parent,parent =>{
                            parent.removeAttribute(x);
                        }]
                    )
                }
            }
        }

        const zip = (Ochildren,Nchildren) =>{
            const zipped = new Array();
            for(let i = 0; i < Math.min(Ochildren.length,Nchildren.length); i++){
                zipped.push([Ochildren[i],Nchildren[i]])
            }
            return zipped
        }

        const updateChild = (Ochildren,Nchildren,parent) =>{
            const arrays = zip(Ochildren,Nchildren);
            // console.log(Ochildren.length, arrays.length,parent.childNodes)
            arrays.forEach((val,idx) =>{
                if(val.length > 0)
                {
                    switch(true)
                    {
                        case parent.childNodes[idx] === undefined:
                            // console.log(arrays, parent, ' parent ', idx, ' index ')
                    }
                    startchildProcess(val[0],val[1],parent.childNodes[idx])
                }
            });

            for(let i = 0; i < Nchildren.length; i++)
            {
                switch(true)
                {
                    case i > arrays.length-1:
                        patches.push(
                            [parent,parent =>{
                                parent.appendChild(render(Nchildren[i]));
                            }]
                        ) 
                }
            }

            const dummy = [];

            for(let i = 0; i < Ochildren.length; i++)
            {
                switch(true)
                {
                    case i > arrays.length-1:
                        dummy.push(i)
                }
            }
            for(let i = dummy.length-1; i >= 0;i--)
            {
                patches.push(
                    [parent,parent =>{
                        // switch(true)
                        // {
                        //     case parent.childNodes[dummy[i]] === undefined:
                        //         console.log(Ochildren, ' old children', Nchildren, ' new children', parent)
                        // }
                        parent.removeChild(parent.childNodes[dummy[i]]);
                    }]
                ) 
            }
        }

        const stringProcess = (parent,newVApp) =>{
            patches.push(
                [parent,parent =>{
                    parent.replaceWith(render(newVApp));
                }]
            )
        }

        const startchildProcess = (oldVApp,newVApp,parent) =>{
            switch(true)
            {
                case typeof newVApp === 'string':
                    switch(true)
                    {
                        case newVApp !== oldVApp:
                            stringProcess(parent,newVApp);
                    }
                break;
                default:
                    const boolean = startTagComparison(oldVApp,newVApp);
                    switch(true)
                    {
                        case boolean:
                            updateAttr(oldVApp.attribute,newVApp.attribute,parent);
                            updateChild(oldVApp.children,newVApp.children,parent);
                        break;
                        default:
                            patches.push(
                                [parent,parent =>{
                                    parent.replaceWith(render(newVApp));
                                }]
                            ) 
                    }
            }
        }
        startchildProcess(oldVApp,newVApp,$dom);
        
        patches.forEach(val => val[1](val[0]));
    }
}

export const sydDiff = ({type, oldVApp, newVApp}) =>{
    new diffAlgo(type,oldVApp,newVApp);
}
// export default diffAlgo;

//CREATE ELEMENT SECTION

class createElementClass{
    constructor(tagname,attribute,children,type,createState)
    {
        this.mainObj = new Object;
        this.mainObj.tagname = tagname;
        this.mainObj.attribute = attribute;
        this.mainObj.children = children;
        this.mainObj.Dom = type;
        this.mainObj.createState = createState
        this.mainObj.removeAttr = (attrArray) =>{
            for(let attrName of attrArray)
            {
                if(attrName in this.mainObj.attribute)
                {
                    delete this.mainObj.attribute[attrName];
                }
            }
            return this.mainObj;
        }

        this.addStateDom = () =>{
            if(GlobalState[createState.stateName] === undefined)
            {
                if(Object.keys(createState).length > 0)
                {
                    setState(
                        createState
                    )
                }
            }
        }
        this.addStateDom()

        this.mainObj.addAttr = (objectAttr = {}) =>{
            Object.entries(objectAttr).forEach(val =>{
                let [x,y] = val;
                y = y === null ? "" : y;
                this.mainObj.attribute[x] = y;
            })
            return this.mainObj;
        }

        this.mainObj.removeChild = (index = this.mainObj.children.length-1) =>{
            let array = true;
            try{
                index.forEach(val =>{})
            }catch(err)
            {
                array = false
            }
            const mainOperation = (index) =>{
                switch(true)
                {
                    case this.mainObj.children[index] !== undefined:
                        this.mainObj.children.splice(index,1);
                    break;
                    default:
                        console.warn('the specified index does not exist')
                }
            }
            switch(true)
            {
                case array:
                    index.forEach((val,idx) =>{
                        mainOperation(val);
                        switch(true)
                        {
                            case index[idx+1] !== undefined:
                                index[idx+1]--;
                        }
                    });
                break;
                default:
                    mainOperation(index)
            }
            return this.mainObj
        }

        this.mainObj.inherit = (array) =>{
            let temporal = this.mainObj;
            for(let i = 0; i < array.length; i++)
            {
                if(temporal[array[i]] !== undefined)
                {
                    temporal = temporal[array[i]];
                }else{
                    break;
                }
            }
            return temporal
        }


        const elementalUpdate = (position,element) =>{
            switch(true)
            {
                case element !== undefined:
                    switch(true)
                    {
                        case position === 'end':
                            this.mainObj.children.push(element);
                        break;
                        case position === 'start':
                            this.mainObj.children.unshift(element)
                        break;
                        default:
                            if(!isNaN(Number(position)))
                            {
                                switch(true)
                                {
                                    case position < this.mainObj.children.length:
                                        this.mainObj.children = [...this.mainObj.children.slice(0,position),element,...this.mainObj.children.slice(position,this.mainObj.children.length)]
                                    break;
                                    default:
                                        console.warn('invalid position parameter!')
                                }
                            }else console.warn('please enter a valid position argument')
                    }
                break;
                default:
                    console.warn('please enter a valid element to add')
            }
        }
        this.mainObj.addChild = ({position = 'end', element = undefined} = {}) =>{
            elementalUpdate(position,element)
            return this.mainObj;
        }

        this.mainObj.replaceChild = ({position,element}) =>{
            if(position === undefined || element === undefined )
            {
                console.warn('please enter a valid argument for position and element')
            }else{
                this.mainObj.children[position] = element;
            }
            return this.mainObj;
        }
    }
}

export const createElement = (tagname = 'div', attribute = {}, children = [],{type = null,createState = {}} = {}) =>{
   return new createElementClass(tagname,attribute,children,type,createState).mainObj
}

// STATES SECTION

class createState{
    constructor(name,newstate,tenary,tenaryOptions)
    {
        this.object = new Object();
        this.object.stateName = name;
        this.object.count = 0;
        this.object.new = newstate;
        this.object.old = 0;
        this.object.tenary = tenary;
        this.tenaryOptions = tenaryOptions;
        this.object.oldAppDiff = {};
        this.newAppDiff = {};
        // console.log(newstate,oldstate)
        this.loadTenary = () =>{
            if(tenary)
            {
                this.object.old = this.tenaryOptions[0];
                this.object.new = this.tenaryOptions[1];
            }
        }
        this.loadTenary();

        const commenceDiffAlgorithm = () =>{
            const oldapp = this.object.oldAppDiff
            const newapp = sydDOM[this.object.stateName]();
            // console.log(this.oldAppDiff,' old app', newapp, ' new app', virtualDom[this.object.stateName])//problem is here, the old virtual app is still been updated by the state, even after the virtual branch has been created
            if(oldapp !== newapp)
            {
                sydDiff(
                    {
                        type:this.object.stateName,
                        oldVApp:oldapp,
                        newVApp:newapp
                    }
                )
            }
        }
        
        this.object.update = (type,value) =>{
            // switch(true)
            // {
            //     case this.object.stateName === 'sideDesign':
            //         console.log(this.oldAppDiff, ' this is from states')
            // }
            // this.oldAppDiff = sydDOM[this.object.stateName]();
                // Object.assign(this.object.oldAppDiff,sydDOM[this.object.stateName]());
            switch(true)
            {
                case this.object.tenary:
                    commenceDiffAlgorithm()
                    this.object.old = this.object.new;
                    this.object.new = this.object.new === this.tenaryOptions[0] ? this.tenaryOptions[1] : this.tenaryOptions[0];
                break;
                case type === 'i' || type === 'increment':
                    if(!isNaN(Number(this.object.new)))
                    {
                        this.object.old = this.object.new;
                        this.object.new += value;
                        commenceDiffAlgorithm()
                    }else console.warn(`cannot increment a state of type ${typeof this.object.new}`)
                break;
                case type === 'a' || type === 'assign':
                    this.object.old = this.object.new;
                    this.object.new = value;
                    commenceDiffAlgorithm()
                break;
                case type === 'd'|| type === 'decrement':
                    if(!isNaN(Number(this.object.new))){
                        if(this.object.new > 0)
                        {
                            this.object.old = this.object.new;
                            this.object.new -= value;
                        }else{
                            this.object.old = this.object.new;
                            this.object.new = 0;
                        }
                        commenceDiffAlgorithm()
                    }else console.warn(`cannot decrement a state of type ${typeof this.object.new}`);
                break;
            }

            return this.object
        }
    }
}

const GlobalState = new Object();
//{newstate = 0,tenary = false, tenaryOptions = [false,true], state}
export const setState = ({stateName,state = 0, tenary = false, tenaryOptions = [false,true]}) =>{
    let newstate = state;
    switch(true)
    {
        case stateName !== undefined:
            GlobalState[stateName] = new createState(stateName,newstate,tenary,tenaryOptions).object;
        break;
        default: console.error('Enter a name for the addState')
    }
}

export const getState = (stateName) =>{
    let object = new Object
    let returnable = undefined;
    if(GlobalState[stateName] !== undefined)
    {
        for(let [n,v] of Object.entries(GlobalState[stateName].new))
        {
            object[n] = v;
        }
        GlobalState[stateName].oldAppDiff = sydDOM[stateName]()
        returnable = object;
    }

    return returnable;
}

export const useState = (name,{type = 'i',value = 1} = {}) =>{
    switch(true)
    {
        case GlobalState[name] !== undefined && type !== undefined:
            return GlobalState[name].update(type,value);
            //[version]
        break;
        default:
            // console.error('State Does Not Exist');
            return GlobalState[name];
    }
}

export const visualTree = ({visual = false,port = 9090,root = 'container'}) =>{
    switch(true)
    {
        case visual:
            visualTreeParams['ws'] = new WebSocket(`ws://localhost:${port}`);
            visualTreeParams['root'] = root
                visualTreeParams['ws'].addEventListener('open', e =>{
                    if(visualTreeParams.mounted && !visualTreeParams.sent && Object.keys(sydDOM).length > 0)
                    {
                        visualTreeParams['ws'].send(JSON.stringify({header:'visualTree',data:sydDOM[visualTreeParams['root']]()}));
                    }
                })  
    }
}
export const preState = (acessNames,defaultState) =>{
    let arrayBool = true;
    let stateName = ''
    try{
        acessNames.forEach(val =>{})
    }catch(err){
        arrayBool = false
    }
    stateName = arrayBool ? acessNames[0] : acessNames
    let resolve;
    if(GlobalState[stateName] !== undefined)
    {
        resolve = GlobalState[stateName].new;
        if(arrayBool)
        {
            for(let i = 1; i < acessNames.length; i++)
            {
                if(resolve[acessNames[i]] !== undefined)
                {
                    resolve = resolve[acessNames[i]];
                }else{
                    resolve = defaultState
                }
            }
        }
    }else
    {
        resolve = defaultState
    }
    return resolve
}