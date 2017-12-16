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

preguntasRouter.get("/n:id", (request, response) => {
    dao.readOne(request.params.id, (err, res) => {
        let p = {
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