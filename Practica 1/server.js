"use strict";

const http = require("http");
const express = require("express");
const path = require("path");
const app = express();
const staticFiles = path.join(__dirname, "public");
app.use(express.static(staticFiles));
app.set("view engine", "ejs");

app.get("/", (request, response) => {
    response.redirect("users/login.html");
})

app.listen(3000, (err) => {
    console.log(err);
});