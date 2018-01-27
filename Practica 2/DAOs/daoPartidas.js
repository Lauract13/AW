"use strict";

const insertSQL = "INSERT INTO partidas(nombre) VALUES (?)";


class daoPartidas {
    
        constructor(pool) {
            this.pool = pool;
        }
    
        
    
        insert(nombre, callback) {
            this.pool.getConnection((err, conn) => {
                if (err) {
                    callback("Connection error.", null);
                    return;
                } else {
                    conn.query(insertSQL, [nombre], (err, res) => {
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