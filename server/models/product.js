var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var productoSchema = new Schema({
    name: { type: String, required: [true, 'El nombre es necesario'] },
    priceUnit: { type: Number, required: [true, 'El precio únitario es necesario'] },
    description: { type: String, required: false },
    available: { type: Boolean, required: true, default: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    img: { type: String, required: false }
});


module.exports = mongoose.model('Product', productoSchema);