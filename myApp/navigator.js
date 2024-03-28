import {virtualDom,getState} from './sydneyDom.js'
ws = new WebSocket('wss://video-app-0cb7.onrender.com');
connectionDetails = {candidate:[]}

navigator.mediaDevices.getUserMedia({video:{
    frameRate:24,
    width:{
        min:480, ideal:720, max:1280
    },
    aspectRatio:1.33333
},audio:true}).then((media) =>{
    recorder = new MediaRecorder(media);
    mediaData = media

    initialseRtc()
    console.log('media is ready')
}).catch (err =>
    {
        console.log(err)
    })


const configuration = () =>{
    return {
        iceServers:[
            {
                urls:[
                    'stun:stun.l.google.com:19302',
                    'stun:stun1.l.google.com:19302',
                    'stun:stun2.l.google.com:19302'
                ]
            }
        ]
    }
}

const initialseRtc = () =>{
    peerConnection = new RTCPeerConnection(configuration());
    for(let track of mediaData.getTracks())
    {
        peerConnection.addTrack(track,mediaData)
    }
    peerConnection.ontrack = ({streams}) =>{
        console.log(streams[0])
        virtualDom['vidSender'].srcObject = streams[0];
    }

    peerConnection
    .createOffer()
    .then(offer =>{
        peerConnection.setLocalDescription(offer).then(() =>{
            connectionDetails.offer = offer;
            console.log('offer created');
        })
    })

    peerConnection.onicecandidate = (e) =>{
        switch(true)
        {
            case e.candidate === null:
                console.log('found a bad ice connection') 
            break;
            default:
                connectionDetails.candidate.push(e.candidate);
                console.log(`candidate ${connectionDetails.candidate.length} created`)
                //send the candidate to the server using e.candidate
        }
    }

}

ws.addEventListener('open', () =>{
    console.log('connection opened')
    ws.addEventListener('message', ({data}) =>{
        let refined = JSON.parse(data)
        console.log(refined)
        switch(refined.type)
        {
            case 'clientCandidateAnswer':
                // console.log(refined.candidate,' this is the candidates');
                peerConnection.setRemoteDescription(refined.answer);
                refined.candidate.forEach((param,count) =>{
                    peerConnection.addIceCandidate(param).then(() =>{
                        console.log(`candidate ${count+1} added`)
                    }).catch(err =>{
                        console.log(err)
                    });
                })
            break;
            case 'streamerInfo':
                peerConnection.setRemoteDescription(refined.offer)
                refined.candidate.forEach((param,count) =>{
                    peerConnection.addIceCandidate(param).then(() =>{
                        console.log(`candidate ${count+1} added`)
                    }).catch(err =>{
                        console.log(err)
                    });
                })
                peerConnection
                .createAnswer()
                .then(answer =>{
                    peerConnection.setLocalDescription(answer).then(() =>{
                        ws.send(JSON.stringify({
                            username:getState('inputTag').value,
                            answer:answer,
                            type:'attachAnswer'
                        }))
                    })
                    .catch(err =>{
                        console.log(err)
                    })
                })
        }
    })
})
