var express = require('express');
var partidas = express.Router();
const config = require("../config/config.js");

const mysql = require("mysql");
const pool = mysql.createPool({
    host: config.dbHost,
    user: config.dbUser,
    password: config.dbPassword,
    database: config.dbName
});
let daoPartidas = require("../DAOs/daoPartidas.js");

let dao = new daoPartidas(pool);

partidas.post("/newPartida", (request, response) => {
    let nombre = request.body.nombrePartida;
    console.log(nombre);
    dao.insert(nombre, (err, res) => {
        if (err) {
            console.log("fuck");
            response.status(400);
        } else {
            if (res.affectedRows == 1) {
                console.log("joder");
                response.status(201);
            } else {
                console.log("pene");
                response.status(400);
            }
        }
        response.end();
    });
})

module.exports = partidas;
