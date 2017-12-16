"use strict";

const http = require("http");
const express = require("express");
const path = require("path");
var bodyParser = require("body-parser");
const morgan = require("morgan");
const app = express();
const staticFiles = path.join(__dirname, "public");
const imagesRouter = require("./routes/imagesRouter");
const usersRouter = require("./routes/usersRouter");
const cookieParser = require("cookie-parser");
const config = require("./config/config.js");
const mysql = require("mysql");
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
app.use(cookieParser());
app.use(express.static(staticFiles));
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use((request, response, next) => {
    response.setMsg = (msg) => {
        request.session.msg = msg;
    };

    response.locals.getMsg = () => {
        let msg = request.session.msg;
        delete request.session.msg;
        return msg;
    };
    next();
});
app.use(mwSession);
app.use("/users", usersRouter);
app.use("/images", imagesRouter);


app.get("/", (request, response) => {
    response.redirect("users/login.html");
});

app.listen(config.port, (err) => {
    if (err)
        console.log(err);
});