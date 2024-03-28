const http = require('http'),
express = require('express'),
app = express(),
path = require('path'),
websocket = require('ws')
fs = require('fs');


const server = http.createServer(app);
const wss = new websocket.Server({server});

const fileConstruct = {
    html:({meta = [],title = 'sydDom project',rootElemId = 'root'} = {}) =>{
        class htmlText{
            constructor(meta,title,rootElemId)
            {
                this.title = title;
                this.addMetaTag = () =>{
                    const string = ``;
                    for(let tags of meta)
                    {
                        string += `\t\t${tags}\n`
                    }
                    return string;
                };
                this.addScript = (baseJs,scripts) =>{
                    let string = '';
                    switch(true)
                    {
                        case scripts.includes(baseJs):
                            scripts.splice(scripts.indexOf(baseJs),1);
                    }
                    for(let script of scripts)
                    {
                        string += `\t\t<script type="module" src="${script}"></script>\n`
                    }
                    string += `\t\t<script type="module" src="${baseJs}"></script>\n`
                    return string;
                }
                this.getContent = (baseJs,scripts) =>{
                    return `<!DOCTYPE html>\n<html lang="en">\n\t<head>\n\t\t<meta charset="UTF-8">\n\t\t<meta name="viewport" content="width=device-width, initial-scale=1.0">\n${this.addMetaTag()}\n\t\t<title>${title}</title>\n\t\t<link rel="stylesheet" href="index.css">\n\t</head>\n\t<body>\n\t\t<div id="${rootElemId}" ></div>\n\t\t<script>\n\n\t\t</script>\n${this.addScript(baseJs,scripts)}\n\t</body>\n</html>`;
                }
                
            }
        }
        return new htmlText(meta,title,rootElemId)
    },
    js:`import { \n\tDomType,\n\tsydDOM,\n\tsetStyle,\n\tstyleComponent,\n\tmount,\n\taddState,\n\tsetState,\n\tcreateElement \n} from "./sydneyDom.js";\n`,
    jsStyles:`import { \n\tsetStyle\n} from "./sydneyDom.js";\n`,
    css:`*{\n\tmargin:0px;\n\tpadding:0px;\n\tbox-sizing:border-box;\n}`
};

const Tree = {
    tree:null,
    connection:null
}


//PATH.JOIN FUNCTION START
const joinFunction = (param1,param2,param3,param4,param5) =>{
    const array = [param1,param2,param3,param4,param5];
    const backTrack = /\.\.\//;
    const absTrack = /\.\//;
    const pack = new Array()
    for(let id in array)
    {
        const boolBack = backTrack.test(array[id]);
        const boolAbs = absTrack.test(array[id]);
        let pushed = array[id];
        pushed = pushed[0] === '\\' ? pushed.slice(1,pushed.length) : pushed;
        switch(true)
        {
            case boolBack:
                if(pack[id-1] !== undefined)
                {
                    let newArray = pack[id-1].split('\\')
                    pack[id-1] = newArray.slice(0,newArray.length-1).join('\\');
                    pushed = array[id].split('../')[1];
                }
            break;
            case boolAbs:
                pushed = array[id].split('./')[1];
        }

        switch(true)
        {
            case id > 0:
                pushed = pushed === '' ? '' : '\\'+pushed;
        }

        const replaceSign = (par) =>{
            if(par.includes('/'))
            {
                par = par.replace('/','\\');
                replaceSign(par)
            }else{
                pushed = par
            }
        }
        replaceSign(pushed);
        pushed = pushed[pushed.length-1] === '\\' ? pushed.slice(0,pushed.length-1) : pushed;
        pack.push(pushed)
    }
    return pack.join('')
}

//PATH.JOIN FUNCTION ENDS
// const path = {
//     join:(param1 = "",param2 = "",param3 = "",param4 = "",param5 = "") =>{
//         return joinFunction(param1,param2,param3,param4,param5);
//     }
// }

//PATH OBJECT INITIALISATION

