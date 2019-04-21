const express = require('express');
const {
    checkToken,
    checkAdmin
} = require('../middlewares/authentication');
const app = express();
const Product = require('../models/product');
const _ = require('underscore');


app.get('/product', checkToken, (req, res) => {

    const from = Number(req.query.from) || 0;
    const to = Number(req.query.to) || 5;

    Product.find({
            available: true
        })
        .populate('categoryId')
        .populate('userId', 'name email')
        .sort('name')
        .limit(to)
        .skip(from)
        .exec((error, products) => {
            if (error) {
                return res.status(500).json({
                    ok: false,
                    error,
                    message: 'Ocurrio un error obteniendo los productos'
                });
            }
            Product.countDocuments({
                status: true
            }, (errorCount, count) => {
                if (errorCount) {
                    return res.status(400).json({
                        ok: false,
                        errorCount,
                        message: 'Ocurrio un error contando los productos'
                    });
                }
                res.json({
                    ok: true,
                    total: count,
                    products
                });
            });
        });
});

app.get('/product/:id', [checkToken], (req, res) => {
    const id = req.params.id;

    Product.findById(id)
        .populate('categoryId')
        .populate('userId', 'name email')
        .exec(
            (error, product) => {
                if (error) {
                    return res.status(500).json({
                        ok: false,
                        error,
                        message: 'Ocurrio un error obteniendo el producto'
                    });
                }

                if (!product) {
                    return res.json({
                        ok: false,
                        message: 'No se encuentra ningun producto con el identificador enviado.'
                    });
                }

                res.json({
                    ok: true,
                    product
                });
            });
});

app.get('/product/search/:searchText', [checkToken], (req, res) => {
    const searchText = req.params.searchText;

    const rgx = new RegExp(searchText, 'i');

    Product.find({
            name: rgx
        })
        .populate('categoryId')
        .populate('userId', 'name email')
        .exec(
            (error, products) => {
                if (error) {
                    return res.status(500).json({
                        ok: false,
                        error,
                        message: 'Ocurrio un error obteniendo el producto'
                    });
                }

                if (!products) {
                    return res.json({
                        ok: false,
                        message: 'No se encuentra ningun producto con el identificador enviado.'
                    });
                }

                res.json({
                    ok: true,
                    products
                });
            });
});

app.post('/product', [checkToken], (req, res) => {
    const body = req.body;
    let product = new Product({
        name: body.name,
        code: body.code,
        priceUnit: body.priceUnit,
        available: body.available,
        description: body.description,
        img: body.img,
        categoryId: body.categoryId,
        userId: req.user._id
    });
    product.save((error, productDb) => {
        if (error) {
            return res.status(500).json({
                ok: false,
                error,
                message: 'Ocurrio un error insertando el producto'
            });
        }

        res.json({
            ok: true,
            productDb
        });
    })

});

app.put('/product/:id', [checkToken], (req, res) => {
    const id = req.params.id;
    let body = _.pick(req.body, ['name', 'code', 'img', 'description', 'priceUnit', 'available', 'categoryId']);
    body.userId = req.user._id;
    body.lostModifiedDate = new Date();
    console.log(body);

    Product.findByIdAndUpdate(id, body, {
        new: true,
        runValidators: true,
        context: 'query'
    }, (error, productDb) => {
        if (error) {
            return res.status(500).json({
                ok: false,
                error,
                message: 'Ocurrio un error actualizando el producto'
            });
        }

        if (!productDb) {
            return res.json({
                ok: false,
                message: 'No se encuentra ningun producto con el identificador enviado.'
            });
        }

        res.json({
            ok: true,
            productDb
        });

    });
});

app.delete('/product/:id', [checkToken, checkAdmin], (req, res) => {
    const id = req.params.id;
    const body = {
        available: false
    };
    Product.findByIdAndUpdate(id, body, {
        new: true,
        runValidators: true
    }, (error, productDb) => {
        if (error) {
            return res.status(500).json({
                ok: false,
                error,
                message: 'Ocurrio un error borrando el producto'
            });
        }

        if (!productDb) {
            return res.json({
                ok: false,
                message: 'No se encuentra ningun producto con el identificador enviado.'
            });
        }

        res.json({
            ok: true,
            productDb
        });

    });
});



module.exports = app;