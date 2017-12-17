"use strict";

const http = require("http");
const express = require("express");
const path = require("path");
const fs = require("fs");
var bodyParser = require("body-parser");
const morgan = require("morgan");
const preguntasRouter = express.Router();
const daoQuestions = require("../DAOs/daoQuestions.js");
const daoUsers = require("../DAOs/daoUsers.js");
const mysql = require("mysql");
const config = require("../config/config.js");
const pool = mysql.createPool({
    host: config.dbHost,
    user: config.dbUser,
    password: config.dbPassword,
    database: config.dbName
});
let daoQ = new daoQuestions(pool);
let daoU = new daoUsers(pool);

preguntasRouter.get("/preguntas.html", (request, response) => {
    daoQ.readAll((err, res) => {
        if (err) {
            console.log("fuck");
        } else {
            let preg = [];
            let bool = [];
            let leng = res.length;
            if (leng > 5) leng = 5;
            for (let i = 0; i < leng; i++) {
                let ind = Math.floor((Math.random() * res.length));
                while (bool.indexOf(ind) !== -1) {
                    ind = Math.floor((Math.random() * res.length));
                }
                preg.push(res[ind]);
                bool.push(ind);
            }
            response.render("preguntas.ejs", {
                image: request.session.image,
                puntos: 0,
                preguntas: preg
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

preguntasRouter.get("/question:id", (request, response) => {
    daoQ.readOne(request.params.id, (err, res) => {
        if (err) {
            console.log(err);
            response.setMsg("No se pudo abrir la pregunta");
            response.redirect("/questions/preguntas.html");
        } else {
            let p = {
                id: request.params.id,
                pregunta: res.pregunta
            };
            daoQ.readUserInQuestion(request.session.user, request.params.id, (err, res) => {
                if (err) {
                    console.log(err);
                    response.setMsg("No se pudo abrir la pregunta");
                    response.redirect("/questions/preguntas.html");
                } else {
                    let answered = false;
                    if (res) answered = true;
                    daoQ.readUsersInQuestion(request.session.user, request.params.id, (err, res) => {
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
                            });
                        }
                    });
                }
            });
        }
    });
});

preguntasRouter.get("/num:id", (request, response) => {
    daoQ.readOne(request.params.id, (err, res) => {
        if (err) {
            console.log(err);
            response.setMsg("No se pudo mostrar la pregunta.");
            response.redirect("questions/preguntas.html");
        } else {
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
        }
    });
});

preguntasRouter.post("/newQuestionForm", (request, response) => {
    let pregunta = request.body.pregunta;
    let respuestas = request.body.respuestas.split('\r\n');
    daoQ.insert(pregunta, respuestas, (err, rows) => {
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

preguntasRouter.post("/answerQuestion", (request, response) => {
    let respuesta = request.body.respuesta;
    if (respuesta === "extra") {
        respuesta = request.body.extraTxt;
        daoQ.createNewAnswer(request.body.idPregunta, respuesta, (err, rows) => {
            if (err) {
                console.log(rows);
                response.setMsg("No se pudo responder la pregunta");
                response.redirect("/questions/preguntas.html");
            } else {
                daoQ.insertAnswer(request.session.user, request.body.idPregunta, respuesta, (err, rows) => {
                    if (err) {
                        console.log(rows);
                        response.setMsg("No se pudo responder la pregunta");
                        response.redirect("/questions/preguntas.html");
                    } else {
                        response.setMsg("Pregunta respondida correctamente.");
                        response.redirect("/questions/preguntas.html");
                    }
                });
            }
        });
    } else {
        daoQ.insertAnswer(request.session.user, request.body.idPregunta, respuesta, (err, rows) => {
            if (err) {
                response.setMsg("No se pudo responder la pregunta");
                response.redirect("/questions/preguntas.html");
            } else {
                response.setMsg("Pregunta respondida correctamente.");
                response.redirect("/questions/preguntas.html");
            }
        });
    }
});

module.exports = preguntasRouter;