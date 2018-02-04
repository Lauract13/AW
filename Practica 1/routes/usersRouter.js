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
const multer = require("multer");
const uploadsFolder = path.join(__dirname, "..", "public", "icons", "uploads");
const multerFactory = multer({ dest: uploadsFolder });
const pool = mysql.createPool({
    host: config.dbHost,
    user: config.dbUser,
    password: config.dbPassword,
    database: config.dbName
});

let dao = new daoUsers(pool);


usersRouter.get("/desconectar.html", (request, response) => {
    request.session.destroy((err) => {
        if (err) { console.log("Error deleting session."); }
    });
    response.redirect("/users/login.html");
});

usersRouter.get("/new_user.html", (request, response) => {
    let loggedIn = (String(request.session.user) !== 'undefined');
    if (loggedIn) {
        response.setMsg("Necesitas deslogearte para crear un usuario");
        response.redirect("/users/perfil.html");
    } else {
        response.render("new_user.ejs", {
            user: loggedIn,
            image: request.session.image,
            puntos: request.session.points
        });
    }
});

usersRouter.get("/mod_perfil.html", (request, response) => {
    let loggedIn = (String(request.session.user) !== 'undefined');
    if (!loggedIn) {
        response.setMsg("Necesitas estar logeado");
        response.redirect("/users/login.html");
    } else {
        let gen = 0;
        if (request.session.gender === "Femenino") {
            gen = 1;
        } else if (request.session.gender === "Otro") {
            gen = 2;
        }
        let data = {
            email: request.session.user,
            name: request.session.name,
            gender: gen,
            birthDate: request.session.birthDate,
            image: request.session.image
        };
        response.render("mod_perfil.ejs", {
            user: loggedIn,
            image: request.session.image,
            puntos: request.session.points,
            gen: gen,
            data: data
        });
    }
});

usersRouter.get("/login.html", (request, response) => {
    let loggedIn = (String(request.session.user) !== 'undefined');
    if (!loggedIn) {
        response.render("login.ejs", { user: loggedIn, puntos: request.session.points });
    } else {
        response.setMsg("Ya estas logeado");
        response.redirect("/users/perfil.html");
    }
    response.end();
});

usersRouter.get("/perfil.html", (request, response) => {
    let loggedIn = (String(request.session.user) !== 'undefined');
    if (loggedIn) {
        let birthDate = null;
        if (request.session.birthDate) {
            birthDate = new Date(request.session.birthDate);
        }
        let age = null;
        if (birthDate) {
            var ageDifMs = Date.now() - birthDate.getTime();
            var ageDate = new Date(ageDifMs);
            age = Math.abs(ageDate.getUTCFullYear() - 1970);
        }
        response.render("perfil.ejs", {
            name: request.session.name,
            years: age,
            gender: request.session.gender,
            puntos: request.session.points,
            puntosProf: request.session.points,
            image: request.session.image,
            imageProf: request.session.image,
            myProf: true,
            photos: request.session.photos
        });
    } else {
        response.setMsg("Necesitas estar logeado");
        response.redirect("/users/login.html");
    }
});


usersRouter.get("/amigos.html", (request, response) => {
    let loggedIn = (String(request.session.user) !== 'undefined');
    if (!loggedIn) {
        response.setMsg("Necesitas estar logeado")
        response.redirect("/users/login.html");
    } else {
        dao.readRequests(request.session.user, (err, reqs) => {
            dao.readAllFriends(request.session.user, (err, friends) => {
                response.render("amigos.ejs", {
                    puntos: request.session.points,
                    image: request.session.image,
                    amigos: friends,
                    requests: reqs
                });
            });
        });
    }
});

usersRouter.get("/search", (request, response) => {
    let loggedIn = (String(request.session.user) !== 'undefined');
    if (!loggedIn) {
        response.setMsg("Necesitas estar logeado")
        response.redirect("/users/login.html");
    } else {
        dao.search(request.query.name, (err, res) => {
            response.render("search.ejs", {
                user: loggedIn,
                image: request.session.image,
                puntos: request.session.points,
                users: res,
                search: request.query.name,
                myEmail: request.session.user
            });
        });
    }
});

usersRouter.post("/modPerfil", (request, response) => {
    let email = request.session.user;
    let name = request.session.name;
    let password = request.session.password;
    let gender = request.body.gender;
    let birthDate = request.session.birthDate;
    let image = request.session.image;
    if (request.body.name) {
        name = request.body.name;
    }
    if (request.body.password) {
        password = request.body.password;
    }
    if (request.body.birthDate !== "") {
        birthDate = request.body.birthDate;
    }
    if (request.body.image) {
        image = request.body.image;
    }
    dao.update(email, password, name, gender, birthDate, image, (err, id) => {
        if (err || !id) {
            console.log(err);
            response.setMsg("No se pudo modificar el usuario");
            response.redirect("/users/mod_perfil.html");
        } else {
            request.session.password = password;
            request.session.name = name;
            request.session.gender = gender;
            request.session.birthDate = birthDate;
            request.session.image = image;
            response.setMsg("Usuario modificado correctamente");
            response.redirect("/users/perfil.html");
        }
    });
});

