import {createElement, setStyle, sydDOM, mount, styleComponent, useState, preState} from '../sydneyDom.js';
import {} from './treeFunctions.js'

export const callback = () =>{
    console.log('design js is running')
}

setStyle(
    [
        {
            nameTag:'square',
            style:{
                height:'300px',
                width:'200px',
                padding:'5px',
                borderRadius:'10px',
            }
        },
        {
            nameTag:'font',
            style:{
                fontFamily:'high tower text',
                fontSize:'30px',
                textTransform:'capitalize',
                fontWeight:'900',
            }
        },
        {
            nameTag:'flex',
            style:{
                display:'flex',
                justifyContent:'center',
                alignItems:'center',
                flexDirection:"column",
                rowGap:'10px',
                columnGap:'10px',
            }
        },
        {
            nameTag:'float',
            style:{
                background:'rgba(66, 66, 66, 0.6)',
                position:'fixed',
                transition:'opacity linear .5s',
                rowGap:'10px',
                flexDirection:'column',
                boxShadow:'3px 3px 3px rgba(95, 95, 95, .5)',
            }
        },
        {
            nameTag:'Design',
            style:{
                background:'#fff',
                height:'50px',
                width:"100%",
                borderRadius:"inherit",
                boxShadow:'2px 2px 3px rgba(0,0,0,.8)',
                transition:'opacity .5s linear'
            }
        },
        {
            nameTag:'tab',
            style:{
                minHeight:'fit-content',
                width:'100%',
                background:'rgba(66, 66, 66, 0.3)',
                borderRadius:"inherit",
                // boxShadow:'2px 2px 3px rgba(0,0,0,.8)',
                paddingLeft:'10px',
                cursor:'pointer',
                padding:'10px 0'
            }
        },
        {
            nameTag:'floatingDesgin',
            style:{
                position:'absolute',
                right:'-5px',
                top:'0px',
                transform:'translateX(100%)'
            }
        },
        {
            nameTag:'propInfo',
            style:{
                fontWeight:'100',
                fontFamily:'monospace',
                alignSelf:'flex-start',
                padding:'5px 5px 5px 8px'
            }
        },
        {
            nameTag:'input',
            style:{
                border:'none',
                outline:'none',
                height:'20px',
                width:'100%',
                borderBottom:'1px solid rgba(0,0,0)',
                background:"transparent",
                textTransform:'capitalize',
                fontFamily:'high Tower text'
            }
        },
        {
            nameTag:"textarea",
            style:{
                minHeight:"70px",
                minWidth:'100%',
                resize:'none',
                outline:'none',
                fontWeight:'700',
                textTransform:'capitalize'
            }
        }
    ]
);

sydDOM.float = () =>{
    return createElement(
        'div',
        {style:styleComponent.float({method:'add',style:{
            left:`${preState(['float','left'],50)}%`,
            top:`${preState(['float','top'],50)}%`,
        }})+styleComponent.square({method:'remove',style:['height']})+styleComponent.flex(
            [
                {method:'remove',style:['justifyContent']},
                {method:'add', style:{
                    display:preState(['float','display'],'none'),
                }}
            ]
        )},
        [
            sydDOM.topDesign(),
            sydDOM.bottomDesign(),
            sydDOM.sideDesign()
        ],
        {
            createState:{
                stateName:'float',
                state:{left:0,right:0,display:'none'}
            },
            type:'float'
        }
    )
}

sydDOM.topDesign = () =>{
    return createElement(
        'div',
        {
            style:styleComponent.Design()+styleComponent.flex(
                [
                    {method:'add',style:{
                        flexDirection:'row',
                        justifyContent:'space-between',
                        padding:'0 10px'
                    }}
                ]
            )+styleComponent.font({method:'add',style:{fontSize:'18px'}})
        },
        [
            preState('topDesign','node 1'),
            sydDOM.dropDown()
        ],
        {
            createState:{
                stateName:'topDesign',
                state:'node 1'
            },
            type:'topDesign'
        }
    )
}
sydDOM.dropDown = () =>{
    return createElement(
        'div',
        {
            style:'height:15px;width:15px;background:#171717;cursor:pointer',
            onclick:'togBottomDesign()'
        }
    )
}

