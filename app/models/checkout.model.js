const mongoose = require('mongoose');
const { Schema } = mongoose;

const checkoutSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  items: [{
    productId : { type: Schema.Types.ObjectId, ref: 'Product' },
    name: { type: String },
    quantity: { type: Number },
    price: { type: Number }    
}],

   
  order_id: { type: Schema.Types.ObjectId, ref: 'Order' },
  shippingAddress: { type: Object },
  paymentMethod: { type: String },
  taxPrice: { type: Number, default: 0.0 },
  shippingPrice: { type: Number, default: 0.0 },
  totalPrice: { type: Number, required: false },
  isPaid: { type: Boolean, default: false },
  paidAt: { type: Date },
  paidAmount: { type: Number, default: 0.0 },
  orderStatus: { type: String, default: 'Pending' },
  paymentResult: { type: Object },
//   itemsPrice: { type: Number, required: true },
//   createdAt: { type: Date, default: Date.now },
//   updatedAt: { type: Date, default: Date.now },
  status: {
    type: String,
    default: 'Pending' // You can add more status options as needed
},
}, {
  timestamps: true
});

const Checkout = mongoose.model('Checkout', checkoutSchema);

module.exports = Checkout;

