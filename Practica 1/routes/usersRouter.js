"use strict";

const http = require("http");
const express = require("express");
const path = require("path");
const fs = require("fs");
var bodyParser = require("body-parser");
const morgan = require("morgan");
const usersRouter = express.Router();
const daoUsers = require("../DAOs/daoUsers.js");
const mysql = require("mysql");
const config = require("../config/config.js");
const pool = mysql.createPool({
    host: config.dbHost,
    user: config.dbUser,
    password: config.dbPassword,
    database: config.dbName
});
let logErr = false;
let dao = new daoUsers(pool);


usersRouter.get("/desconectar.html", (request, response) => {
    // response.cookie("user", false);
    request.session.destroy((err) => {
        if (err) { console.log("Error deleting session."); }
    });
    response.redirect("/users/login.html");
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
    if (loggedIn) {
        let image = "/images/img/" + request.session.image;
        response.render("perfil.ejs", {
            name: request.session.name,
            years: request.session.birthDate,
            gender: request.session.gender,
            puntos: 0,
            image: image
        });
    } else {
        response.redirect("/users/login.html");
    }
});

usersRouter.get("/amigos.html", (request, response) => {
    let loggedIn = (String(request.session.user) !== 'undefined');
    console.log(request.session.user);
    if (!loggedIn) {
        response.redirect("/users/login.html");
    } else {
        let sql = "SELECT email2 FROM amigos WHERE email1 LIKE ?"
        let amigo = '%' + request.session.user.email + '%';
        conn.query(sql, [amigo], (err, res, fields) => {
            let amigosArray = [];
            console.log(res);
            //array[] = new Struct();
            
        });
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
        dao.search(request.query.name, (res) => {
            response.render("search.ejs", {
                user: loggedIn,
                image: request.session.image,
                puntos: 0,
                users: res,
                search: request.query.name
            });
        });
    }
});

usersRouter.post("/addFriend", (request, response) => {
    pool.getConnection((err, conn) => {
        if (err) {
            console.log("Connection error");
            response.redirect("/users/amigos.html");
        } else {
            let sql = "INSERT INTO friends VALUES (?,?)";
            let user1 = request.session.user;
            let user2 = request.body.email;
            conn.query(sql, [user1, user2], (err, rows) => {
                if (err) {
                    console.log(err);
                } else if (rows.affectedRows == 0) {
                    console.log("Not inserted");
                }
                response.redirect("/users/amigos.html");
            });
        }
    });
});

usersRouter.post("/loginpost", function(request, response) {
    dao.readOne(request.body.email, (res) =>{
        if(!res){
            console.log("Login failed.");
            logErr = true;
            response.redirect("/users/login.html");
        } else {
            request.session.user = res.email;
            request.session.name = res.name;
            request.session.gender = res.gender;
            request.session.image = res.image;
            request.session.birthDate = res.birthDate;
            console.log("Login succeeded.");
            response.redirect("/users/perfil.html");
        }
    });
    // pool.getConnection((err, conn) => {
    //     if (err) {
    //         console.log("Connection error");
    //         response.redirect("/users/login.html");
    //     } else {
    //         let sql = "SELECT email, password, name, gender, image, birthDate ";
    //         sql += "FROM users WHERE ? = email AND ? = password";
    //         let email = request.body.email;
    //         let password = request.body.password;
    //         conn.query(sql, [email, password], (err, res, fields) => {
    //             let success = false;
    //             if (res.length < 1 || res.length > 1) {
    //                 console.log("Login failed.");
    //                 logErr = true;
    //                 response.redirect("/users/login.html");
    //             } else {
    //                 success = true;
    //                 request.session.user = res[0].email;
    //                 request.session.name = res[0].name;
    //                 request.session.gender = res[0].gender;
    //                 let str = path.join(__dirname, "..", "public", "icons", String(res[0].image));
    //                 if (fs.existsSync(str)) {
    //                     request.session.image = path.join("..", "icons", String(res[0].image));
    //                 } else {
    //                     request.session.image = path.join("..", "img", "NoProfile.png");
    //                 }
    //                 request.session.birthDate = res[0].birthDate;
    //                 if (!success) {
    //                     response.redirect("/users/login.html");
    //                 } else {
    //                     console.log(request.session);
    //                     console.log("Login succeeded.");
    //                     response.redirect("/users/perfil.html")
    //                 }
    //             }
    //             // response.cookie("user", success);
    //         });
    //     }
    // });
});

usersRouter.post("/newUserForm", function(request, response) {
    console.log(request.body);
    pool.getConnection((err, conn) => {
        if (err) {
            console.log("Connection error");
            response.redirect("/users/new_user.html");
        } else {
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
                    response.redirect("/users/new_user.html");
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