const mongoose = require('mongoose');

const cateSchema = mongoose.Schema({
    title: {type: String, required: true},
    slug: {type: String}
});

module.exports = mongoose.model('Category',cateSchema);