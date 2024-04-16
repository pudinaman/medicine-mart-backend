const mongoose = require('mongoose')
const ObjectID = mongoose.Schema.Types.ObjectId

const productSchema = new mongoose.Schema({
    owner : {
        type: ObjectID,
        required: true,
        ref: 'User'
    },
    product_name: {
        type: String,
        required: true,
        trim: true
    },
    short_description: {
        type: String,
        required: false 
    },
    description: {
        type: String,
        required: false
    },
    category: {
        type: String,
        required: true
    },
    productForm: {
        type: String,
        required: true
    },
    suitable_for: {
        type: String,
        required: true
    },
    deficiency: {
        type: String,
        required: true
    },
    brand: {
        type: String,
        required: true
    },
    size: {
        type: [String],
        required: true
    },
    product_image: {
        type: [String],
        required: true
    },
    key_benefits: {
        type: String,
        required: true
    },
    ingredients: {
        type: String,
        required: true
    },
    how_to_use: {
        type: String,
        required: true
    },
    safety_information: {
        type: String,
        required: true
    },
    other_information: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    ratings: {
        type: Number,
        required: false
    },
    reviews: { 
        type: [{
            review: String, 
            image: [String] 
        }],
        required: false
    },
    status: {
        type: String,
        required: false
    },
    quantity: {
        type: Number,
        required: false
    },
    sale_discount: {
        type: Number, 
        required: false
    },
    actual_price: {
        type: Number,
        required: false
    },
    sale_price: {
        type: Number,
        required: false
    },
}, {
    timestamps: true
})

const Product = mongoose.model('prodcut', productSchema)

module.exports = Product