sydDOM.bottomDesign = () =>{
    return createElement(
        'div',
        {
            style:styleComponent.Design(
                [
                    {method:'remove', style:['boxShadow']},
                    {method:'add',style:{height:'200px',overflow:'scroll',padding:'5px'}}
                ]
            )
            +
            styleComponent.flex(
                [
                    {method:'add',style:{justifyContent:'flex-start',display:preState('bottomDesign','none')}}
                ]
            )
        },
        [
            sydDOM.branch(1),
            sydDOM.branch(2).replaceChild({position:0,element:'add a branch'}),
            sydDOM.branch(3).replaceChild({position:0,element:'update node'}),
            sydDOM.branch(4).replaceChild({position:0,element:'remove node'}),
        ],
        {
            createState:{
                stateName:'bottomDesign',
                state:'none'
            },
            type:'bottomDesign'
        }
    )
}
sydDOM.branch = (node) =>{
    return createElement(
        'span',
        {
            style:styleComponent.tab()+styleComponent.flex(
                [
                    {method:'add',style:{
                        flexDirection:'row',
                        justifyContent:'space-between',
                        padding:'10px'
                    }}
                ]
            )+styleComponent.font({method:'remove',style:['fontSize']}),
            onclick:`togSideDesign(${node})`
        },
        [
            'node properties',
            sydDOM.dropDown().removeAttr(['onclick'])
        ]
    )
}
sydDOM.sideDesign = () =>{
    const children = ['propChildInfo','addBranch','nodeUpdate','removeNode'];
    let childState = null
    switch(true)
    {
        case preState(['sideDesign','node'],1) === 1:
            childState = preState(['sideDesign','nodeInfo'],undefined);
        break;
        case preState(['sideDesign','node'],1) === 2:
            childState = preState(['sideDesign','branchSaveState'],{});
    }
    return createElement(
        'div',
        {style:styleComponent.Design(
            {
                method:'add',style:{
                    height:'200px',
                    boxShadow:'3px 3px 3px rgba(95, 95, 95, .5)',
                    display:preState(['sideDesign','display'],'none')
                }
            }
        )+styleComponent.floatingDesgin()},
        [
            sydDOM[children[preState(['sideDesign','node'],1)-1]](childState)
        ],
        {
            createState:{
                stateName:'sideDesign',
                state:{node:1,display:'none',nodeInfo:undefined,branchSaveState:{},addBranch:{'node 1':{attrSaveData:{'0':{i:'',j:''}},attrI:1}}}//branchName:'', branchTag:'', attributes:{keys:[],value:[]},styles:''
            },
            type:'sideDesign'
        }
    )
}
sydDOM.propChildInfo = (Dom) =>{
    // const Dom = preState('propChildInfo',{}).dom;
    const attrChildren = [];
    const children = []
    switch(true)
    {
        case Dom !== undefined:
            for(let [prop,value] of Object.entries(Dom.attribute))
            {
                let splitContent = value.split(';')
                const spreadText = () =>{
                    let styles = []
                    splitContent.forEach(val =>{
                        styles.push(createElement('p',{},[val]))
                    });
                    return styles;
                }
                attrChildren.push(
                    createElement(
                        'p',
                        {},
                        [
                            sydDOM.propTitle('13px').addChild({element:prop}),
                            ...spreadText()
                        ]
                    )
                )
            }

            for(let child of Dom.children)
            {
                let name = child.staticName === undefined ? 'string Node' : child.staticName
                children.push(
                    sydDOM.clickable(child.staticName).addChild({element:`${name} -> ${child.tagname === undefined ? child : child.tagname}`})
                )
            }
    }
    return createElement(
        'div',
        {
            style:styleComponent.font([{method:'remove', style:['textTransform','fontSize']}])
            +
            styleComponent.propInfo()
            +
            styleComponent.Design(
                [
                    {method:'remove', style:['boxShadow']},
                    {method:'add',style:{height:'100%',overflow:'scroll',padding:'5px'}}
                ]
            )
            +
            styleComponent.flex(
                [
                    {method:'add',style:{justifyContent:'flex-start'}},
                    {method:'remove',style:['alignItems']}
                ]
            )
        },
        [
            createElement('p',{},[`Generic name : ${Dom === undefined ? 'no name specified' : Dom.Dom}`]),
            createElement('p',{},[`Tag name : ${Dom === undefined ? 'no tagname specified' : Dom.tagname}`]),
            sydDOM.propTitle().addChild({element:'node attributes'}),
            ...attrChildren,
            sydDOM.propTitle().addChild({element:'node children'}),
            ...children
        ]
    )
}
sydDOM.propTitle = (font = '16px') =>{
    return createElement('h3',
        {
            style:styleComponent.font([
            {method:'remove',style:['fontSize','fontFamily']},
            {
                method:'add',
                style:{
                    textDecoration:'underline',
                    fontSize:font
                }
            }
        ])}
    )
}
sydDOM.clickable = (param) =>{
    return createElement(
        'li',
        {style:'padding:10px;background:rgba(66, 66, 66, 0.3);cursor:pointer;border-radius:5px;',onclick:`traceNode('${param}')`}
    )
}
sydDOM.BIcomponent = () =>{
    return createElement(
        'input',
        {
            style:styleComponent.input(),
        },
        []
)
}
sydDOM.infoName = () =>{return createElement('p',{style:'min-width:40px'})}
sydDOM.addInfo = (saveInfo,id) =>{
    return createElement(
        'div',
        {
            style:styleComponent.flex(
                {method:'add',style:{
                    flexDirection:'row',
                    justifyContent:'flex-start',
                    padding:'10px'
                }}
            )
        },
        [
            sydDOM.infoName().addChild({element:'Name: '}).addAttr({placeholder:`enter ${id}`}),
            sydDOM.BIcomponent().addAttr({oninput:`addInput.bind()(this.value,'${id}')`}).addAttr({value:preState(['sideDesign','addBranch',saveInfo,id],'')}).addAttr({placeholder:id})
        ]
    )
}
sydDOM.branchAddFlexup = () =>{
    return createElement(
        'div',
        {style:styleComponent.flex({method:'add',style:{rowGap:'5px',alignItems:'flex-start'}})+sydDOM.clickable().inherit(['attribute','style'])}
    )
}
sydDOM.branchAddFlexattr = (currentNode) =>{
    const createNum = preState(['sideDesign','addBranch',currentNode, 'attrI'],1);
    const addArray = () =>{
        let array = new Array();
        for(let i = 0; i < createNum; i++)
        {
            array.push(
                createElement(
                    'div',
                    {style:sydDOM.addInfo().inherit(['attribute','style'])},
                    [
                        sydDOM.BIcomponent().addAttr({placeholder:'name'}).addAttr({oninput:`addInputSec2.bind()(this.value,'${i}','i')`}).addAttr({value:preState(['sideDesign','addBranch',currentNode,'attrSaveData',`${i}`,'i'],'')}),
                        sydDOM.BIcomponent().addAttr({placeholder:'value'}).addAttr({oninput:`addInputSec2.bind()(this.value,'${i}','j')`}).addAttr({value:preState(['sideDesign','addBranch',currentNode,'attrSaveData',`${i}`,'j'],'')})
                    ]
                )
            )
        }
        return array
    }
    return createElement(
        'div',
        {style:sydDOM.branchAddFlexup().inherit(['attribute','style'])},
        [
            sydDOM.addInfo().removeChild([0,1]).addChild({element:sydDOM.dropDown().addAttr({onclick:'addAInput()'})}).addChild({element:'Add Attributes'}),
            ...addArray()
        ]
    )
}
sydDOM.styleTextArea = () =>{
    return createElement(
        'textarea',
        {
            style:styleComponent.textarea(),
            placeholder:"enter branch style",
            oninput:"textAreaInput.bind(this)(this.value)"
        }
    )
}
sydDOM.branchAddchildren = () =>{
    return createElement(
        'div',
        {
            style:sydDOM.branchAddFlexup().inherit(['attribute','style'])+'background:transparent'
        },
        [
            sydDOM.addInfo().removeChild([0,1]).addChild({element:sydDOM.dropDown()}).addChild({element:'Add Child'}).addAttr({onclick:'addCinput()'}),
        ]
    )
}
sydDOM.addBranch = () =>{
    const AI1 = sydDOM.addInfo(preState(['sideDesign','currentNode'],'node 1'),'branchName');
    const AI2 = sydDOM.addInfo(preState(['sideDesign','currentNode'],'node 1'),'branchTag').replaceChild({position:0,element:sydDOM.infoName().addChild({element:'Tag: '})});
    let currentNode = preState(['sideDesign','currentNode'],'node 1');
    // console.log(preState(['sideDesign','addBranch',currentNode,'styleSaveData'],'hello world'))

    return createElement(
        'div',
        {style:sydDOM.propChildInfo().inherit(['attribute','style'])},
        [
            sydDOM.propTitle().addChild({element:'customise branch'}),
            sydDOM.branchAddFlexup().addChild({element:AI1}).addChild({element:AI2}),
            sydDOM.propTitle().addChild({element:'create attributes'}),
            sydDOM.branchAddFlexattr(currentNode),
            sydDOM.propTitle().addChild({element:'create styles'}),
            sydDOM.styleTextArea().addChild({element:preState(['sideDesign','addBranch',currentNode,'styleSaveData'],'')}),
            // sydDOM.branchAddFlex(),
            sydDOM.propTitle().addChild({element:'create children'}),
            sydDOM.branchAddchildren(),
        ]
    )
}
sydDOM.nodeUpdate = () =>{
    return createElement(
        'div',
        {},
        [
            'node update' 
        ]
    )
}
sydDOM.removeNode = () =>{
    return createElement(
        'div',
        {},
        [
            'remove node'

        ]
    )
}

mount(sydDOM.float())