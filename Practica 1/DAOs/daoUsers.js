"use strict";

const readSQL = "SELECT email, password, name, gender, image, birthDate FROM users WHERE ? = email";
const searchSQL = "SELECT email, name, image FROM users WHERE name LIKE ?";
const insertSQL = "INSERT INTO users VALUES (?, ?, ?, ?, ?, ?)";
const updateSQL = "UPDATE users SET email=?, password=?, name=?, gender=?, birthDate=?, image=? WHERE email=?";
const insertFriendSQL = "INSERT INTO friends VALUES (?, ?, false)";
const readAllSQL = "SELECT users.email, users.image, users.name FROM users LEFT JOIN friends ON ?=friends.email2";
const confirmFriendSQL = "UPDATE friends SET accepted=1 WHERE email1=? AND email2=?";
const readRequests = "SELECT email, name, image FROM users LEFT JOIN friends ON friends.aceptado = 0";
class daoUsers {

    constructor(pool) {
        this.pool = pool;
    }
    readRequests(email,callback){
        this.pool.getConnection((err,conn)=>{
            if(err){
                callback("Connection error: " + err, null);
                return;
            }else{
                conn.query(readRequests, [email], (err, res, fields) =>{
                    if(err){
                        console.log("ERRORRR");
                        console.log(err);
                        callback("Query error: " + err, null);
                        return;
                    }else{
                        console.log("COGIO LOS DATOS WEY");
                        console.log(res);
                        callback(null, res);
                        return;
                    }
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
                        return;
                    } else {
                        
                        callback(null, res);
                        return;
                    }
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
                        return;
                    } else {
                        if (res.length > 1 || res.length < 1) {
                            callback("Length error: " + res.length, null);
                            return;
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
                            return;
                        }
                    }
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
                        return;
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
                        return;
                    }
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
                        console.log("Insert error.");
                        callback("Insert error.", null);
                        return;
                    } else {
                        callback(null, rows.affectedRows);
                        return;
                    }
                });
            }
        });
    }

    // No puedes actualizar el email, hay que cambiarlo
    update(email, password, name, gender, birthDate, image, callback) {
        this.pool.getConnection((err, conn) => {
            if (err) {
                callback("Connection error.", null);
                return;
            } else {
                conn.query(updateSQL, [email, password, name, gender, birthDate, image, email], (err, rows) => {
                    if (err) {
                        callback("Update error " + err, null);
                        return;
                    } else {
                        callback(null, rows.affectedRows);
                        return;
                    }
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
                conn.query(insertFriendSQL, [email1, email2], (err, rows) => {
                    if (err) {
                        callback("Insert error.", null);
                        return;
                    } else {
                        callback(null, rows.affectedRows);
                        return;
                    }
                });
            }
        });
    }

    confirmFriend(email1, email2, callback) {
        this.pool.getConnection((err, conn) => {
            if (err) {
                callback("Connection error.", null);
                return;
            } else {
                conn.query(confirmFriendSQL, [email1, email2], (err, rows) => {
                    if (err) {
                        callback("Update error.", null);
                        return;
                    } else {
                        callback(null, rows.affectedRows);
                        return;
                    }
                });
            }
        });
    }
}

module.exports = daoUsers;