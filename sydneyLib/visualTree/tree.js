import { wheel, mouseDirection } from "./events.js";
import { callback } from "./treeDesign.js";
import { useState, sydDOM, getState} from "../sydneyDom.js";


const ws = new WebSocket(`ws://localhost:${port}`);
const addDefault = (element) =>{
    const style = {
        padding:'0',
        margin:'0',
        'box-sizing':'border-box',
        overflow:'scroll',
        height:'100vh',
        width:'100vw',
        overflow:'hidden',
        background:'lightgrey'
    };

    Object.keys(style).forEach(val =>{
        element.style[`${val}`] = style[val]
    })
}

class branchObject{
    constructor()
    {
        this.name = '';
        this.tag = '';
        this.attributes = {},
        this.style = '';
        this.appendStyle = (text,breaker) =>{
            const subText = text.split(breaker);
            for(let i = 0; i < subText.length; i++)
            {
                let batch = subText[i].split('=');
                batch = batch.join(':')+';';
                subText[i] = batch
            }
            console.log(subText.join(' '));
            //set the valueof the this.style from here
        }
        this.state = {
            stateName:null,
            state:null
        }
        this.children = []
    }
}
export const treeDataObject = {
    tree:null,
    cordTree:new Object(),
    vHeight:50,
    canvas:null,
    ctx:null,
    fixed:null,
    rootX:null,
    rootY:20,
    dragSpeed:5,
    addCanvas:(canvas) =>{
        document.body.appendChild(canvas)
        canvas.height = window.innerHeight*2;
        canvas.width = window.innerWidth*2;
        //wheel event initialisation start
        wheel(canvas);
        // wheel event initialisation ends

        // mouse direction start
        mouseDirection(canvas)
        //mouse direction ends
        treeDataObject.rootX = canvas.width/2,
        addDefault(canvas),
        addDefault(document.body)
    },
    xWidth:50,
    nodeCount:0,
    colorCount:0,
    colliderRadi:40,
    ctxScale:0.3,
    thickness:10,
    renderer:{},
    color:'#171717',
    colors:['red','cyan','blue', 'purple', 'green','violet'],
    currentNode:'node 1',
    branchAddState:{}
}
treeDataObject.canvas = document.createElement('canvas');
treeDataObject.ctx = treeDataObject.canvas.getContext('2d');
treeDataObject.addCanvas(treeDataObject.canvas);

export const initialiseDraw = ({zoomObject = {},direction = {}} = {}) =>{
    treeDataObject.nodeCount = 0;
    treeDataObject.fixed = (treeDataObject.canvas.width)/4
    treeDataObject.ctx.clearRect(0,0,treeDataObject.canvas.width,treeDataObject.canvas.height);
    zoomObject.scale = zoomObject.scale === undefined ? treeDataObject.ctxScale : zoomObject.scale
    treeDataObject.ctxScale = zoomObject.scale;
    const updateRootX = () =>{
        switch(true)
        {
            case direction.left:
                treeDataObject.rootX -= (treeDataObject.dragSpeed/treeDataObject.ctxScale);
            break;
            case direction.right:
                treeDataObject.rootX += (treeDataObject.dragSpeed/treeDataObject.ctxScale)
        }

        if(direction.up)
        {
            treeDataObject.rootY -= (treeDataObject.dragSpeed/treeDataObject.ctxScale)
        }else if(direction.down)
        {
            treeDataObject.rootY += (treeDataObject.dragSpeed/treeDataObject.ctxScale)
        }
    }
    updateRootX()
    startCtx(treeDataObject.tree,(treeDataObject.rootX/treeDataObject.ctxScale),treeDataObject.rootY,1,true,['node 1']);
    // console.log(treeDataObject.cordTree['node 2'])
}

