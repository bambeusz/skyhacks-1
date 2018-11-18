var express = require('express');
var app = express();
var path = require('path');

app.use('/fisheyegl/', express.static(path.resolve(__dirname + '/../fisheyegl/')));
app.use('/footage/', express.static(path.resolve(__dirname + '/../footage/')));
app.use('/', express.static(path.resolve(__dirname)));

app.listen(8080);
