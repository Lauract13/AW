var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require("passport");
var passportHTTP = require("passport-http");

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

app.use('/', index);
app.use('/users', users);
app.use('/partidas', partidas);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;