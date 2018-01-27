var express = require('express');
var index = express.Router();

var bodyParser = require("body-parser");
var daoUsers = require("../DAOs/daoUsers.js");

const mysql = require("mysql");
const config = require("../config/config.js");

const pool = mysql.createPool({
    host: config.dbHost,
    user: config.dbUser,
    password: config.dbPassword,
    database: config.dbName
});

let dao = new daoUsers(pool);



/* GET home page. */
index.get('/', function(req, res, next) {
    res.render('index');
});



module.exports = index;