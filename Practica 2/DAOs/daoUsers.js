"use strict";

const insertSQL = "INSERT INTO usuarios VALUES (?, ?)";

class daoUsers {
    
    constructor(pool) {
       this.pool = pool;
    }

     insert(login, pw, callback) {
        this.pool.getConnection((err, conn) => {
            if (err) {
                callback("Connection error.", null);
                return;
            } else {
                conn.query(insertSQL, [login, pw], (err, rows) => {
                    if (err) {
                        callback("Insert error.", null);
                    } else {
                        callback(null, rows.affectedRows);
                    }
                    conn.release();
                    return;
                });
            }
        });
    }

}