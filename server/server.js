require('./config/config');
const express = require('express');
const mongoose = require('mongoose');
const colors = require('colors');
const path = require('path');

const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
app.use(require('./routes/index'));

mongoose.connect(process.env.URLDB, { useNewUrlParser: true, useCreateIndex: true }, (error, response) => {

    if (error) throw error;

    console.log("Base de datos OK.".yellow);
});

app.use(express.static(path.resolve(__dirname, '../public')));


app.listen(process.env.PORT, () => {
    console.log("Escuchando en el puerto: ", process.env.PORT);
});