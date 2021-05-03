//step 1 - import packages and create variables
//step 2 - import middleware
//step 3 - create,grab html and create js function
//step 4 - create routes
//--get route
//--post route
//--get images route
// -get download route
//step 5 -  create readfile and write file functions

//step 1 import packages and create variables

const express = require("express");
const bodyParser = require("body-parser");
const expressFileUpload = require("express-fileupload");
//inbuilt modules
const fs = require("fs");
//create port variable
const port = 3001;
//require path module (inbuild method)
const path = require("path");
const {
    resolve
} = require("path");
const {
    rejects
} = require("assert");
const {
    request
} = require("http");
const {
    response
} = require("express");
const { dir } = require("console");
//create directory to uploaded folder e.g. Dropbox/uploaded
const uploadDirectory = __dirname + path.sep + "uploaded" + path.sep;
//declare express as const app
const app = express();

//step 2 import middleware -- handles the data from get/post requests etc 

//all the requests and repsonses will run through this function first .eg parses data from the form (html)
//so its readable in the back end. if extended false, can only read string or arrays, if true reads more types of data.
app.use(bodyParser.urlencoded({
    extended: false
}));
//tells express to use express-fileupload module
app.use(expressFileUpload({
    limits: {
        fileSize: 50 * 1024 * 1024
    },
}));
//tells express to serve static files such as images,css files and javascript without it being generated, modified or processed.
app.use(express.static("uploaded"));
app.use(express.static(path.join(__dirname, "public")));

//lets the user have easier access to these files if they have already accessed them before
let caches = {};

//step 3 - go and create,grab html and create js function.

//step 4 - create routes

//tells express to get my index.html page.
app.get("/", (request, response) => {
    response.sendFile(path.join(__dirname, "public", "index.html"))
});

//step 5 - create read and write functions

//writes the file into the designated folder(uploaded folder)
function writeFile(name, body) {
    return new Promise((resolve, reject) => {
        fs.writeFile(uploadDirectory + name, body, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve(name);
            }
        })
    }).then(readFile);
}

//reads contents of the file after writeFile
function readFile(name) {
    return new Promise((resolve, reject) => {
        fs.readFile(uploadDirectory + name, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    }).catch((error) => {
        console.log("error", error);
    });
}

//step 4 - create routes continued 

//tell express to post data, the location should correspond to the front end(index.html by default) e.g. <form action="/files"
app.post("/", (request, response) => {
    let file = request.files.dropbox;
    console.log("Getting files in backend", file);

    //asign data to caches in key(name) and value(data) form/ this runs if selected more than one file(which creates an array)
    if (file instanceof Array) {
        let fileNames = []
        for (let i = 0; i < file.length; i++) {
            let fileName = file[i].name;
            let fileData = file[i].data;
            fileNames.push(fileName)
            //data is returned from readfile function through call back from writefile.
            let directory = path.join(__dirname, "uploaded", fileName);
            caches[fileName] = writeFile(fileName, fileData);
                // console.log("it's working")
                response.write(`<p><strong>${fileName}</strong></p>`);
                response.write(`<img src="http://localhost:${port}/${fileName}" alt="pics" />`)
                response.write(`<a href="http://localhost:${port}/${fileName}" download="${fileName}"><button>Download</button></a>`)
            console.log(directory);
        }
        response.end();
        // response.send(fileNames)
        console.log(caches)
        // response.end()
    } else {
        //not array, single file
        let fileName = file.name;
        let fileData = file.data;
        caches[fileName] = writeFile(fileName, fileData);
        caches[fileName].then(() => {
            console.log("it's working");
            response.write(`<p><strong>${fileName}</strong></p>`);
            response.write(`<img src="http://localhost:${port}/${fileName}" alt="pics" />`)
            response.write(`<a href="http://localhost:${port}/${fileName}" download="${fileName}"><button>Download</button></a>`)
            response.end();
        }).catch((error) => {
            console.log("error", error)
        });
    }
 
});

//tells express to get the file/images from the uploaded folder and sends the file back to the front end.
app.get("/uploaded", (request, response) => {
    let directory = __dirname + "/uploaded";
      (async () => {
        const files = await fs.promises.readdir(directory);
        for (const file of files) {
            response.write(`<p><strong>${file}</strong></p>`)
        }
        response.end()
    })()
});

// //tells express to download this file to my computer.
// app.get("/download/:name", (request, response) => {
//     // let url = request.params.name;
//     readFile(request.params.name).then((object) => {
//         // response.send(`<a href="/${request.params.name}" download="${request.params.name}">Download</a>`);
//         response.send(object)
//     });
// });

//access at port 3000 set by const variable above, will also console log it.
app.listen(port, () => {
    console.log(`app listening on port ${port}`)
});