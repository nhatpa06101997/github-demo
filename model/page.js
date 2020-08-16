const mongoose = require('mongoose');

const pageSchema = mongoose.Schema({
    title: {type: String, required: true},
    slug: {type: String, required: true},
    content: {type: String, required: true}
});

module.exports = mongoose.model('Page',pageSchema);