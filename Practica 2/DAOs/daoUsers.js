"use strict";

const insertSQL = "INSERT INTO usuarios(login, password) VALUES (?, ?)";
const readOneSQL = "SELECT login, password FROM usuarios WHERE login = ? AND password = ?";

class daoUsers {

    constructor(pool) {
        this.pool = pool;
    }

    readOne(login, pw, callback) {
        this.pool.getConnection((err, conn) => {
            if (err) {
                callback("Connection error", null);
                return;
            } else {
                conn.query(readOneSQL, [login, pw], (err, res, fields) => {
                    if (err) {
                        callback("Reading error", null);
                        return;
                    } else {
                        callback(null, res);
                        return;
                    }
                });
            }
            conn.release();
        });
    }

    insert(login, pw, callback) {
        this.pool.getConnection((err, conn) => {
            if (err) {
                callback("Connection error.", null);
                return;
            } else {
                conn.query(insertSQL, [login, pw], (err, res) => {
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

module.exports = daoUsers;