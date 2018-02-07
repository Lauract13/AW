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
        turno: idJugador,
        cartasJugador: [{
            idJugador: idJugador,
            cartas: [0]
        }],
        cartasEnMesa: [0],
        jugadoresEnPartida: [{
            idJugador: idJugador,
            nomJugador: nomJugador
        }],
        //ultimasCartasEnMesa
        ultimoMovimiento: {
            idJugador : idJugador,
            cartasJugadas: [0]
        }
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
                if(jugadoresaux.length === 4){
                    response.status(400);
                }else{
                   
                    let newPlayer = {
                        idJugador: idJugador,
                        nomJugador: nomJugador
                    };
                    jugadoresaux.push(newPlayer);
                    let jugador = {
                        idJugador: idJugador,
                        cartas: [0]
                    }
                    estadoaux.cartasJugador.push(jugador);
                    if(jugadoresaux.length === 4){
                        
                        let cartas = ["2_C" , "2_D", "2_H", "2_S", "3_C", "3_D", "3_H", "3_S", "4_C","4_D","4_H","4_S",
                        "5_C","5_D", "5_H","5_S", "6_C", "6_D","6_H","6_S", "7_C", "7_D","7_H","7_S","8_C", "8_D", "8_H","8_S",
                        "9_C","9_D","9_H","9_S", "10_C", "10_D","10_H","10_S","A_C", "A_D","A_H","A_S","J_C", "J_D","J_H","J_S",
                        "Q_C","Q_D","Q_H","Q_S","K_C","K_D", "K_H","K_S"];
                        let cartasaux = cartas;
                        for(i = 0; i < 4; i++){
                            for(j = 0; j < 13; j++){
                             
                                let ind = Math.floor((Math.random() * cartasaux.length));
                                estadoaux.cartasJugador[i].cartas[j] = cartasaux[ind];
                                cartasaux.pop(cartasaux[ind]);
                               
                            }
                           
                            
                        }
                        estadoaux.estado = "INICIADA";
                        

                        
                    }
                    let estado = {
                        estado: estadoaux.estado,
                        turno: estadoaux.turno,
                        cartasJugador: estadoaux.cartasJugador,
                        cartasEnMesa: estadoaux.cartasEnMesa,
                        jugadoresEnPartida: jugadoresaux,
                        ultimoMovimiento: estadoaux.ultimoMovimiento
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

partidas.get("/estadoPartida", (request, response) => {
    let idPartida = request.query.idPartida;
    dao.estadoPartida(idPartida, (err, res) => {
        if (err) {
            response.status(400);
        } else {
            response.status(200);
            console.log(res);
            response.json({ id: res[0].id, estado: res[0].estado });
        }
        response.end();
    })
})

module.exports = partidas;