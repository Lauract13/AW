"use strict";

const readSQL = "SELECT email, password, name, gender, image, birthDate FROM users WHERE ? = email";
const searchSQL = "SELECT email, name, image FROM users WHERE name LIKE ?";
const insertSQL = "INSERT INTO users VALUES (?, ?, ?, ?, ?, ?)";
const readAllSQL = "SELECT email,image, name FROM users WHERE email IN (SELECT email2 FROM friends WHERE ? = email1)";
class daoUsers {

    constructor(pool) {
        this.pool = pool;
    }
    readAllFriends(email, callback){
        this.pool.getConnection((err,conn) =>{
            if(err){
                callback("Connection error: " + err, null);
                return;
            }else{
                conn.query(readAllSQL, [email], (err, res, fields) =>{
                    if(err){
                        callback("Query error: " + err, null);
                        return;
                    }else{
                        let result = {
                            image: res.image,
                            name: res.name
                        };
                        callback(null, result);
                        return;
                    }
                } );
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
}

module.exports = daoUsers;