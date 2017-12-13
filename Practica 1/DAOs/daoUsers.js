"use strict";

const readSQL = "SELECT email, password, name, gender, image, birthDate FROM users WHERE ? = email";
const searchSQL = "SELECT email, name, image FROM users WHERE name LIKE ?";

class daoUsers{

    constructor(pool){
        this.pool = pool;
    }

    readOne(email, callback){
        this.pool.getConnection((err, conn) => {
            if(err) {
                console.log("Connection error: " + err);
                callback(null);
                return ;
            } else {
                conn.query(readSQL, [email], (err, res, fields) => {
                    if(err){
                        console.log("Query error: " + err);
                        callback(null);
                        return ;
                    } else {
                        if(res.length > 1 || res.length < 1){
                            console.log("Length error: " + res.length);
                            callback(null);
                            return ;
                        } else {
                            let result = {
                                email: res[0].email,
                                password: res[0].password,
                                name: res[0].name,
                                gender: res[0].gender,
                                image: res[0].image,
                                birthDate: res[0].birthDate
                            };
                            callback(result);
                            return ;
                        }   
                    }
                });
            }
        });
    }

    search(name, callback){
        this.pool.getConnection((err, conn) => {
            if (err) { 
                console.log("Connection error");
                callback(null);
            } else {
                let search = '%' + name + '%';
                conn.query(searchSQL, [search], (err, res, fields) => {
                    if (err) {
                        console.log(err);
                        callback(null);
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
                        callback(usersArray);
                    }
                });
            }
        });
    }
}

module.exports = daoUsers;