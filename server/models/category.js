const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

let Schema = mongoose.Schema;

let userSchema = new Schema({
    name: {
        type: String,
        required: [true, 'El nombe es requerido'],
    },
    code: {
        type: String,
        unique: true,
        required: [true, 'El código es requerido'],
    },
    description: {
        type: String,
        required: [true, 'La descripcion es requerida'],
    },
    img: {
        type: String,
        required: false,
    },
    status: {
        type: Boolean,
        default: true,
    },
    lastModifiedUserId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'El id del usuario es requerido'],
    },
    lastModifiedDate: {
        type: Date,
        default: new Date(),
    },
    createdDate: {
        type: Date,
        default: new Date(),
    }
});


userSchema.plugin(uniqueValidator, { message: '{PATH} debe ser único' });

module.exports = mongoose.model('Category', userSchema);