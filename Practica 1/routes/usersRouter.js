"use strict";

const http = require("http");
const express = require("express");
const path = require("path");
var bodyParser = require("body-parser");
const morgan = require("morgan");
const usersRouter = express.Router();
const staticFiles = path.join(__dirname, "public");
const mysql = require("mysql");
const config = require("../config.js");
const pool = mysql.createPool({
    host: config.dbHost,
    user: config.dbUser,
    password: config.dbPassword,
    database: config.dbName
});
usersRouter.use(express.static(staticFiles));
usersRouter.use(morgan("dev"));

usersRouter.get("/desconectar.html", (request, response) => {
    response.cookie("user", false);
    response.redirect("/users/login.html");
    response.end();
});

usersRouter.get("/new_user.html", (request, response) => {
    let loggedIn = (request.cookies.user == 'true');
    response.render("new_user.ejs", { user: loggedIn });
    response.end();
});

usersRouter.get("/login.html", (request, response) => {
    let loggedIn = (request.cookies.user == 'true');
    response.render("login.ejs", { user: loggedIn });
    response.end();
});

usersRouter.get("/perfil.html", (request, response) => {
    let loggedIn = (request.cookies.user == 'true');
    if (loggedIn) {
        response.render("perfil.ejs");
    } else {
        response.redirect("/users/login.html");
    }
    response.end();
});

usersRouter.post("/loginpost", bodyParser.urlencoded({ extended: false }), function(request, response) {
    console.log(request.body);
    response.cookie("user", true);
    response.redirect("/users/login.html");
    response.end();
});

usersRouter.post("/newUserForm", bodyParser.urlencoded({ extended: false }), function(request, response) {
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
            });
        }
    });
    response.end();
});

module.exports = usersRouter;