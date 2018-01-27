"use strict";

const insertSQL = "INSERT INTO partidas(nombre, estado) VALUES (?, ?)";


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

}

module.exports = daoPartidas;