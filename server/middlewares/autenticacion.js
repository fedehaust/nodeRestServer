const jwt = require('jsonwebtoken');


let checkToken = (req, res, next) => {
    let token = req.get('Authorization');
    jwt.verify(token, process.env.TOKEN_SEED, (error, decoded) => {
        if (error) {
            return res.status(401).json({
                ok: false,
                error: {
                    message: 'Debe tener un token válido.'
                },
            });
        }
        req.usuario = decoded.usuario;
        next();
    });
};

let checkAdmin = (req, res, next) => {
    let user = req.usuario;
    if (user.role === 'ADMIN_ROLE') {
        next();
        return;
    }

    return res.status(401).json({
        ok: false,
        error: {
            message: 'Usuario sin permisos para la operación.'
        },
    });
};

module.exports = {
    checkToken,
    checkAdmin
}