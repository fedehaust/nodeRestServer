const express = require('express');
const Usuario = require('../models/usuario');
const app = express();
const bcrypt = require('bcrypt');
const saltRounds = 10;
const _ = require('underscore');
const { checkToken, checkAdmin } = require('../middlewares/autenticacion');



app.get('/usuario', checkToken, (req, res) => {

    const from = Number(req.query.desde) || 0;
    const to = Number(req.query.hasta) || 5;

    Usuario.find({ status: true }, 'nombre email role status img google')
        .limit(to)
        .skip(from)
        .exec((error, users) => {
            if (error) {
                return res.status(400).json({
                    ok: false,
                    error,
                    message: 'Ocurrio un error obteniendo los usuarios'
                });
            }
            Usuario.countDocuments({ status: true }, (errorCount, count) => {
                if (errorCount) {
                    return res.status(400).json({
                        ok: false,
                        errorCount,
                        message: 'Ocurrio un error contando los usuarios'
                    });
                }
                res.json({
                    ok: true,
                    total: count,
                    users
                });
            });
        });
});
app.post('/usuario', [checkToken, checkAdmin], (req, res) => {
    const body = req.body;

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, saltRounds),
        role: body.role,
    });

    usuario.save((error, usuarioDb) => {
        if (error) {
            return res.status(400).json({
                ok: false,
                error,
                message: 'Ocurrio un error insertando el usuario'
            });
        }

        res.json({
            ok: true,
            usuario: usuarioDb
        });
    })

});

app.put('/usuario/:id', [checkToken, checkAdmin], (req, res) => {
    const id = req.params.id;
    const body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'status']);

    Usuario.findByIdAndUpdate(id, body, {
        new: true,
        runValidators: true,
        context: 'query'
    }, (error, usuarioDb) => {
        if (error) {
            return res.status(400).json({
                ok: false,
                error,
                message: 'Ocurrio un error actualizando el usuario'
            });
        }

        res.json({
            ok: true,
            usuarioDb
        });

    });
});
app.delete('/usuario/:id', [checkToken, checkAdmin], (req, res) => {
    const id = req.params.id;
    const body = { status: false };
    Usuario.findByIdAndUpdate(id, body, {
        new: true,
        runValidators: true
    }, (error, usuarioDb) => {
        if (error) {
            return res.status(400).json({
                ok: false,
                error,
                message: 'Ocurrio un error insertando el usuario'
            });
        }

        res.json({
            ok: true,
            usuarioDb
        });

    });
});

module.exports = app