export const collider = (x,y) =>{
    let xcord = (x/treeDataObject.ctxScale)*2;
    let ycord = (y/treeDataObject.ctxScale)*2;
    let collided = false;
    let stateCord = {x,y}
    // console.log(xcord,' this is the x cord', ycord, ' this is the y cord');
    for(let [renderNodes,state] of Object.entries(treeDataObject.renderer))
    {
        // if(state)
        // {
            const main = treeDataObject.cordTree[renderNodes].node;
            if(xcord > main.vx-treeDataObject.colliderRadi && xcord < main.vx+treeDataObject.colliderRadi && ycord > main.vy2-treeDataObject.colliderRadi && ycord < main.vy2+treeDataObject.colliderRadi)
            {
                    treeDataObject.currentNode = renderNodes;

                    treeDataObject.renderer[renderNodes] = treeDataObject.renderer[renderNodes] ? false : true;
                    initialiseDraw();
                    stateCord.x = ((main.vx+treeDataObject.colliderRadi*2)*treeDataObject.ctxScale)/treeDataObject.canvas.width*100;
                    stateCord.y = ((main.vy2)*treeDataObject.ctxScale)/treeDataObject.canvas.height*100;
                    collided = true;
                    // console.log(treeDataObject.branchAddState[renderNodes])
                    //states update;
                    useState('float',{type:'a',value:{left:stateCord.x,top:stateCord.y,display:'flex'}});
                    useState('topDesign',{type:'a', value:renderNodes});
                    let sideState = getState('sideDesign');
                    sideState.display = 'none';
                    sideState.node = 1;
                    useState('sideDesign',{type:'a',value:sideState});
                break;
            }
    }
    if(!collided){
            useState('float',{type:'a',value:{left:0,top:0}});
        };
}


ws.addEventListener('open', e =>{
    ws.send(JSON.stringify({header:'requestTree'}))
})

ws.addEventListener('message', ({data}) =>{
    let refined = JSON.parse(data);
    if(refined.header === 'treeData' && refined.data !== null)
    {
        treeDataObject.tree = refined.data;
        treeDataObject.branchAddState = new Object();
        treeDataObject.renderer = new Object();
        treeDataObject.cordTree = new Object()
        // treeDataObject.tree = sydDOM.float();
        initialiseDraw();
    }else{
        alert('no data has been sent')
    }
})

class vertival_line{
    constructor({startx,starty,hlimit,init,parent,bloodLine,name})
    {
        this.vy1 = starty + treeDataObject.colliderRadi;
        this.vy2 = this.vy1 + treeDataObject.vHeight*5*hlimit;
        this.vx = startx;
        // console.log(treeDataObject.renderer[name])

        this.draw = () =>{
            treeDataObject.ctx.save();
            treeDataObject.ctx.scale(treeDataObject.ctxScale,treeDataObject.ctxScale);
            treeDataObject.ctx.strokeStyle = treeDataObject.color
            treeDataObject.ctx.lineWidth = treeDataObject.thickness
            treeDataObject.ctx.beginPath()
            treeDataObject.ctx.moveTo(this.vx,this.vy1)
            treeDataObject.ctx.lineTo(this.vx,this.vy2)
            treeDataObject.ctx.stroke();
            treeDataObject.ctx.closePath()
    
            treeDataObject.ctx.beginPath();
            treeDataObject.ctx.fillStyle = 'grey'
            treeDataObject.ctx.arc(this.vx,this.vy2,treeDataObject.colliderRadi,0,Math.PI*2);
            treeDataObject.ctx.fill();
            treeDataObject.ctx.closePath();
            treeDataObject.ctx.restore()
        }
        this.renderBool = bloodLine.every(val =>{return treeDataObject.renderer[val] === true})
             
        // console.log(this.renderBool, name)
        if(this.renderBool)
        {
            for(let i = 0; i < 5; i++)
            {
                this.draw();
            }
        }
    }
}

