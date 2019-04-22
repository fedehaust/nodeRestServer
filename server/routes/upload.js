const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const fs = require('fs');
const path = require('path');
const User = require('../models/user');
const Category = require('../models/category');
const Product = require('../models/product');

app.use(fileUpload({
    useTempFiles: true
}));

app.put('/upload/:type/:id', function(req, res) {

    const type = req.params.type;
    const id = req.params.id;

    const validTypes = ['products', 'categories', 'users'];

    if (validTypes.indexOf(type) < 0) {
        return res.status(400).json({
            ok: false,
            error: {
                message: `Ruta especificada incorrecta, debe ser ${validTypes.join(', ')}`,
                type
            }
        });
    }

    if (Object.keys(req.files).length == 0) {
        return res.status(400).json({
            ok: false,
            error: {
                message: 'Ocurrio un error subiendo los archivos'
            }
        });
    }

    let file = req.files.file;
    let fileExtension = file.name.split('.')[file.name.split('.').length - 1];

    const validExtensions = ['jpg', 'jpeg', 'png', 'gif'];

    if (validExtensions.indexOf(fileExtension) < 0) {
        return res.status(400).json({
            ok: false,
            error: {
                message: `Extension de archivo no valida, debe ser ${validExtensions.join(', ')}`,
                extension: fileExtension
            }
        });
    }

    const filename = `${id}-${new Date().getMilliseconds()}.${fileExtension}`;



    try {
        fs.mkdirSync(path.resolve(__dirname, `../../uploads`));
    } catch (err) {
        if (err.code !== 'EEXIST') {
            return res.status(500).json({
                ok: false,
                error: err
            });
        }
    }
    try {
        fs.mkdirSync(path.resolve(__dirname, `../../uploads/${type}`));
    } catch (err) {
        if (err.code !== 'EEXIST') {
            return res.status(500).json({
                ok: false,
                error: err
            });
        }
    }


    file.mv(`uploads/${type}/${filename}`, (error) => {
        if (error) {
            return res.status(500).json({
                ok: false,
                error
            });
        }


        switch (type) {
            case 'users':
                userImage(id, res, filename, type);
                break;
            case 'categories':
                categoryImage(id, res, filename, type);
                break;
            case 'products':
                productImage(id, res, filename, type);
                break;
            default:
                deleteFile(filename, type);
                return res.status(500).json({
                    ok: false,
                    error
                });
        }
    });
});


function productImage(id, res, filename, folder) {
    Product.findById(id, (error, productDb) => {
        if (error) {
            deleteFile(filename, folder);
            return res.status(400).json({
                ok: false,
                error
            });
        }

        if (!productDb) {
            deleteFile(filename, folder);
            return res.status(400).json({
                ok: false,
                error: {
                    message: 'Producto no existe'
                }
            });
        }

        deleteFile(productDb.img, folder);

        productDb.img = filename;

        productDb.save((error, productUpdatedDb) => {
            if (error) {
                return res.status(500).json({
                    ok: false,
                    error,
                    message: 'Ocurrio un error actualizando la imagen del producto'
                });
            }

            res.json({
                ok: true,
                productUpdatedDb,
                img: filename
            });
        });
    });
}

function categoryImage(id, res, filename, folder) {
    Category.findById(id, (error, categoryDb) => {
        if (error) {
            deleteFile(filename, folder);
            return res.status(400).json({
                ok: false,
                error
            });
        }

        if (!categoryDb) {
            deleteFile(filename, folder);
            return res.status(400).json({
                ok: false,
                error: {
                    message: 'Categoría no existe'
                }
            });
        }

        deleteFile(categoryDb.img, folder);

        categoryDb.img = filename;

        categoryDb.save((error, categoryUpdatedDb) => {
            if (error) {
                return res.status(500).json({
                    ok: false,
                    error,
                    message: 'Ocurrio un error actualizando la imagen de la categoría'
                });
            }

            res.json({
                ok: true,
                categoryUpdatedDb,
                img: filename
            });
        });
    });
}

function userImage(id, res, filename, folder) {
    User.findById(id, (error, userDb) => {
        if (error) {
            deleteFile(filename, folder);
            return res.status(400).json({
                ok: false,
                error
            });
        }

        if (!userDb) {
            deleteFile(filename, folder);
            return res.status(400).json({
                ok: false,
                error: {
                    message: 'Usuario no existe'
                }
            });
        }

        deleteFile(userDb.img, folder);

        userDb.img = filename;

        userDb.save((error, userUpdatedDb) => {
            if (error) {
                return res.status(500).json({
                    ok: false,
                    error,
                    message: 'Ocurrio un error actualizando la imagen del usuario'
                });
            }

            res.json({
                ok: true,
                userUpdatedDb,
                img: filename
            });
        });
    });
}

function deleteFile(imageName, folder) {
    const urlPath = path.resolve(__dirname, `../../uploads/${folder}/${imageName}`);
    if (fs.existsSync(urlPath)) {
        fs.unlinkSync(urlPath);
    }
}

module.exports = app;