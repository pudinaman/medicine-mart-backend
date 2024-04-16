const mongoose = require('mongoose')
const ObjectID = mongoose.Schema.Types.ObjectId

const cartSchema = new mongoose.Schema({
    userId : {
        type: ObjectID,
        required: true,
        ref: 'User'
    },
    products: [{
        productId: {
            type: ObjectID,
            ref: 'Product',
            required: true
        },
        name: String,
        quantity: {
            type: Number,
            required: true,
            min: 1,
            default: 1
        },
        price: Number,
        actual_price: Number,
        sale_price: Number,
    }],
    bill: {
        type: Number,
        required: true,
        default: 0,
        get: v => Number(v.toFixed(2)), 
        set: v => Number(Number(v).toFixed(2))
    }
}, {
    timestamps: true
})

const Cart = mongoose.model('Cart', cartSchema)

module.exports = Cart