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
});

usersRouter.get("/amigos.html", (request, response) => {
    pool.getConnection((err,conn) =>{
        if(err){
            console.log(err);
            
        }else{
            let sql = "SELECT image, name FROM users WHERE email IN (SELECT email2 FROM friends WHERE email1 LIKE " + request.session.user.email + ")";
            let amigosArray = [];

            conn.query(sql, (err, rows, fields) => {
               
                amigosArray = fields;
            });
            response.render("amigos.ejs", {
                user: request.session.user,
                image: request.session.image,
                puntos: 0,
                
                amigos: amigosArray
    
    
            });
        }
    });
});

usersRouter.get("/search", (request, response) => {
    let loggedIn = (String(request.session.user) !== 'undefined');
    if (!loggedIn) {
        response.redirect("/users/login.html");
    } else {
        dao.search(request.query.name, (err, res) => {
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
    dao.readOne(request.body.email, (err, res) => {
        if (!res) {
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
});

usersRouter.post("/newUserForm", function(request, response) {
    let name = request.body.name;
    let email = request.body.email;
    let password = request.body.password;
    let gender = request.body.gender;
    let birthDate = null;
    let image = "npp";
    if (request.body.birthDate !== "") {
        birthDate = request.body.birthDate;
    }
    if (request.body.image) {
        image = request.body.image;
    }
    dao.insert(email, password, name, gender, birthDate, image, (err, id) => {
        if (err || !id) {
            console.log(err);
            response.redirect("/users/new_user.html");
        } else {
            response.redirect("/users/login.html");
        }
    });
});

module.exports = usersRouter;