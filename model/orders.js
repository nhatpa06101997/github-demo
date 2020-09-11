const mongoose = require('mongoose');
const schema = mongoose.Schema;

const orderSche = schema({
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    orders:[{
        productId: {
            type: mongoose.Schema.Types.ObjectId, ref: 'Product'
        },
        carts: {
            title: {type:String},
            price: {type:Number},
            qty: {type:Number},
            image: {type:String}
        }
    }],
    time: {type:String}
})

module.exports = mongoose.model('Order',orderSche);