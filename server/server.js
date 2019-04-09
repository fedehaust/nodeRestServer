require('./config/config');

const express = require('express');
const app = express();
const bodyParser = require('body-parser')
    // create application/x-www-form-urlencoded parser
app.use(bodyParser.urlencoded({
    extended: false
}));
// create application/json parser
app.use(bodyParser.json());

app.get('/usuario', function(req, res) {
    res.json('get usuario');
});
app.post('/usuario', function(req, res) {
    const body = req.body;

    if (body.nombre === undefined) {
        res.status(400).json({
            error: true,
            message: "El nombre de la persona es obligatorio"
        });
    }

    res.json(body);
});
app.put('/usuario/:id', function(req, res) {
    const id = req.params.id;
    res.json(`put usuario id: ${id}`);
});
app.delete('/usuario', function(req, res) {
    res.json('delete usuario');
});

app.listen(process.env.PORT, () => {
    console.log("Escuchando en el puerto: ", process.env.PORT);
});