const path = require('path');
const express = require('express');
const open = require('open');
const app = express();

app.use('/jszip/', express.static(path.resolve(__dirname + '/../jszip/')));
app.use('/fisheyegl/', express.static(path.resolve(__dirname + '/../fisheyegl/')));
app.use('/footage/', express.static(path.resolve(__dirname + '/../footage/')));
app.use('/', express.static(__dirname));

app.listen(8080, () => {
    open('http://localhost:8080');
});
