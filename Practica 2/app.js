var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require("passport");
var passportHTTP = require("passport-http");
var https = require('https');
var fs = require('fs');

var index = require('./routes/index');
var users = require('./routes/users');
var partidas = require('./routes/partidas');

const config = require("./config/config.js");
const mysql = require("mysql");
const pool = mysql.createPool({
    host: config.dbHost,
    user: config.dbUser,
    password: config.dbPassword,
    database: config.dbName
});
let daoUsers = require("./DAOs/daoUsers.js");

let dao = new daoUsers(pool);

var app = express();

/**
 * Keys and certificate.
 */
let cert = fs.readFileSync("./" + config.cert);
let key = fs.readFileSync("./" + config.private_key);


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(passport.initialize());
passport.use(new passportHTTP.BasicStrategy({ realm: "Requiere autenticación" },
    (user, pass, callback) => {
        dao.readOne(user, pass, (err, res) => {
            if (err) {
                callback({ permitido: false });
            } else {
                if (res && res.length === 1) {
                    callback(null, { permitido: true, userId: res.id });
                } else {
                    callback(null, false);
                }
            }
        });
    }
));

app.use('/users', users);
app.use('/partidas', passport.authenticate("basic", { session: false }), partidas);

app.get("/", (request, response) => {
    response.redirect("/index.html");
})

/**
 * Create HTTPS server.
 */

var server = https.createServer({
    key: key,
    cert: cert
}, app);

server.listen(config.port, function(err) {
    console.log("Escuchando en el puerto " + config.port);
});

module.exports = app;