import { 
	virtualDom,
	sydDOM,
	setStyle,
	styleComponent,
	mount,
	preState,
	getState,
	createElement,
	useState
} from "./sydneyDom.js";
import {} from './navigator.js'

setStyle([
	{
		nameTag:'container',
		style:{
			height:'100vh',
			width:'100vw',
			position:'relative',
			fontFamily:'ubuntu',

		}
	},
	{
		nameTag:'sender',
		style:{
			height:'100%',
			width:'100%',
			background:'#000',
			position:'absolute'
		}
	},
	{
		nameTag:'reciever',
		style:{
			maxHeight:'20%',
			maxWidth:'20%',
			position:'absolute',
			top:'20px',
			left:'20px',
			borderRadius:'10px',
			zIndex:'900'
		}
	},
	{
		nameTag:'button_tab',
		style:{
			display:"flex",
			width:'100%',
			columnGap:'20px',
			padding:'10px',
			position:'absolute',
			zIndex:'999',
			bottom:'50px',
			left:'50%',
			justifyContent:'center',
			transform:'translateX(-50%)'
		}
	}
])

sydDOM.container = () =>{
	return createElement(
		'div',
		{
			style:styleComponent.container()
		},
		[
			sydDOM.vidReciever(),
			sydDOM.vidSender(),
			sydDOM.buttonTab(),
			sydDOM.nameSection()
		]
	)
}

sydDOM.nameSection = () =>{
	return createElement(
		'div',
		{
			style:`display:${preState(['nameSection','d'],'flex')};align-items:center;column-gap:20px;position:absolute;top:20px;left:20px;width:100%;max-width:500px;height:fit-content;`
		},
		[
			sydDOM.inputTag(),
			sydDOM.btn('Save','saveName')
		],
		{
			createState:{
				stateName:'nameSection',
				state:{d:'flex'}
			},
			type:'nameSection'
		}
	)
}

sydDOM.inputTag = () =>{
	return createElement(
		'input',
		{
			style:'outline:none;padding:5px 10px;height:40px;width:50%;font-size:13px;font-family:ubuntu;text-transform:capitalize',
			placeholder:'enter Username to stream / username to connect with',
		},
		[],
		{
			createState:{
				stateName:'inputTag',
				state:{value:''}
			},
			type:'inputTag'
		}
	)
}

sydDOM.vidReciever = () =>{
	return createElement(
		'video',
		{
			style:styleComponent.reciever()+`display:${preState(['vidReciever','d'],'none')}`,
			autoplay:'true',
		},
		[],
		{
			createState:{
				stateName:'vidReciever',
				state:{d:'none'}
			},
			type:'vidReciever'
		}
	)
}

sydDOM.vidSender = () =>{
	return createElement(
		'video',
		{
			style:styleComponent.sender()+`display:${preState(['vidSender','d'],'none')}`,
			autoplay:'true',
			controls:'controls'
		},
		[],
		{
			createState:{
				stateName:'vidSender',
				state:{d:'none'}
			},
			type:'vidSender'
		}
	)
}

sydDOM.buttonTab = () =>{
	return createElement(
		'div',
		{
			style:styleComponent.button_tab()
		},
		[
			sydDOM.btn('start call','strtCall'),
			sydDOM.btn('end call','endCall'),
			sydDOM.btn('join call','jCall'),
		]
	)
}

sydDOM.btn = (content = '',click = '') =>{
	const updateStates = (senderState,recieveState,nameSecState) =>{
		useState('vidSender',{type:'a',value:senderState})
		useState('vidReciever',{type:'a',value:recieveState})
		useState('nameSection',{type:'a',value:nameSecState})

	}
	const videoMode = () =>{
		const senderState = getState('vidSender');
		const recieveState = getState('vidReciever')
		const nameSecState = getState('nameSection');
		senderState.d = 'block';
		recieveState.d = 'block';
		nameSecState.d = 'none';
		updateStates(senderState,recieveState,nameSecState)
		virtualDom['vidReciever'].srcObject = mediaData;
	}
	strtCall = () =>{
		if(connectionDetails.candidate.length > 0)
		{
			ws.send(JSON.stringify({
				username:getState('inputTag').value,
				candidate:connectionDetails.candidate,
				offer:connectionDetails.offer,
				type:'liveStream'
			}))
			videoMode()
		}
	}
	endCall = () =>{
		virtualDom['vidReciever'].pause();
		virtualDom['vidSender'].pause();
		const senderState = getState('vidSender');
		const recieveState = getState('vidReciever');
		const nameSecState = getState('nameSection');
		senderState.d = 'none';
		recieveState.d = 'none';
		nameSecState.d = 'flex';
		updateStates(senderState,recieveState,nameSecState)
	}
	jCall = () =>{
		ws.send(JSON.stringify({
			username:getState('inputTag').value,
			candidate:connectionDetails.candidate,
			type:'joinStream'
		}));
		videoMode()
		console.log('request to join call made')
	}
	saveName = () =>{
		const state = getState('inputTag')
		state.value = virtualDom['inputTag'].value.toLowerCase()
		console.log(state)
		useState('inputTag',{type:'a',value:state})
	}
	return createElement(
		'div',
		{
			style:'padding:15px 20px;background:lightgrey;cursor:pointer;border-radius:5px;transition:all linear .3s;min-width:',
			class:'btn',
			onclick:click === '' ? '' : `${click}()`
		},
		[
			content
		]
	)
}

mount(sydDOM.container())