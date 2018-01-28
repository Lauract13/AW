"use strict";

const insertSQL = "INSERT INTO partidas(nombre, estado) VALUES (?, ?)";
const insertJgdrEnPart = "INSERT INTO juega_en(idUsuario, idPartida) VALUES (?,?)";
const updateEstado = "UPDATE partidas SET estado=? WHERE id=?";
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
<<<<<<< HEAD
    
    unirsePartida(idJugador, idPartida,estadoJSON, callback) {

=======

    unirsePartida(idJugador, idPartida, estadoJSON, callback) {
>>>>>>> ea249db37ef372c556d7aaba22727286f3cd1557

        this.pool.getConnection((err, conn) => {
            if (err) {

                callback("Connection error.", null);
                return;
            } else {
                conn.query(insertJgdrEnPart, [idJugador, idPartida], (err, res) => {
                    conn.query(updateEstado, [estadoJSON], (err, res) => {
                        if (err) {

                            callback("Insert error:" + err, null);
                        } else {
                            callback(null, res);
                        }
                        conn.release();
                        return;
                    });

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