usersRouter.post("/profile", (request, response) => {
    let id = request.body.user;
    dao.readOne(id, (err, res) => {
        if (err) {
            console.log(err);
        } else {
            let birthDate = null;
            if (res.birthDate) {
                birthDate = new Date(res.birthDate);
            }
            let age = null;
            if (birthDate) {
                var ageDifMs = Date.now() - birthDate.getTime();
                var ageDate = new Date(ageDifMs);
                age = Math.abs(ageDate.getUTCFullYear() - 1970);
            }
            dao.readFotosUser(id, (err, res) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log(photos);
                    response.render("perfil.ejs", {
                        name: res.name,
                        years: age,
                        gender: res.gender,
                        puntos: request.session.points,
                        puntosProf: res.points,
                        image: request.session.image,
                        imageProf: res.image,
                        myProf: false,
                        photos: request.session.photos
                    });
                }
            })

        }
    });
});

usersRouter.post("/addFriend", (request, response) => {
    let user1 = request.session.user;
    let user2 = request.body.email;
    dao.addFriend(user1, user2, (err, rows) => {
        if (err) {
            response.setMsg("No se pudo añadir ese amigo");
            response.redirect("/users/amigos.html");
        } else {
            response.setMsg("Solicitud enviada");
            response.redirect("/users/amigos.html");
        }
    });
});

usersRouter.post("/acceptFriend", (request, response) => {
    let user1 = request.session.user;
    let user2 = request.body.user;
    dao.confirmFriend(user1, user2, (err, rows) => {
        if (err) {
            response.setMsg("No se pudo aceptar la solicitud");
            response.redirect("/users/amigos.html");
        } else {
            response.redirect("/users/amigos.html");
        }
    });
});

usersRouter.post("/rejectFriend", (request, response) => {
    let user1 = request.session.user;
    let user2 = request.body.user;
    dao.rejectFriend(user1, user2, (err, rows) => {
        if (err) {
            response.setMsg("No se pudo rechazar la solicitud");
            response.redirect("/users/amigos.html");
        } else {
            response.setMsg("Solicitud rechazada");
            response.redirect("/users/amigos.html");
        }
    });
});

usersRouter.post("/loginpost", function(request, response) {
    dao.readOne(request.body.email, (err, res) => {
        if (!res) {
            response.setMsg("Usuario o contraseña incorrectos");
            response.redirect("/users/login.html");
        } else {
            request.session.user = res.email;
            request.session.name = res.name;
            request.session.password = res.password;
            request.session.gender = res.gender;
            request.session.image = res.image;
            request.session.birthDate = res.birthDate;
            request.session.points = res.points;
            dao.readFotosUser(request.body.email, (err, res) => {
                if (err) {
                    console.log(err);
                } else {
                    let photos = [];
                    res.forEach(r => {
                        photos.push(r.foto);
                    });
                    console.log(photos);
                    request.session.photos = photos;
                    response.redirect("/users/perfil.html");
                }
            })
        }
    });
});

usersRouter.post("/newUserForm", function(request, response) {
    let name = request.body.name;
    let email = request.body.email;
    var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!email.match(mailformat)) {
        response.setMsg("Formato de e-mail incorrecto");
        response.redirect("/users/new_user.html");
    } else {
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
                response.setMsg("No se pudo crear el usuario");
                response.redirect("/users/new_user.html");
            } else {
                response.setMsg("Usuario creado correctamente");
                response.redirect("/users/login.html");
            }
        });
    }
});

usersRouter.get("/subirFotos.html", (request, response) => {
    let loggedIn = (String(request.session.user) !== 'undefined');
    if (loggedIn) {
        response.render("subirFotos.ejs", {
            image: request.session.image,
            puntos: request.session.points
        });
    } else {
        response.setMsg("Necesitas estar logeado");
        response.redirect("/users/login.html");
    }
})

usersRouter.post("/subirFotos", multerFactory.single('image'), (request, response) => {
    let nombreFichero = null;

    if (request.file && request.body.texto.trim() !== "") {
<<<<<<< HEAD
        nombreFichero = "uploads/" + request.file.filename;
        request.session.puntos = request.session.puntos - 100;
=======
        nombreFichero = "./uploads/" + request.file.filename;
        request.session.puntos = request.session.puntos - 10;
        
>>>>>>> 177628a3bc9634833e2829b00ff8778d559ed762
        var texto = request.body.texto.trim();
        dao.subirFoto(request.session.user, nombreFichero, texto,  request.session.puntos, (err) => {
            if (err) {
                response.setMsg("Error al subir la foto");
                response.status(500);
                response.redirect("/users/subirFotos.html")
            } else {
                request.session.photos.push(nombreFichero);
                response.redirect("/users/perfil.html");
            }
        });
    }
});

module.exports = usersRouter;