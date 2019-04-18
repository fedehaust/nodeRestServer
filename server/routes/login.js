const express = require('express');
const Usuario = require('../models/usuario');
const app = express();
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
const saltRounds = 10;
const _ = require('underscore');
const {
    OAuth2Client
} = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

app.post('/login', (req, res) => {
    const body = req.body;

    Usuario.findOne({
        email: body.email
    }, (error, userDB) => {
        if (error) {
            return res.status(400).json({
                ok: false,
                error,
                message: 'Ocurrio un error ingresando a la aplicación',
            });
        }

        if (!userDB) {
            return res.status(400).json({
                ok: false,
                error,
                message: 'Usuario o contraseña incorrectos',
            });
        }

        if (!bcrypt.compareSync(body.password, userDB.password)) {
            return res.status(400).json({
                ok: false,
                error,
                message: 'Usuario o contraseña incorrectos',
            });

        }
        const token = jwt.sign({
            usuario: userDB
        }, process.env.TOKEN_SEED, {
            expiresIn: process.env.TOKEN_EXPIRED,
        });

        res.json({
            ok: true,
            userDB,
            token,
        });
    });

});

app.post('/google', async(req, res) => {
    const token = req.body.idtoken;
    const googleUser = await (verify(token)
        .catch(error => {
            return res.status(403).json({
                ok: false,
                error,
            });
        }));

    Usuario.findOne({
        email: googleUser.email
    }, (error, usuarioDb) => {
        if (error) {
            return res.status(400).json({
                ok: false,
                error,
                message: 'Ocurrio un error ingresando a la aplicación con Google',
            });
        }
        if (usuarioDb) {
            if (usuarioDb.google === false) {
                return res.status(400).json({
                    ok: false,
                    error,
                    message: 'Debe autenticarse'
                });
            } else {
                const token = jwt.sign({
                    usuario: usuarioDb
                }, process.env.TOKEN_SEED, {
                    expiresIn: process.env.TOKEN_EXPIRED,
                });

                res.json({
                    ok: true,
                    usuarioDb,
                    token,
                });
            }
        } else {
            const user = new Usuario();

            user.nombre = googleUser.nombre;
            user.email = googleUser.email;
            user.img = googleUser.img;
            user.google = true;
            user.password = 'andTheMom?';

            user.save((error, usuarioInserted) => {
                if (error) {
                    return res.status(500).json({
                        ok: false,
                        error,
                        message: 'Ocurrio un error insertando el usuario'
                    });
                }

                const token = jwt.sign({
                    usuario: usuarioInserted
                }, process.env.TOKEN_SEED, {
                    expiresIn: process.env.TOKEN_EXPIRED,
                });

                res.json({
                    ok: true,
                    usuario: usuarioInserted,
                    token
                });
            });
        }
    });
});

async function verify(token) {
    const ticket = await (client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
    }));
    const payload = ticket.getPayload();
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
};
module.exports = app;