class inverted_T_class{
    constructor({startx,starty,hlimit,init,child,parent,bloodLine,name})
    {
        //for vertical line, we use the start x as x cordinate
        //for horizontal line, we use this.y2 as y cordinate
        //(treeDataObject.xWidth/100)*treeDataObject.canvas.width;
        // console.log()
        this.vy1 = starty + treeDataObject.colliderRadi;
        // console.log(name, child.length, hlimit)
        this.vy2 = this.vy1 + (treeDataObject.vHeight*5*hlimit);
        this.vx = startx;
        this.PwidthParam = init ? (treeDataObject.canvas.width/2)*child.length : (treeDataObject.fixed*child.length);
        this.hx1 = startx - this.PwidthParam;
        this.hx2 = startx + this.PwidthParam;
        this.hy = this.vy2 + treeDataObject.colliderRadi;
        this.draw = () =>{
            //vertical
            treeDataObject.ctx.save();
            treeDataObject.ctx.scale(treeDataObject.ctxScale,treeDataObject.ctxScale);
            treeDataObject.ctx.strokeStyle = treeDataObject.color
            treeDataObject.ctx.lineWidth = treeDataObject.thickness
            treeDataObject.ctx.beginPath()
            treeDataObject.ctx.moveTo(this.vx,this.vy1)
            treeDataObject.ctx.lineTo(this.vx,this.vy2)
            treeDataObject.ctx.stroke();
            treeDataObject.ctx.closePath()

            if(treeDataObject.renderer[name] === false)
            {
                treeDataObject.ctx.beginPath();
                treeDataObject.ctx.fillStyle = 'red'
                treeDataObject.ctx.arc(this.vx,this.vy2,treeDataObject.colliderRadi,0,Math.PI*2);
                treeDataObject.ctx.fill();
                treeDataObject.ctx.fillStyle = treeDataObject.color
                treeDataObject.ctx.closePath()
            }else if(treeDataObject.renderer[name] === true){
                treeDataObject.ctx.beginPath();
                treeDataObject.ctx.fillStyle = 'green'
                treeDataObject.ctx.arc(this.vx,this.vy2,treeDataObject.colliderRadi,0,Math.PI*2);
                treeDataObject.ctx.fill();
                treeDataObject.ctx.fillStyle = treeDataObject.color
                treeDataObject.ctx.closePath()
            }

            //horizontal
            if(child.length > 1 && treeDataObject.renderer[name] !== false)
            {
                treeDataObject.ctx.beginPath()
                treeDataObject.ctx.moveTo(this.hx1,this.hy)
                treeDataObject.ctx.lineTo(this.hx2,this.hy)
                treeDataObject.ctx.stroke();
                treeDataObject.ctx.closePath()
            }
            treeDataObject.ctx.restore();
        }
        this.renderBool = bloodLine.every(val =>{return treeDataObject.renderer[val] === true});
             
        // console.log(this.renderBool, name)

        if(this.renderBool)
        {
            for(let i = 0; i < 5; i++)
            {
                this.draw();
            }
        }
    }
}
 
function startCtx(parentObj,startx,starty,hlimit,init,parent = {}){
    treeDataObject.nodeCount++;

        let name = `node ${treeDataObject.nodeCount}`;
        switch(true)
        {
            case parentObj.children !== undefined:
                parentObj.children = parentObj.children.length === 0 ? undefined : parentObj.children
        }
        treeDataObject.cordTree[name] = new Object()
        treeDataObject.cordTree[name].dom = parentObj;
        parent.bloodLine = parent.bloodLine === undefined ? [] : parent.bloodLine

        const drawnode = () =>{
            if(parentObj.children !== undefined)
            {
                treeDataObject.cordTree[name].dom.bloodLine = [...parent.bloodLine,name];
                treeDataObject.cordTree[name].dom.staticName = name;
                //This is the spot for turning on or off global tree rendere
                treeDataObject.renderer[name] = treeDataObject.renderer[name] === undefined ? true : treeDataObject.renderer[name];
                treeDataObject.branchAddState[name] = new branchObject();
                switch(true)
                {
                    case treeDataObject.renderer[parent.staticName] === false:
                        treeDataObject.renderer[name] = false
                }
                treeDataObject.cordTree[name].node = new inverted_T_class(
                    {
                        startx:startx,
                        starty:starty,
                        hlimit:hlimit,
                        init:init,
                        child:parentObj.children,
                        parent:parentObj,
                        bloodLine:parent.bloodLine,
                        name:name
                    }
                );
                    switch(true)
                    {
                        case parentObj.children.length > 1:
                            let childRange = (treeDataObject.cordTree[name].node.hx2-treeDataObject.cordTree[name].node.hx1)/(parentObj.children.length-1);
                            for(let id in parentObj.children)
                            {
                                startCtx(parentObj.children[Number(id)],treeDataObject.cordTree[name].node.hx1+(childRange*id),treeDataObject.cordTree[name].node.vy2,(Number(id)+1),false,treeDataObject.cordTree[name].dom)
                            }
                        break;
                        case parentObj.children.length === 1:
                            startCtx(parentObj.children[0],treeDataObject.cordTree[name].node.vx,treeDataObject.cordTree[name].node.vy2,1,false,treeDataObject.cordTree[name].dom)
                    }
                // }
            }else if(parentObj.children === undefined)
            {
                treeDataObject.cordTree[name].node = new vertival_line(
                    {
                        startx:startx,
                        starty:starty,
                        hlimit:hlimit,
                        init:init,
                        parent:parentObj,
                        bloodLine:parent.bloodLine,
                        name:name
                    }
                )
            }
        }

        drawnode()
}