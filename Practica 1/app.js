"use strict";

const http = require("http");
const express = require("express");
const path = require("path");
var bodyParser = require("body-parser");
const morgan = require("morgan");
const app = express();
const staticFiles = path.join(__dirname, "public");
const usersRouter = require("./routes/usersRouter");
const cookieParser = require("cookie-parser");
const config = require("./config.js");
app.use(cookieParser());
app.use("/users", usersRouter);
app.use(express.static(staticFiles));
app.use(morgan("dev"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", (request, response) => {
    response.redirect("users/login.html");
});

app.listen(config.port, (err) => {
    if (err)
        console.log(err);
});