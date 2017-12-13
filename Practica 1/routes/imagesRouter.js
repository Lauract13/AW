"use strict";

const http = require("http");
const express = require("express");
const path = require("path");
const fs = require("fs");
var bodyParser = require("body-parser");
const morgan = require("morgan");
const imagesRouter = express.Router();
const daoUsers = require("../DAOs/daoUsers.js");
const mysql = require("mysql");
const config = require("../config/config.js");
const pool = mysql.createPool({
    host: config.dbHost,
    user: config.dbUser,
    password: config.dbPassword,
    database: config.dbName
});
const dao = new daoUsers(pool);
const iconsDir = path.join(__dirname, "..", "public", "icons");
const noProfileImg = path.join(__dirname, "..", "public", "img", "NoProfile.png");

imagesRouter.get("/:id", (request, response) => {
    if(request.params.id === "npp"){
        response.sendFile(noProfileImg);
    } else {
        let image = path.join(iconsDir, request.params.id);
        if(fs.existsSync(image)){
            response.sendFile(image);
        } else {
            response.sendFile(noProfileImg);
        }
    }
});

module.exports = imagesRouter;