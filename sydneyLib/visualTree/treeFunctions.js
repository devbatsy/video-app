import { useState , getState} from "../sydneyDom.js";
import {treeDataObject} from './tree.js';
const branchStatePack = {
    '0':{}
}
togBottomDesign = () =>{
    useState('bottomDesign',{type:'a',value:'flex'});
    let currentState = getState('sideDesign');
    currentState.display = 'none';
    useState('sideDesign',{type:'a',value:currentState});
}

togSideDesign = (num) =>{
    let currentState = getState('sideDesign');
    currentState.node = num,
    currentState.display = 'block';
    currentState.currentNode = treeDataObject.currentNode
    currentState.nodeInfo = treeDataObject.cordTree[treeDataObject.currentNode].dom;
    currentState.branchSaveState = treeDataObject.branchAddState[treeDataObject.currentNode];
    switch(true)
    {
        case currentState.addBranch[treeDataObject.currentNode] === undefined:
            currentState.addBranch[treeDataObject.currentNode] = {};
            currentState.addBranch[treeDataObject.currentNode].attrI = 1;
            currentState.addBranch[treeDataObject.currentNode].attrSaveData = branchStatePack;
    }
    useState('sideDesign',{type:'a',value:currentState});
    useState('bottomDesign',{type:'a',value:'none'});
}

traceNode = (node) =>{
    console.log(node)
}

toggleBranchAdd = () =>{
    console.log('lets add some branch to this node')
}

addInput = (elementValue, ref) =>{
    let currentState = getState('sideDesign');
    currentState.addBranch[treeDataObject.currentNode][ref] = elementValue;
    useState('sideDesign',{type:'a',value:currentState});
}

addAInput = () =>{
    let currentState = {}
    Object.assign(currentState,getState('sideDesign'));
    currentState.addBranch[treeDataObject.currentNode].attrI++;
    let num = currentState.addBranch[treeDataObject.currentNode].attrI
    currentState.addBranch[treeDataObject.currentNode].attrSaveData[`${num-1}`] = {};
    currentState.addBranch[treeDataObject.currentNode].attrSaveData[`${num-1}`]['i'] = '';
    currentState.addBranch[treeDataObject.currentNode].attrSaveData[`${num-1}`]['j'] = '';
    useState('sideDesign',{type:'a',value:currentState});
}

addInputSec2 = (text,ref1,ref2) =>{
    let currentState = getState('sideDesign');
    currentState.addBranch[treeDataObject.currentNode].attrSaveData[ref1][ref2] = text;
    useState('sideDesign',{type:'a',value:currentState});
}
textAreaInput = (text) =>{
    let currentState = getState('sideDesign');
    currentState.addBranch[treeDataObject.currentNode].styleSaveData = text;
    useState('sideDesign',{type:'a',value:currentState});
}
addCinput = () =>{
    console.log('am adding children')
}