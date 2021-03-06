const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

let validRoles = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol válido'
};
let Schema = mongoose.Schema;

let userSchema = new Schema({
    name: {
        type: String,
        required: [true, 'El nombe es requerido'],
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'El correo es requerido'],
    },
    password: {
        type: String,
        required: [true, 'La contaseña es obligatoria'],
    },
    img: {
        type: String,
        required: false,
    },
    role: {
        type: String,
        default: 'USER_ROLE',
        enum: validRoles
    },
    status: {
        type: Boolean,
        default: true,
    },
    google: {
        type: Boolean,
        default: false,
    }
});

userSchema.methods.toJSON = function() {
    const user = this;
    const userResult = user.toObject();
    delete userResult.password;

    return userResult;
}

userSchema.plugin(uniqueValidator, { message: '{PATH} debe ser único' });

module.exports = mongoose.model('User', userSchema);