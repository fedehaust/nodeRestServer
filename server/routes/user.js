const express = require('express');
const User = require('../models/user');
const app = express();
const bcrypt = require('bcrypt');
const saltRounds = 10;
const _ = require('underscore');
const { checkToken, checkAdmin } = require('../middlewares/authentication');



app.get('/user', checkToken, (req, res) => {

    const from = Number(req.query.from) || 0;
    const to = Number(req.query.to) || 5;

    User.find({ status: true }, 'name email role status img google')
        .limit(to)
        .skip(from)
        .exec((error, users) => {
            if (error) {
                return res.status(500).json({
                    ok: false,
                    error,
                    message: 'Ocurrio un error obteniendo los usuarios'
                });
            }
            User.countDocuments({ status: true }, (errorCount, count) => {
                if (errorCount) {
                    return res.status(500).json({
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
app.post('/user', [checkToken, checkAdmin], (req, res) => {
    const body = req.body;

    let user = new User({
        name: body.name,
        email: body.email,
        password: bcrypt.hashSync(body.password, saltRounds),
        role: body.role,
    });

    user.save((error, userDb) => {
        if (error) {
            return res.status(500).json({
                ok: false,
                error,
                message: 'Ocurrio un error insertando el usuario'
            });
        }

        res.json({
            ok: true,
            userDb
        });
    })

});

app.put('/user/:id', [checkToken, checkAdmin], (req, res) => {
    const id = req.params.id;
    const body = _.pick(req.body, ['name', 'email', 'img', 'role', 'status']);

    User.findByIdAndUpdate(id, body, {
        new: true,
        runValidators: true,
        context: 'query'
    }, (error, userDb) => {
        if (error) {
            return res.status(500).json({
                ok: false,
                error,
                message: 'Ocurrio un error actualizando el usuario'
            });
        }

        res.json({
            ok: true,
            userDb
        });

    });
});
app.delete('/user/:id', [checkToken, checkAdmin], (req, res) => {
    const id = req.params.id;
    const body = { status: false };
    User.findByIdAndUpdate(id, body, {
        new: true,
        runValidators: true
    }, (error, userDb) => {
        if (error) {
            return res.status(500).json({
                ok: false,
                error,
                message: 'Ocurrio un error borrando el usuario'
            });
        }

        res.json({
            ok: true,
            userDb
        });

    });
});

module.exports = app;