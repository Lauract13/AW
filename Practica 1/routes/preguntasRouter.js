"use strict";

const http = require("http");
const express = require("express");
const path = require("path");
const fs = require("fs");
var bodyParser = require("body-parser");
const morgan = require("morgan");
const preguntasRouter = express.Router();
const daoQuestions = require("../DAOs/daoQuestions.js");
const mysql = require("mysql");
const config = require("../config/config.js");
const pool = mysql.createPool({
    host: config.dbHost,
    user: config.dbUser,
    password: config.dbPassword,
    database: config.dbName
});
preguntasRouter.use((request, response, next) => {
    let loggedIn = (String(request.session.user) !== 'undefined');
    if (!loggedIn) {
        response.setMsg("Necesitas logearte para acceder");
        response.redirect("/users/login.html");
    }
    next();
});
let dao = new daoQuestions(pool);

preguntasRouter.get("/preguntas.html", (request, response) => {
    dao.readAll((err, res) => {
        if (err) {
            console.log("fuck");
        } else {
            response.render("preguntas.ejs", {
                image: request.session.image,
                puntos: 0,
                preguntas: res
            });
        }
    })
});

preguntasRouter.get("/nuevaPregunta.html", (request, response) => {
    response.render("nuevaPregunta.ejs", {
        image: request.session.image,
        puntos: 0
    });
});

preguntasRouter.get("/q:id", (request, response) => {
    dao.readOne(request.params.id, (err, res) => {
        if (err) {
            console.log(err);
            response.setMsg("No se pudo abrir la pregunta");
            response.redirect("/questions/preguntas.html");
        } else {
            let p = {
                id: request.params.id,
                pregunta: res.pregunta
            };
            dao.readUserInQuestion(request.session.user, request.params.id, (err, res) => {
                if (err) {
                    console.log(err);
                    response.setMsg("No se pudo abrir la pregunta");
                    response.redirect("/questions/preguntas.html");
                } else {
                    let answered = false;
                    if (res) answered = true;
                    dao.readUsersInQuestion(request.params.id, (err, res) => {
                        if (err) {
                            console.log(err);
                            response.setMsg("No se pudo abrir la pregunta");
                            response.redirect("/questions/preguntas.html");
                        } else {
                            response.render("perfPregunta", {
                                image: request.session.image,
                                puntos: 0,
                                p: p,
                                friends: res,
                                answered: answered
                            })
                        }
                    });
                }
            });
        }
    });
});

preguntasRouter.get("/n:id", (request, response) => {
    dao.readOne(request.params.id, (err, res) => {
        let p = {
            id: request.params.id,
            pregunta: res.pregunta,
            respuestas: res.respuestas.split(",")
        }
        response.render("plantPregunta", {
            image: request.session.image,
            puntos: 0,
            p: p
        });
    });
});

preguntasRouter.post("/newQuestionForm", (request, response) => {
    let pregunta = request.body.pregunta;
    let respuestas = request.body.respuestas.split('\r\n');
    dao.insert(pregunta, respuestas, (err, rows) => {
        if (err) {
            console.log(err);
            response.setMsg("Pregunta no añadida");
            response.redirect("/questions/nuevaPregunta.html");
        } else {
            response.setMsg("Pregunta añadida correctamente");
            response.redirect("/questions/nuevaPregunta.html");
        }
    })
});

module.exports = preguntasRouter;