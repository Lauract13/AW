"use strict";

const http = require("http");
const express = require("express");
const path = require("path");
var bodyParser = require("body-parser");
const morgan = require("morgan");
const app = express();
const staticFiles = path.join(__dirname, "public");
app.use(express.static(staticFiles));
app.use(morgan("dev"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", (request, response) => {
    response.redirect("users/login.html");
});

app.post("/users/loginpost.html", bodyParser.urlencoded({extended:false}), function(request, response){
    console.log(request.body);
    response.end();
});

app.listen(3000, (err) => {
    if(err)
        console.log(err);
});