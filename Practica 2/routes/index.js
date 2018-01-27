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

index.post("/newUserForm", function(request, response) {
    var nombre = request.body.userName;
    var passwd = request.body.password;
  
    if (nombre === undefined || passwd === undefined) {
        // falta comprobar que el usuario existe
        response.status(400);
    } else {
        dao.insert(nombre, passwd, (err) => {
            if (err) {
                console.log(err);
                console.log("fea");
                response.redirect("/views/index.html");
                response.status(500);
            } else {
                console.log("puta");
                response.redirect("/views/perfil.html");
                response.status(201);
            }
        });

    }
    //users.push(nombre,passwd);

    response.end();



});

module.exports = index;