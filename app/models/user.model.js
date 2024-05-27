const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const webhookEventSchema = new mongoose.Schema({
  event: String,
  payload: mongoose.Schema.Types.Mixed,
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  created_at: { type: Date, default: Date.now },
});




const transactionDetails = new Schema({
  id: { type: String, required: false },
  entity: { type: String, required: false },
  amount: { type: Number, required: false },
  currency: { type: String, required: false },
  status: { type: String, required: false },
  order_id: { type: String, required: false },
  invoice_id: { type: String, required: false },
  international: { type: Boolean, required: false },
  method: { type: String, required: false },
  amount_refunded: { type: Number, required: false },
  refund_status: { type: String, required: false },
  captured: { type: Boolean, required: false },
  description: { type: String, required: false },
  card_id: { type: String, required: false },
  bank: { type: String, required: false },
  wallet: { type: String, required: false },
  vpa: { type: String, required: false },
  email: { type: String, required: false },
  contact: { type: String, required: false },
  fee: { type: Number, required: false },
  tax: { type: Number, required: false },
  error_code: { type: String, required: false },
  error_description: { type: String, required: false },
  error_source: { type: String, required: false },
  error_step: { type: String, required: false },
  error_reason: { type: String, required: false },
  acquirer_data: {
    bank_transaction_id: { type: String, required: false }
  },
  created_at: { type: Date, default: Date.now },
  event: String,
      payload: mongoose.Schema.Types.Mixed,
  bonusDeduct: { type: String, required: false },
  balanceDeduct: { type: String, required: false },
});


const User = mongoose.model(
  "users",
  new mongoose.Schema({
    WebhookEvent: [webhookEventSchema],
    avatar: {
      type: String,
      required: false,
      unique: false,
    },
    transactionHistory: {
      deposit: [transactionDetails],
      // depositfail: [transactionDetails],
      contestfee: [transactionDetails],
      winningAmount: [transactionDetails],
      total_balance: [transactionDetails],
      bonus: [transactionDetails],
      withdrawal: [transactionDetails],
    },
    firebaseUid: String,
    username: {
      type: String,
      required: false,
      unique: true,
    },
    email: {
      type: String,
      deault: '',
      required: false,
      unique: true,
      sparse: true,
    },

    emailVerified: {
      type: Boolean,
      default: false,
    },
    mobileVerified: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      // required: true,
    },
    googleId: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
    },
    provider: {
      type: String,
      required: false,
      unique: false,
    },
    phoneNumber: {
      type: String,
      required: false,
      default: '',
      // unique: true,
      sparse: true,
    },
    gender: {
      type: String,
    },
    bio: {
      type: String
    },
    profilePicture: {
      type: String,
      //   required: false,
      //   unique: false,
    },
    accessToken: {
      type: String,
      unique: true,
    },
  
    roles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role"
      }
    ],
    createdAt: {
      type: Date,
      required: true,
      unique: false,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      required: false,
      unique: false,
      default: Date.now,
    },
    appLanguage: {
      type: String,
      required: false,
      unique: false,
    },
    otp: {
      type: String,
      required: false,
      unique: false,
    },
    adhaarNumber: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
    },
    adhaarFrontImage: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
    },

    adhaarBackImage: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
    },
    adhaarVerified: {
      type: String,
      required: false,
      unique: false,
    },
    // isMobileVerified: {
    //   type: Boolean,
    //   default: false,
    // },
    panPhoto: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
    },
    panNumber: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
    },
    panVerified: {
      type: String,
      required: false,
      unique: false,
    },
    name: {
      type: String,
      required: false,
      unique: false,
    },
    pincode: {
      type: String,
      required: false,
      unique: false,
    },
    location: {
      type: String,
      required: false,
      unique: false,
    },
    dob: {
      type: String,
      required: false,
      unique: false,
    },
   
    instagram: {
      type: String,
      required: false,
      unique: false,
    },
    twitter: {
      type: String,
      required: false,
      unique: false,
    },
    facebook: {
      type: String,
      required: false,
      unique: false,
    },

  
    bankAccountNumber: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
    },
    bankName: {
      type: String,
      required: false,
      unique: false,
    },
    ifscCode: {
      type: String,
      required: false,
      unique: false,
    },
    branchName: {
      type: String,
      required: false,
      unique: false,
    },
    accountHolderName: {
      type: String,
      required: false,
      unique: false,
    },
    bankVerified: {
      type: String,
      required: false,
      unique: false,
    },
    loggedIn: {
      type: Boolean,
    },
    signupType: {
      type: String,
      required: false,
      unique: false,
    },

    order_ids: [
      {
        _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
        orderId: String,
        productIds: [String],
        order_date: { type: Date, default: Date.now }
      }
    ],
    coupons: [
      {
        couponId: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' },
        code: String,
        discount: Number
      }
    ],
    appointments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' }],
  })
);

module.exports = User;