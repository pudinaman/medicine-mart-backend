const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const couponSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true
  },
  discount: {
    type: Number,
    required: true
  },
  expiryDate: {
    type: Date,
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  couponUsedLimit: {
    type: Number,
    required: false,
    default: 0
  },
  userUsed: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  couponUsedLimit: {
    type: Number,
    required: false,
    default: 0
  },
});

module.exports = mongoose.model('Coupon', couponSchema);
module.exports = mongoose.model('Coupon', couponSchema);

