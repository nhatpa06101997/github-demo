const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    title: {type: String, required: true},
    slug: {type: String},
    price: {type: Number, required: true},
    image: {type: String},
    desc: {type: String},
    category: {type: String, required: true}
});

module.exports = mongoose.model('Product',productSchema);