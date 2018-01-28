var express = require('express');
var users = express.Router();
const config = require("../config/config.js");

const mysql = require("mysql");
const pool = mysql.createPool({
    host: config.dbHost,
    user: config.dbUser,
    password: config.dbPassword,
    database: config.dbName
});
let daoUsers = require("../DAOs/daoUsers.js");

let dao = new daoUsers(pool);

let globUser = null;
let globPassword = null;

users.post("/login", (request, response) => {
    let user = request.body.user;
    let password = request.body.password;
    dao.readOne(user, password, (err, res) => {
        if (err) {
            response.status(500);
            response.json({ found: false });
        } else {
            response.status(200);
            if (res && res.length === 1) {
                response.json({ found: true, userId: res[0].id });
            } else {
                response.json({ found: false });
            }
        }
        response.end();
    });
});

users.post("/newUser", (request, response) => {
    let user = request.body.user;
    let password = request.body.password;
    dao.insert(user, password, (err, res) => {
        if (err) {
            response.status(400);
        } else {
            if (res.affectedRows == 1) {
                response.status(201);
            } else {
                response.status(400);
            }
        }
        response.end();
    });
})

module.exports = users;