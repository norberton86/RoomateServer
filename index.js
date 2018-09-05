var express = require("express");
var cors = require("cors");
var bodyparser= require("body-parser");
const fileUpload = require('express-fileupload');

//import the endpoints
var auth=require("./routes/auth.js");
var operations=require("./routes/operations.js");

//create the man object
var app = express();

//to use 'mv' when we upload files
app.use(fileUpload());

//enable the cors
app.use(cors());

//set the format for POST operations(!!!Important: need to be set up before Set Up the ENDPOINTS)
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());

//set the endpoints
app.use("/", auth);
app.use("/api", operations);

//ser the folder for the static files
app.use(express.static("public"));

//start the server
var port = process.env.PORT || 3000;
var server = app.listen(port,function(){

    console.log("node listening in 3000");

});

module.exports = app;