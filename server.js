const express = require('express'),
fs = require('fs'),
websocket = require('ws'),
http = require('http'),
app = express(),
server = http.createServer(app),
wss = new websocket.Server({server})

app.get('/',(req,res) =>{
    res.sendFile(__dirname+'/myApp/index.html');
})

app.use(express.static(__dirname+'/sydneyLib'))
app.use(express.static(__dirname+'/myApp'))
server.listen(9090,() =>{
    console.log('server is running at port 9090')
})

const streamers = new Object();

wss.on('connection', ws =>{
    ws.on('message', data =>{
        let message = JSON.parse(data)
        switch(true)
        {
            case message.type === 'liveStream':
                console.log('request to live stream')
                if(message.username.length > 0)
                {
                    streamers[message.username] = new Object();
                    streamers[message.username].candidate = message.candidate;
                    streamers[message.username].offer = message.offer;
                    streamers[message.username].connection = ws;
                }
            break;
            case message.type === 'joinStream':
                console.log('request to join stream recieved')
                if(streamers[message.username] !== undefined)
                {
                    // streamers[message.username].connection.send(JSON.stringify({
                    //     type:'requestToJoin',
                    //     candidate:message.candidate
                    // }))
                    ws.send(JSON.stringify({
                        type:'streamerInfo',
                        candidate:streamers[message.username].candidate,
                        offer:streamers[message.username].offer
                    }))
                }
            break;
            case message.type === 'attachAnswer':
                console.log('answer attachment recieved and sent')
                streamers[message.username].connection.send(JSON.stringify({
                    type:'clientCandidateAnswer',
                    answer:message.answer,
                    candidate:message.candidate
                }))
        }
    })

    ws.on('close', () =>{
        for(let [idx,users] of Object.entries(streamers))
        {
            if(users.connection === ws)
            {
                delete streamers[`${idx}`]
            }
        }
    })  
})