const createServer = (PORT,appName,baseHtml) =>{

    app.use(express.static(__dirname));
    app.use(express.static(path.join(__dirname,`../${appName}`)));
    app.use(express.static(path.join(__dirname,'./visualTree')))

    app.get('/',(req,res) =>{
        res.sendFile(path.join(__dirname,`../${appName}/${baseHtml}`));
    })
    app.get('/vtree',(req,res) =>{
        res.sendFile(path.join(__dirname,`./visualTree/tree.html`));
    })
    
    server.listen(PORT,() =>{
        console.log(`server is listening at port ${PORT}`);
    })

    wss.on('connection', ws =>{
        ws.on('message', data =>{
            const refined = JSON.parse(data)
            if(refined.header === 'visualTree')
            {
                Tree.tree = refined.data;
                if(Tree.connection !== null)
                {
                    Tree.connection.send(JSON.stringify({header:'treeData', data:Tree.tree}))
                }
            }else if(refined.header === 'requestTree'){
                Tree.connection = ws
                ws.send(JSON.stringify({header:'treeData', data:Tree.tree}))
            }
        })
    })
}

async function initialiseWebEnv({appName = 'myApp',baseJs = 'base.js',baseHtml ='index.html',scripts = ['component.js'],HTMLConfig = fileConstruct.html(),PORT = 9090} = {}){
    let appFiles = new Array(baseHtml,baseJs,'index.css');
    scripts.push('styles.js')
    appFiles = appFiles.concat(scripts);

    let removeDouble = () =>{
        let array = new Array();
        for(let arr of appFiles)
        {
            if(!array.includes(arr))
            {
                array.push(arr)
            }
        }
        return array
    }
    appFiles = removeDouble()
    const directories = await fs.readdirSync(path.join(__dirname,'../'));
    const defFolder = directories.some(val =>{return val === appName});

    //CREATE STATIC FOLDER
    async function createFolder(){
        switch(true)
        {
            case !defFolder:
                console.log(path.join(__dirname , `../${appName}`))
                const folder = fs.mkdirSync(path.join(__dirname , `../${appName}`));
        }
    }

    await createFolder();

    //CREATE FILES;

    async function createFiles()
    {
        fs.readdir(path.join(__dirname , `../${appName}`), (err,files) =>{
            if(err)console.log(`${err.message} errorNo: ${err.errno}`)
            else{
                for(const file of appFiles)
                {
                    if(!(files.includes(file)))
                    {
                        let data = '';
                        switch(true)
                        {
                            case file.split('.')[1] === 'html':
                                data = HTMLConfig.getContent(baseJs,scripts);
                            break;
                            case file.split('.')[1] === 'js':
                                if(file.split('.')[0] === 'styles')
                                {
                                    data = fileConstruct.jsStyles
                                }else data = fileConstruct.js;
                            break;
                            case file.split('.')[1] === 'css':
                                data = fileConstruct.css
                        }
                        fs.writeFile(path.join(__dirname , `../${appName}/${file}`),data,err =>{
                            if(err){
                                console.log(`${err.message} errorNo: ${err.errno}`)
                            }
                            else console.log(`${file} file created successfully`)
                        })
                    }
                }
            }
        })

        const createTreeFile = () =>{
            const parcel = `<!DOCTYPE html>\n<html lang="en">\n\t<head>\n\t\t<meta charset="UTF-8">\n\t\t<meta name="viewport"content="width=device-width, initial-scale=1.0">\n\t\t<title>tree</title>\n\t\t<link rel="stylesheet" href="tree.css">\n\t</head>\n\t<body>\n\t\t<div id="root"></div>\n\t\t<script>\n\t\t\tconst port = ${PORT}\n\t\t</script>\n\t\t<script src="tree.js" type="module"></script>\n\t</body>\n</html>`
            fs.writeFile(path.join(__dirname,'./visualTree/tree.html'),parcel, (err) =>{
                if(err)console.log(err)
                else{
                    // console.log('tree file created successfully')
                }
            })
        }
        createTreeFile()
    }

    await createFiles();

    createServer(PORT,appName,baseHtml)
}

// initialiseWebEnv(
//     {
//         appName:'myApp',
//         baseHtml:'index.html',
//         baseJs:'base.js',
//         scripts:['component.js','function.js']
//     }
// );

exports.htmlParser = fileConstruct.html;
exports.initialiseWebEnv = initialiseWebEnv


// module.exports = {
//     createServer:createServer,
//     initialiseWebEnv:initialiseWebEnv,
//     htmlParser:fileConstruct.html
// }