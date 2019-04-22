const express = require('express');
const fs = require('fs');
const app = express();
const path = require('path');
const { checkTokenImg } = require('../middlewares/authentication');

app.get('/image/:type/:img', checkTokenImg, (req, res) => {
    const type = req.params.type;
    const img = req.params.img;
    const imgPath = `/uploads/${type}/${img}`;
    const pathNoImage = path.resolve(__dirname, '../assets/no-image.jpg');
    const urlPath = path.resolve(__dirname, `../../uploads/${type}/${img}`);
    if (fs.existsSync(urlPath)) {
        return res.sendFile(urlPath);
    }
    res.sendFile(pathNoImage);
});


module.exports = app;