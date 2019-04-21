const express = require('express');
const {
    checkToken,
    checkAdmin
} = require('../middlewares/authentication');
const app = express();
const Category = require('../models/category');
const _ = require('underscore');


app.get('/category', checkToken, (req, res) => {

    const from = Number(req.query.from) || 0;
    const to = Number(req.query.to) || 5;

    Category.find({
            status: true
        })
        .populate('lastModifiedUserId', 'name email')
        .sort('name')
        .limit(to)
        .skip(from)
        .exec((error, categories) => {
            if (error) {
                return res.status(500).json({
                    ok: false,
                    error,
                    message: 'Ocurrio un error obteniendo las categorías'
                });
            }
            Category.countDocuments({
                status: true
            }, (errorCount, count) => {
                if (errorCount) {
                    return res.status(400).json({
                        ok: false,
                        errorCount,
                        message: 'Ocurrio un error contando las categorías'
                    });
                }
                res.json({
                    ok: true,
                    total: count,
                    categories
                });
            });
        });
});

app.get('/category/:id', [checkToken], (req, res) => {
    const id = req.params.id;

    Category.findById(id)
        .populate('lastModifiedUserId', 'name email')
        .exec((error, category) => {
            if (error) {
                return res.status(500).json({
                    ok: false,
                    error,
                    message: 'Ocurrio un error obteniendo la categoría'
                });
            }

            if (!category) {
                return res.json({
                    ok: false,
                    message: 'No se encuentra ninguna categoría con el identificador enviado.'
                });
            }

            res.json({
                ok: true,
                category
            });
        });
});

app.post('/category', [checkToken, checkAdmin], (req, res) => {
    const body = req.body;
    let category = new Category({
        name: body.name,
        code: body.code,
        description: body.description,
        img: body.img,
        lastModifiedUserId: req.user._id
    });
    category.save((error, categoryDb) => {
        if (error) {
            return res.status(500).json({
                ok: false,
                error,
                message: 'Ocurrio un error insertando la categoría'
            });
        }

        res.json({
            ok: true,
            categoryDb
        });
    })

});

app.put('/category/:id', [checkToken, checkAdmin], (req, res) => {
    const id = req.params.id;
    let body = _.pick(req.body, ['name', 'code', 'img', 'description']);
    body.lastModifiedUserId = req.user._id;
    body.lastModifiedDate = new Date();
    console.log(body);

    Category.findByIdAndUpdate(id, body, {
        new: true,
        runValidators: true,
        context: 'query'
    }, (error, categoryDb) => {
        if (error) {
            return res.status(500).json({
                ok: false,
                error,
                message: 'Ocurrio un error actualizando la categoría'
            });
        }

        if (!categoryDb) {
            return res.json({
                ok: false,
                message: 'No se encuentra ninguna categoría con el identificador enviado.'
            });
        }

        res.json({
            ok: true,
            categoryDb
        });

    });
});

app.delete('/category/:id', [checkToken, checkAdmin], (req, res) => {
    const id = req.params.id;
    const body = {
        status: false
    };
    Category.findByIdAndUpdate(id, body, {
        new: true,
        runValidators: true
    }, (error, categoryDb) => {
        if (error) {
            return res.status(500).json({
                ok: false,
                error,
                message: 'Ocurrio un error borrando la categoría'
            });
        }

        if (!categoryDb) {
            return res.json({
                ok: false,
                message: 'No se encuentra ninguna categoría con el identificador enviado.'
            });
        }

        res.json({
            ok: true,
            categoryDb
        });

    });
});



module.exports = app;