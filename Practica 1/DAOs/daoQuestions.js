"use strict";

const insertSQL = "INSERT INTO questions (pregunta, respuestas) VALUES (?,?)";
const readSQL = "SELECT id, pregunta, respuestas FROM questions WHERE id=?"
const readAllSQL = "SELECT id, pregunta FROM questions";

class daoQuestions {

    constructor(pool) {
        this.pool = pool;
    }

    readOne(id, callback) {
        this.pool.getConnection((err, conn) => {
            if (err) {
                callback("Connection error: " + err, null);
                return;
            } else {
                conn.query(readSQL, [id], (err, res, fields) => {
                    if (err) {
                        callback("Query error: " + err, null);
                        return;
                    } else if (res.length < 1 || res.length > 1) {
                        callback("Query length error", null);
                        return;
                    } else {
                        callback(null, res[0]);
                        return;
                    }
                });
            }
        });
    }

    readAll(callback) {
        this.pool.getConnection((err, conn) => {
            if (err) {
                callback("Connection error: " + err, null);
                return;
            } else {
                conn.query(readAllSQL, (err, res, fields) => {
                    if (err) {
                        callback("Query error: " + err, null);
                        return;
                    } else {
                        callback(null, res);
                        return;
                    }
                });
            }
        });
    }

    insert(pregunta, respuestas, callback) {
        this.pool.getConnection((err, conn) => {
            if (err) {
                callback("Connection error: " + err, null);
                return;
            } else {
                conn.query(insertSQL, [pregunta, String(respuestas)], (err, rows) => {
                    if (err) {
                        callback("Query error: " + err, null);
                        return;
                    } else {
                        callback(null, rows.affectedId);
                        return;
                    }
                });
            }
        });
    }
}

module.exports = daoQuestions;