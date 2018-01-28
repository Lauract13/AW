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
    let idJugador = request.body.idJugador;
    let nomJugador = request.body.nomJugador;
    let estado = {
        estado: "NO INICIADA",
        cartasJugador: [0],
        cartasEnMesa: [0],
        jugadoresEnPartida: [{
            idJugador: idJugador,
            nomJugador: nomJugador
        }],
        ultimasCartasEnMesa: ""
    };
    let estadoJSON = JSON.stringify(estado);
    dao.insert(nombre, estadoJSON, (err, res) => {
        if (err) {

            response.status(400);
        } else {
            if (res.affectedRows == 1) {
                let idPartida = res.insertId;
                dao.unirsePartida(idJugador, idPartida, estadoJSON, (err, res) => {
                    if (res.affectedRows === 1) {
                        response.json({ idPartida: idPartida, estado: estado });
                        response.status(201);
                    } else {
                        response.status(400);
                    }
                    response.end();
                });
            }
        }
    });
});

partidas.post("/unirsePartida", (request, response) => {
    let idPartida = request.body.idPartida;
    let idJugador = request.body.idJugador;
    let nomJugador = request.body.nomJugador;

    dao.estadoPartida(idPartida, (err, rows) => {
        if (err) {
            console.log(err);
            response.status(400);
        } else {
            if (rows && rows.length === 1) {
                let nomPartida = rows[0].nombre;
                let estadoaux = JSON.parse(rows[0].estado);
                let jugadoresaux = estadoaux.jugadoresEnPartida;
                let newPlayer = {
                    idJugador: idJugador,
                    nomJugador: nomJugador
                };
                jugadoresaux.push(newPlayer);
                estadoaux.cartasJugador.push(0);

                let estado = {
                    estado: estadoaux.estado,
                    cartasJugador: estadoaux.cartasJugador,
                    cartasEnMesa: estadoaux.cartasEnMesa,
                    jugadoresEnPartida: jugadoresaux,
                    ultimasCartasEnMesa: estadoaux.cartasEnMesa
                };

                let estadoJSON = JSON.stringify(estado);


                dao.unirsePartida(idJugador, idPartida, estadoJSON, (err, rows) => {
                    if (err) {
                        console.log(err);
                        response.status(400);
                    } else {
                        if (rows.affectedRows == 1) {
                            response.json({ nomPartida: nomPartida, estado: estado });
                            response.status(201);
                        } else {

                            response.status(400);
                        }
                    }
                    response.end();
                });
            }
        }
    });



});

partidas.get("/partidasJugador", (request, response) => {
    let idJugador = request.query.id;
    dao.juegaEn(idJugador, (err, res) => {
        let partidas = [];
        if (err) {
            response.status(400);
        } else {
            response.status(200);
            response.json(res);
        }
        response.end();
    });
})

module.exports = partidas;