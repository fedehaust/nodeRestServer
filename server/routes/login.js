const express = require('express');
const User = require('../models/user');
const app = express();
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
const _ = require('underscore');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

app.post('/login', (req, res) => {
    const body = req.body;
    User.findOne({
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
            user: userDB
        }, process.env.TOKEN_SEED, {
            expiresIn: process.env.TOKEN_EXPIRED,
        });

        res.json({
            ok: true,
            user: userDB,
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

    User.findOne({
        email: googleUser.email
    }, (error, userDb) => {
        if (error) {
            return res.status(400).json({
                ok: false,
                error,
                message: 'Ocurrio un error ingresando a la aplicación con Google',
            });
        }
        if (userDb) {
            if (userDb.google === false) {
                return res.status(400).json({
                    ok: false,
                    error,
                    message: 'Debe autenticarse'
                });
            } else {
                const token = jwt.sign({
                    user: userDb
                }, process.env.TOKEN_SEED, {
                    expiresIn: process.env.TOKEN_EXPIRED,
                });

                res.json({
                    ok: true,
                    user: userDb,
                    token,
                });
            }
        } else {
            const user = new User();

            user.name = googleUser.name;
            user.email = googleUser.email;
            user.img = googleUser.img;
            user.google = true;
            user.password = 'andTheMom?';

            user.save((error, userInserted) => {
                if (error) {
                    return res.status(500).json({
                        ok: false,
                        error,
                        message: 'Ocurrio un error insertando el usuario'
                    });
                }

                const token = jwt.sign({
                    user: userInserted
                }, process.env.TOKEN_SEED, {
                    expiresIn: process.env.TOKEN_EXPIRED,
                });

                res.json({
                    ok: true,
                    user: userInserted,
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
        name: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
};
module.exports = app;