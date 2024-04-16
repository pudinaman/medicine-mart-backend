const mongoose = require('mongoose');

const billingSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    billings: [{
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    companyName: String,
    address: {
        street: {
            type: String,
            required: true
        },
        apartment: String,
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        postalCode: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true
        }
    },
    email: {
        type: String,
        required: true,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    phone: {
        type: String,
        required: true
    },
    shipToDifferentAddress: {
        type: Boolean,
        default: false
    },
    orderNotes: String
}],
}, {
    timestamps: true
});

    
const Billing = mongoose.model('Billing', billingSchema);

module.exports = Billing;
