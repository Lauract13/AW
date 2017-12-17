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
                puntos: request.session.points,
                preguntas: preg
            });
        }
    })
});

preguntasRouter.get("/nuevaPregunta.html", (request, response) => {
    response.render("nuevaPregunta.ejs", {
        image: request.session.image,
        puntos: request.session.points
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
                    if (res.email) answered = true;
                    daoQ.readUsersInQuestion(request.session.user, request.params.id, (err, res) => {
                        if (err) {
                            console.log(err);
                            response.setMsg("No se pudo abrir la pregunta");
                            response.redirect("/questions/preguntas.html");
                        } else {
                            response.render("perfPregunta", {
                                image: request.session.image,
                                puntos: request.session.points,
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
                puntos: request.session.points,
                p: p
            });
        }
    });
});

preguntasRouter.post("/guessQuestion:id", (request, response) => {
    daoQ.readOne(request.params.id, (err, res) => {
        if (err) {
            console.log(err);
            response.setMsg("No se pudo mostrar la pregunta.");
            response.redirect("questions/preguntas.html");
        } else {
            let resp = [];
            let bool = [];
            let totales = res.respuestas.split(",");
            let leng = totales.length;
            if (leng > 5) leng = 5;
            for (let i = 0; i < leng; i++) {
                let ind = Math.floor((Math.random() * totales.length));
                while (bool.indexOf(ind) !== -1) {
                    ind = Math.floor((Math.random() * totales.length));
                }
                resp.push(totales[ind]);
                bool.push(ind);
            }
            let p = {
                id: request.params.id,
                pregunta: res.pregunta,
                respuestas: resp
            };
            response.render("plantAdivinar", {
                image: request.session.image,
                puntos: request.session.points,
                p: p,
                userAmigo: request.body.userAmigo
            });
        }
    })
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

preguntasRouter.post("/answerGuessedQuestion", (request, response) => {
    daoQ.readUserInQuestion(request.body.idAmigo, request.body.idPregunta, (err, res) => {
        if (err || !res.email) {
            response.setMsg("No se pudo responder la pregunta");
            response.redirect("/questions/preguntas.html");
        } else {
            console.log(res.answer);
            let email1 = request.session.user;
            let email2 = request.body.idAmigo;
            let questionId = request.body.idPregunta;
            let guessed = false;
            if (request.body.respuesta === res.answer) guessed = true;
            daoQ.insertGuess(email1, email2, questionId, guessed, (err, rows) => {
                if (err) {
                    response.setMsg("No se pudo responder la pregunta");
                    response.redirect("/questions/preguntas.html");
                } else {
                    if (guessed) {
                        daoU.addPoints(50, email1, (err, rows) => {
                            if (err) {
                                response.setMsg("No se pudieron añadir los puntos");
                                response.redirect("/questions/preguntas.html");
                            } else {
                                response.setMsg("¡Has acertado!");
                                request.session.points += 50;
                                response.redirect("/questions/preguntas.html");
                            }
                        });
                    } else {
                        response.setMsg("Has fallado.");
                        response.redirect("/questions/preguntas.html");
                    }
                }
            });
        }
    })
})

module.exports = preguntasRouter;