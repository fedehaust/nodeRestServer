const express = require('express');
const Usuario = require('../models/usuario');
const app = express();
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
const saltRounds = 10;
const _ = require('underscore');


app.post('/login', (req, res) => {
    const body = req.body;

    Usuario.findOne({
        email: body.email
    }, (error, userDB) => {
        if (error) {
            return res.status(400).json({
                ok: false,
                error,
                message: 'Ocurrio un error ingresando a la aplicación'
            });
        }

        if (!userDB) {
            return res.status(400).json({
                ok: false,
                error,
                message: 'Usuario o contraseña incorrectos'
            });
        }

        if (!bcrypt.compareSync(body.password, userDB.password)) {
            return res.status(400).json({
                ok: false,
                error,
                message: 'Usuario o contraseña incorrectos'
            });

        }
        const token = jwt.sign({
            usuario: userDB
        }, process.env.TOKEN_SEED, { expiresIn: process.env.TOKEN_EXPIRED });

        res.json({
            ok: true,
            userDB,
            token
        });
    });

});

module.exports = app