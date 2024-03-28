import { initialiseDraw, collider } from "./tree.js";
const zoomObject = {
    zoom:0.05,
    scale:0.3,
}

const mouseObject = {
    mousedown:false,
    ydirection:0,
    xdirection:0
}
export const wheel = (canvas) =>{
    canvas.onwheel = (e) =>{
        switch(true)
        {
            case Math.sign(e.deltaY) === -1:
                zoomObject.scale += zoomObject.zoom;
                zoomObject.scale = zoomObject.scale > 4 ? 4 : zoomObject.scale
            break
            case Math.sign(e.deltaY) === 1:
                zoomObject.scale -= zoomObject.zoom;
                zoomObject.scale = zoomObject.scale < 0.1 ? 0.1 : zoomObject.scale
            break
        }
        initialiseDraw({
            zoomObject:zoomObject
        })
    }
}

export const mouseDirection = (canvas) =>{
    canvas.onmousedown = (e) =>{
        mouseObject.mousedown = true;
        mouseObject.xdirection = e.x
        mouseObject.ydirection = e.y;
        // console.log((e.x/zoomObject.scale)*2)
    }
    canvas.onclick = (e) =>{
        collider(e.x,e.y);
    }   
    
    canvas.onmouseup = (e) =>{
        mouseObject.mousedown = false;
    }

    canvas.onmousemove = (e) =>{
        const renderMouse = () =>{
            const directionObject = {
                left:false,
                right:false,
                up:false,
                down:false
            }
            //horizontal
            switch(true)
            {
                case mouseObject.xdirection - e.x > 1:
                    directionObject.left = true;
                    mouseObject.xdirection = e.x
                break;
                case mouseObject.xdirection - e.x < -1:
                    directionObject.right = true
                    mouseObject.xdirection = e.x
            }
            //vertical
            switch(true)
            {
                case mouseObject.ydirection - e.y > 1:
                    directionObject.up = true;
                    mouseObject.ydirection = e.y
                break;
                case mouseObject.ydirection - e.y < -1:
                    directionObject.down = true
                    mouseObject.ydirection = e.y
            }
            initialiseDraw({
                direction:directionObject
            })
        }
        switch(true)
        {
            case mouseObject.mousedown:
                renderMouse()
        }
    }
}