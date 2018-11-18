
var express = require('express');
var app = express();
var path = require('path');

app.use('/', express.static('./src'));

app.listen(8080);
