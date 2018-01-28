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
    let estado = {
        estado: "NO INICIADA",
        cartasJugador: [],
        cartasEnMesa: [],
        jugadoresEnPartida: [],
        ultimasCartasEnMesa: ""
    };
    let estadoJSON = JSON.stringify(estado);
    dao.insert(nombre, estadoJSON, (err, res) => {
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

    
    dao.estadoPartida(idPartida, (err, rows) =>{
        if(err){
            console.log(err);
            response.status(400);
        }
        else{
           
            let estadoaux =JSON.parse(rows[0].estado);
            
            let estado = {
                estado: estadoaux.estado,
                cartasJugador: estadoaux.cartasJugador,
                cartasEnMesa: estadoaux.cartasEnMesa,
                jugadoresEnPartida: estadoaux.jugadoresEnPartida +","+ idJugador,
                ultimasCartasEnMesa: estadoaux.cartasEnMesa
            };
            
            let estadoJSON = JSON.stringify(estado);
            
            
            dao.unirsePartida(idJugador, idPartida, estadoJSON, (err, rows) => {
                
                        if (err) {
                            console.log(err);
                            response.status(400);
                        } else {
                            if (rows.affectedRows == 1) {
                
                                response.status(201);
                            } else {
                
                                response.status(400);
                            }
                        }
                        response.end();
                    });
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