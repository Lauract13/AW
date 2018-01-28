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
    let nombre = request.body.nombre;

    dao.insert(nombre, (err, res) => {
        if (err) {

            response.status(400);
        } else {
            if (res.affectedRows == 1) {

                response.status(201);
            } else {

                response.status(400);
            }
        }
        response.end();
    });
});
partidas.post("/unirsePartida", (request, response) => {
    let idPartida = request.body.idPartida;
    let idJugador = request.body.idJugador;
    console.log(idPartida);
    dao.unirsePartida(idJugador, idPartida, (err, rows) => {
        console.log("guarrillaaaaa");
        if (err) {
            console.log("traviesilloooooo " + err);
            response.status(400);
        } else {
            if (rows.affectedRows == 1) {
                console.log("yasss");
                response.status(201);
            } else {

                response.status(400);
            }
        }
        response.end();
    });

});

module.exports = partidas;