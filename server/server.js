require('./config/config');
const express = require('express');
const mongoose = require('mongoose');
const colors = require('colors');


const app = express();
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
app.use(require('./routes/usuario'));


mongoose.connect(process.env.URLDB, { useNewUrlParser: true, useCreateIndex: true }, (error, response) => {

    if (error) throw error;

    console.log("Database Online.".yellow);
});


app.listen(process.env.PORT, () => {
    console.log("Escuchando en el puerto: ", process.env.PORT);
});
//fedehaust
//T5xatUH7o0OkivFn

//mongodb+srv://fedehaust:T5xatUH7o0OkivFn@firstrestserver-0xrhh.mongodb.net/cafe