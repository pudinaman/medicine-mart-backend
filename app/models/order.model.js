// const mongoose = require('mongoose')
// const ObjectID = mongoose.Schema.Types.ObjectId

// const orderSchema = new mongoose.Schema({
//     owner : {
//         type: ObjectID,
//         required: true,
//         ref: 'User'
//     },
//     order_id: String,
//     products: [{
//         productId: {
//             type: ObjectID,
//             ref: 'Product',
//             required: true
//         },
//         name: String,
//         quantity: {
//             type: Number,
//             required: true,
//             min: 1,
//             default: 1
//         },
//         price: Number,
//         size: String
//     }],
//     bill: {
//         type: Number,
//         required: true,
//         default: 0
//     }
// }, {
//     timestamps: true
// })

// const Order = mongoose.model('Order', orderSchema)

// module.exports = Order


const mongoose = require('mongoose');
const ObjectID = mongoose.Schema.Types.ObjectId;

const orderSchema = new mongoose.Schema({
    owner: {
        type: ObjectID,
        required: false,
        ref: 'User'
    },
    order_id: String,
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
        selected_size: String,
        product_image: String,
        actual_price: Number,
        sale_price: Number,
    }],
    bill: {
        type: Number,
        required: true,
        default: 0
    },
    actual_bill: {
        type: Number,
        required: true,
        default: 0
    },


    couponUsed: String,
    couponDiscount: Number,

    payment_id: String,

    billing_address: {
       address: {
            street: String,
            apartment: String,
            city: String,
            state: String,
            postalCode: String,
            country: String
        },
        firstName: String,
        lastName: String,
        companyName: String,
        email: String,
        phone: String,
        shipToDifferentAddress: Boolean,
        orderNotes: String,
        _id: false 
    },
    status:{
        type: String,
        default:"Packed"
    },
    
}, {
    timestamps: true
});

orderSchema.methods.calculateBill = function(orderTotal) {
   this.bill = orderTotal;
};

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
