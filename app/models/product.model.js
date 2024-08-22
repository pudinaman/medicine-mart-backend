const mongoose = require('mongoose')
const ObjectID = mongoose.Schema.Types.ObjectId

const productSchema = new mongoose.Schema({
    owner : {
        type: ObjectID,
       // required: true,
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
    description_details: {
        title: {
            type: String,
            required: false,
            trim: true
        },
        description: {
            type: String,
            required: false
        },
        key_features_details: {
            type: [{
                point: {
                    type: String,
                    required: true
                },
                description: {
                    type: String,
                    required: true
                }
            }]
        }
    },
    faq: {
        type: [{
            question: {
                type: String,
                required: true
            },
            answer: {
                type: String,
                required: true
            }
        }]
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
        type: [{
            size: String, 
            price: Number
        }],
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
    old_price:{
        type:Number,
        required:false
    },
    ratings: {
        type: Number,
        required: false
    },
    // reviews: { 
    //     type: [{
    //         review: String, 
    //         image: [String],
    //         likes: { type: Number, default: 0},
    //         dislikes: { type: Number, default: 0}
    //     }],
    //     required: false
    // },
    reviews: [{
        user: {
            type: ObjectID,
            ref: 'User',
            required: true
        },
        username: String,
        avatar: String,
        review_text: {
            type: String,
            required: true
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        images: [String],
        likes: {
            type: Number,
            default: 0
        },
        dislikes: {
            type: Number,
            default: 0
        },
        date: {
            type: Date,
            default: Date.now
        }
    }],
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
    availability: {
        type: String,
        required: false,
        default: "0"
    },
    unit: {
        type: String,
        required: false
    },
    total_orders_of_product: {
        type: Number, 
        required: false,
        default: 0
    },
   
}, {
    timestamps: true
})

const Product = mongoose.model('product', productSchema)

module.exports = Product
