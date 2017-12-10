"use strict";

const http = require("http");
const express = require("express");
const path = require("path");
const fs = require("fs");
var bodyParser = require("body-parser");
const morgan = require("morgan");
const usersRouter = express.Router();
const mysql = require("mysql");
const config = require("../config.js");
const pool = mysql.createPool({
    host: config.dbHost,
    user: config.dbUser,
    password: config.dbPassword,
    database: config.dbName
});
const session = require("express-session");
const mysqlSession = require("express-mysql-session");
const mysqlStore = mysqlSession(session);
const sessionStore = new mysqlStore({
    host: config.dbHost,
    user: config.dbUser,
    password: config.dbPassword,
    database: config.dbName
});
const mwSession = session({
    saveUninitialized: false,
    secret: "facebluff123",
    resave: false,
    store: sessionStore
});
usersRouter.use(mwSession);
let logErr = false;


usersRouter.get("/desconectar.html", (request, response) => {
    // response.cookie("user", false);
    request.session.destroy((err) => {
        if (err) { console.log("Error deleting session."); }
    });
    response.redirect("/users/login.html");
    response.end();
});

usersRouter.get("/new_user.html", (request, response) => {
    let loggedIn = (String(request.session.user) !== 'undefined');
    if (loggedIn) {
        response.render("new_user.ejs", { user: loggedIn });
    } else {
        response.render("new_user.ejs", {
            user: loggedIn,
            image: request.session.image,
            puntos: 0
        });
    }
    response.end();
});

usersRouter.get("/login.html", (request, response) => {
    let loggedIn = (String(request.session.user) !== 'undefined');
    if (!loggedIn) {
        response.render("login.ejs", { user: loggedIn, error: logErr, puntos: 0 });
        if (logErr) logErr = false;
    } else {
        response.redirect("/users/perfil.html");
    }
    response.end();
});

usersRouter.get("/perfil.html", (request, response) => {
    let loggedIn = (String(request.session.user) !== 'undefined');
    // request.session.reload();
    console.log(request.session.user);
    if (loggedIn) {
        let str = path.join(__dirname, "..", "public", "icons", String(request.session.image));
        console.log(str);
        // if (fs.existsSync(str)) {
        //     response.render("perfil.ejs", {
        //         name: request.session.name,
        //         years: request.session.birthDate,
        //         gender: request.session.gender,
        //         puntos: 0,
        //         image: path.join("..", "icons", String(request.session.image))
        //     });
        // } else {
        //     let noProfPic = path.join("..", "img", "NoProfile.png");
        //     response.render("perfil.ejs", {
        //         name: request.session.name,
        //         years: request.session.birthDate,
        //         gender: request.session.gender,
        //         puntos: 0,
        //         image: path.join("..", "img", "NoProfile.png")
        //     });
        // }
        response.render("perfil.ejs", {
            name: request.session.name,
            years: request.session.birthDate,
            gender: request.session.gender,
            puntos: 0,
            image: request.session.image
        });
    } else {
        response.redirect("/users/login.html");
    }
    response.end();
});

usersRouter.get("/amigos.html", (request, response) => {
    let loggedIn = (String(request.session.user) !== 'undefined');
    if (!loggedIn) {
        response.redirect("/users/login.html");
    } else {
        response.render("amigos.ejs", {
            user: loggedIn,
            image: request.session.image,
            puntos: 0
        });
    }
});

usersRouter.get("/search", (request, response) => {
    let loggedIn = (String(request.session.user) !== 'undefined');
    if (!loggedIn) {
        response.redirect("/users/login.html");
    } else {
        pool.getConnection((err, conn) => {
            if (err) { console.log("Connection error"); } else {
                let sql = "SELECT email, name, image FROM users WHERE name LIKE ?";
                let name = '%' + request.query.name + '%';
                conn.query(sql, [name], (err, res, fields) => {
                    if (err) {
                        console.log(err);
                    } else {
                        let usersArray = [];
                        console.log(res);
                        if (res.length > 0) {
                            res.forEach((user) => {
                                let userImage;
                                let str = path.join(__dirname, "..", "public", "icons", String(user.image));
                                console.log(str);
                                if (fs.existsSync(str)) {
                                    userImage = path.join("..", "icons", String(user.image));
                                } else {
                                    userImage = path.join("..", "img", "NoProfile.png");
                                }
                                let aux = {
                                    email: user.email,
                                    user: user.name,
                                    image: userImage
                                }
                                usersArray.push(aux);
                            });
                        }
                        console.log(usersArray);
                        response.render("search.ejs", {
                            user: loggedIn,
                            image: request.session.image,
                            puntos: 0,
                            users: usersArray
                        });
                    }
                });
            }
        });
    }
});

usersRouter.post("/loginpost", function(request, response) {
    pool.getConnection((err, conn) => {
        if (err) { console.log("Connection error"); } else {
            let sql = "SELECT email, password, name, gender, image, birthDate ";
            sql += "FROM users WHERE ? = email AND ? = password";
            let email = request.body.email;
            let password = request.body.password;
            conn.query(sql, [email, password], (err, res, fields) => {
                let success = false;
                if (res.length < 1 || res.length > 1) {
                    console.log("Login failed.");
                    logErr = true;
                } else {
                    success = true;
                    request.session.user = res[0].email;
                    request.session.name = res[0].name;
                    request.session.gender = res[0].gender;
                    let str = path.join(__dirname, "..", "public", "icons", String(res[0].image));
                    if (fs.existsSync(str)) {
                        request.session.image = path.join("..", "icons", String(res[0].image));
                    } else {
                        request.session.image = path.join("..", "img", "NoProfile.png");
                    }
                    request.session.birthDate = res[0].birthDate;
                    console.log(request.session);
                    console.log("Login succeeded.");
                }
                // response.cookie("user", success);
                if (!success) {
                    response.redirect("/users/login.html");
                } else {
                    response.redirect("/users/perfil.html")
                }
            });
        }
    });
});

usersRouter.post("/newUserForm", function(request, response) {
    console.log(request.body);
    pool.getConnection((err, conn) => {
        if (err) { console.log("Connection error"); } else {
            const sql = "INSERT INTO users VALUES (?, ?, ?, ?, ?, ?)";
            let name = request.body.name;
            let email = request.body.email;
            let password = request.body.password;
            let gender = request.body.gender;
            let birthDate = null;
            let image = null;
            if (request.body.birthDate !== "") {
                birthDate = request.body.birthDate;
            }
            if (request.body.image) {
                image = request.body.image;
            }
            conn.query(sql, [email, password, name, gender, image, birthDate], (err, rows) => {
                if (err) {
                    console.log("Error de inserción: " + err);
                } else {
                    console.log(rows.insertId);
                    console.log(rows.affectedRows);
                    conn.release();
                }
                response.redirect("/users/login.html");
            });
        }
    });
});

module.exports = usersRouter;