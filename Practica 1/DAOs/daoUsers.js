"use strict";

const readSQL = "SELECT email, password, name, gender, image, birthDate FROM users WHERE ? = email";
const searchSQL = "SELECT email, name, image FROM users WHERE name LIKE ?";
const insertSQL = "INSERT INTO users VALUES (?, ?, ?, ?, ?, ?)";
const updateSQL = "UPDATE users SET password=?, name=?, gender=?, birthDate=?, image=? WHERE email=?";
const insertFriendSQL = "INSERT INTO friends VALUES (?, ?, ?)";
const readAllSQL = "SELECT users.email, users.image, users.name FROM users LEFT JOIN friends ON users.email=friends.email2 WHERE friends.accepted=1 AND ?=friends.email1";
const confirmFriendSQL = "UPDATE friends SET accepted=1 WHERE email1=? AND email2=?";
const rejectFriendSQL = "DELETE FROM friends WHERE email1=? AND email2=?";
const readRequests = "SELECT users.email, users.image, users.name FROM users LEFT JOIN friends ON users.email=friends.email2 WHERE friends.accepted=0 AND ?=friends.email1";
class daoUsers {

    constructor(pool) {
        this.pool = pool;
    }
    readRequests(email, callback) {
        this.pool.getConnection((err, conn) => {
            if (err) {
                callback("Connection error: " + err, null);
                return;
            } else {
                conn.query(readRequests, [email], (err, res, fields) => {
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
    readAllFriends(email, callback) {
        this.pool.getConnection((err, conn) => {
            if (err) {
                callback("Connection error: " + err, null);
                return;
            } else {
                conn.query(readAllSQL, [email], (err, res, fields) => {
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
    readOne(email, callback) {
        this.pool.getConnection((err, conn) => {
            if (err) {
                callback("Connection error: " + err, null);
                return;
            } else {
                conn.query(readSQL, [email], (err, res, fields) => {
                    if (err) {
                        callback("Query error: " + err, null);
                    } else {
                        if (res.length > 1 || res.length < 1) {
                            callback("Length error: " + res.length, null);
                        } else {
                            let result = {
                                email: res[0].email,
                                password: res[0].password,
                                name: res[0].name,
                                gender: res[0].gender,
                                image: res[0].image,
                                birthDate: res[0].birthDate
                            };
                            callback(null, result);
                        }
                    }
                    conn.release();
                    return;
                });
            }
        });
    }

    search(name, callback) {
        this.pool.getConnection((err, conn) => {
            if (err) {
                callback("Connection error", null);
                return;
            } else {
                let search = '%' + name + '%';
                conn.query(searchSQL, [search], (err, res, fields) => {
                    if (err) {
                        callback(err, null);
                    } else {
                        let usersArray = [];
                        if (res.length > 0) {
                            res.forEach((user) => {
                                let aux = {
                                    email: user.email,
                                    user: user.name,
                                    image: user.image
                                }
                                usersArray.push(aux);
                            });
                        }
                        callback(null, usersArray);
                    }
                    conn.release();
                    return;
                });
            }
        });
    }

    insert(mail, pw, name, gender, birthDate, image, callback) {
        this.pool.getConnection((err, conn) => {
            if (err) {
                callback("Connection error.", null);
                return;
            } else {
                conn.query(insertSQL, [mail, pw, name, gender, image, birthDate], (err, rows) => {
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

    update(email, password, name, gender, birthDate, image, callback) {
        this.pool.getConnection((err, conn) => {
            if (err) {
                callback("Connection error.", null);
                return;
            } else {
                conn.query(updateSQL, [password, name, gender, birthDate, image, email], (err, rows) => {
                    if (err) {
                        callback("Update error " + err, null);
                    } else {
                        callback(null, rows.affectedRows);
                    }
                    conn.release();
                    return;
                });
            }
        });
    }

    addFriend(email1, email2, callback) {
        this.pool.getConnection((err, conn) => {
            if (err) {
                callback("Connection error.", null);
                return;
            } else {
                conn.query(insertFriendSQL, [email1, email2, 1], (err, rows) => {
                    if (err) {
                        callback("Insert error.", null);
                        conn.release();
                        return;
                    }
                    conn.query(insertFriendSQL, [email2, email1, 0], (err, rows) => {
                        if (err) {
                            callback("Insert error.", null);
                        } else {
                            callback(null, rows.affectedRows);
                        }
                        conn.release();
                        return;
                    });
                });
            }
        });
    }

    confirmFriend(email1, email2, callback) {
        this.pool.getConnection((err, conn) => {
            if (err) {
                callback("Connection error " + err, null);
                return;
            } else {
                conn.query(confirmFriendSQL, [email1, email2], (err, rows) => {
                    if (err) {
                        callback("Update error " + err, null);
                    } else {
                        callback(null, rows.affectedRows);
                    }
                    conn.release();
                    return;
                });
            }
        });
    }

    rejectFriend(email1, email2, callback) {
        this.pool.getConnection((err, conn) => {
            if (err) {
                callback("Connection error " + err, null);
            } else {
                conn.query(rejectFriendSQL, [email1, email2], (err, rows) => {
                    if (err) {
                        callback("Update error " + err, null);
                        conn.release();
                        return;
                    }
                    conn.query(rejectFriendSQL, [email2, email1], (err, rows) => {
                        if (err) {
                            callback("Update error " + err, null);
                        } else {
                            callback(null, rows.affectedRows);
                        }
                        conn.release();
                        return;
                    });
                });
            }
        });
    }
}

module.exports = daoUsers;