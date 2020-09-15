module.exports =function(){
var express = require('express');
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
var bodyParser = require('body-parser');
var app = express();

 //app.use('/js', express.static(__dirname + "/js");
 app.use(bodyParser.urlencoded({ extended: false }));
 app.use(session({
  secret: '1234DSFs@adf1234!@#$asd',
  resave: false,
  saveUninitialized: true,
  //store:new FileStore()
  store:new MySQLStore({
    host:'localhost',
    port:3306,
    user:'root',
    password:'111111',
    database:'o2'
  })
}));
return app;
}
