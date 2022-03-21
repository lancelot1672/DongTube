var express = require('express');
var router = express.Router();

//ejs
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

