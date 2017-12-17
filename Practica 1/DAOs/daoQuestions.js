"use strict";

const insertSQL = "INSERT INTO questions (pregunta, respuestas) VALUES (?,?)";
const readSQL = "SELECT id, pregunta, respuestas FROM questions WHERE id=?";
const readUserInQuestionSQL = "SELECT email FROM answers WHERE email=? AND question_id=?";
const readUsersInQuestionSQL = "SELECT users.email, users.name, users.image FROM users INNER JOIN answers ON users.email=answers.email WHERE answers.question_id=?";
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

    readUserInQuestion(email, id, callback) {
        this.pool.getConnection((err, conn) => {
            if (err) {
                callback("Connection error: " + err, null);
                return;
            } else {
                conn.query(readUserInQuestionSQL, [email, id], (err, res, fields) => {
                    if (err) {
                        callback("Query error: " + err, null);
                        return;
                    } else {
                        callback(null, res[0]);
                        return;
                    }
                });
            }
        });
    }

    readUsersInQuestion(id, callback) {
        this.pool.getConnection((err, conn) => {
            if (err) {
                callback("Connection error: " + err, null);
                return;
            } else {
                conn.query(readUsersInQuestionSQL, [id], (err, res, fields) => {
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