var express = require('express');
var router = express.Router();
var bodyParser = require("body-parser");

app.use(bodyParser.json());

const pool = mysql.createPool({
  host: config.dbHost,
  user: config.dbUser,
  password: config.dbPassword,
  database: config.dbName
});

let dao = new daoUsers(pool);



/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

app.post("index", function(request, response){
  var nombre = request.body.nombre;
  var passwd = request.body.pass;

  if(nombre === undefined || passwd === undefined){
    response.status(400);
  }else{

    response.status(201);
  }
  //users.push(nombre,passwd);
  
  response.end();

});

module.exports = router;
