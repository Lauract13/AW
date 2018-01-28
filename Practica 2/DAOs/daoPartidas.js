"use strict";

const insertSQL = "INSERT INTO partidas(nombre, estado) VALUES (?, ?)";
const insertJgdrEnPart = "INSERT INTO juega_en(idUsuario, idPartida) VALUES (?,?)";
const juegaEnSQL = "SELECT partidas.id, partidas.nombre, partidas.estado FROM juega_en LEFT JOIN partidas ON juega_en.idPartida = partidas.id WHERE idUsuario=?";

class daoPartidas {

    constructor(pool) {
        this.pool = pool;
    }


    insert(nombre, estado, callback) {
        this.pool.getConnection((err, conn) => {
            if (err) {
                callback("Connection error.", null);
                return;
            } else {
                conn.query(insertSQL, [nombre, estado], (err, res) => {
                    if (err) {
                        callback("Insert error: " + err, null);
                    } else {
                        callback(null, res);
                    }
                    conn.release();
                    return;
                });
            }
        });
    }

    unirsePartida(idJugador, idPartida, callback) {

        this.pool.getConnection((err, conn) => {
            if (err) {

                callback("Connection error.", null);
                return;
            } else {
                conn.query(insertJgdrEnPart, [idJugador, idPartida], (err, res) => {
                    if (err) {

                        callback("Insert error:" + err, null);
                    } else {
                        callback(null, res);
                    }
                    conn.release();
                    return;
                });
            }
        });
    }

    juegaEn(idUsuario, callback) {
        this.pool.getConnection((err, conn) => {
            if (err) {
                callback("Connection error.", null);
                return;
            } else {
                conn.query(juegaEnSQL, [idUsuario], (err, res) => {
                    if (err) {
                        callback("Reading error.", null);
                        return;
                    } else {
                        callback(null, res);
                    }
                });
                conn.release();
                return;
            }
        });
    }

}

module.exports = daoPartidas;