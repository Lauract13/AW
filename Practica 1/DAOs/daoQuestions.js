"use strict";

const insertSQL = "INSERT INTO questions (pregunta, respuestas) VALUES (?,?)";
const insertAnswerSQL = "INSERT INTO answers VALUES (?, ?, ?)";
const readSQL = "SELECT id, pregunta, respuestas FROM questions WHERE id=?";
const readAnswerSQL = "SELECT email, question_id, answer FROM answers WHERE email=? AND question_id=?";
const readGuessSQL = "SELECT email1, email2, question_id, guessed FROM guessed WHERE email1=? AND email2=? AND question_id=?";
const readUserInQuestionSQL = "SELECT email, question_id, answer FROM answers WHERE email=? AND question_id=?";
const readUsersInQuestionSQL = "SELECT users.email, users.name, users.image FROM users LEFT JOIN friends ON users.email=friends.email2 INNER JOIN answers ON users.email=answers.email WHERE friends.accepted=1 AND ?=friends.email1 AND answers.question_id=?";
const readAllSQL = "SELECT id, pregunta FROM questions";
const createNewAnswerSQL = "UPDATE questions SET respuestas=? WHERE id=?";
const insertGuessSQL = "INSERT INTO guessed VALUES (?, ?, ?, ?)";

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
                    } else if (res.length < 1 || res.length > 1) {
                        callback("Query length error", null);
                    } else {
                        callback(null, res[0]);
                    }
                    conn.release();
                    return;
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
                    } else {
                        callback(null, res);
                    }
                });
                conn.release();
                return;
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
                    } else {
                        callback(null, res[0]);
                    }
                    conn.release();
                    return;
                });
            }
        });
    }

    readUsersInQuestion(email, id, callback) {
        this.pool.getConnection((err, conn) => {
            if (err) {
                callback("Connection error: " + err, null);
                return;
            } else {
                conn.query(readUsersInQuestionSQL, [email, id], (err, res, fields) => {
                    if (err) {
                        callback("Query error: " + err, null);
                    } else {
                        callback(null, res);
                    }
                    conn.release();
                    return;
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
                    } else {
                        callback(null, rows.affectedId);
                    }
                    conn.release();
                    return;
                });
            }
        });
    }

    readAnswer(email, id, callback) {
        this.pool.getConnection((err, conn) => {
            if (err) {
                callback("Connection error: " + err, null);
                return;
            } else {
                conn.query(readAnswerSQL, [email, id], (err, res, fields) => {
                    if (err) {
                        callback("Query error: " + err, null);
                    } else if (res.length < 1 || res.length > 1) {
                        callback("Query length error", null);
                    } else {
                        callback(null, res[0]);
                    }
                    conn.release();
                    return;
                });
            }
        });
    }

    insertAnswer(email, id, respuesta, callback) {
        this.pool.getConnection((err, conn) => {
            if (err) {
                callback("Connection error: " + err, null);
                return;
            } else {
                conn.query(insertAnswerSQL, [email, id, respuesta], (err, rows) => {
                    if (err) {
                        callback("Query error: " + err, null);
                    } else {
                        callback(null, rows.affectedId);
                    }
                    conn.release();
                    return;
                });
            }
        });
    }

    createNewAnswer(id, respuesta, callback) {
        this.pool.getConnection((err, conn) => {
            if (err) {
                callback("Connection error: " + err, null);
                return;
            } else {
                this.readOne(id, (err, res) => {
                    let respuestas = res.respuestas + "," + respuesta;
                    conn.query(createNewAnswerSQL, [respuestas, id], (err, rows) => {
                        if (err) {
                            callback("Query error: " + err, null);
                        } else {
                            callback(null, rows.affectedId);
                        }
                        conn.release();
                        return;
                    });
                });
            }
        });
    }

    readGuess(email1, email2, questionId, callback) {
        this.pool.getConnection((err, conn) => {
            if (err) {
                callback("Connection error: " + err, null);
                return;
            } else {
                conn.query(readGuessSQL, [email1, email2, questionId], (err, res, fields) => {
                    if (err) {
                        callback("Query error: " + err, null);
                    } else {
                        callback(null, res[0]);
                    }
                    conn.release();
                    return;
                });
            }
        });
    }

    insertGuess(email1, email2, questionId, guessed, callback) {
        this.pool.getConnection((err, conn) => {
            if (err) {
                callback("Connection error: " + err, null);
                return;
            } else {
                conn.query(insertGuessSQL, [email1, email2, questionId, guessed], (err, rows) => {
                    if (err) {
                        callback("Query error: " + err, null);
                    } else {
                        callback(null, rows.affectedId);
                    }
                    conn.release();
                    return;
                });
            }
        });
    }
}

module.exports = daoQuestions;