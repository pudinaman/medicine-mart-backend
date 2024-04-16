const express = require('express');
const cors = require("cors");
const bodyParser = require('body-parser');
const app = express();
const dbConfig = require('./app/config/db.config');
const db = require('./app/models');
const User = require('./app/models/user.model');
const admin = require('firebase-admin');
const Role = db.role;
const serviceAccount = require('./khurd-54065-firebase-adminsdk-gu85g-48fa269ebe.json');
require('dotenv').config();
db.mongoose.connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`)
  // db.mongoose.connect(process.env.MONGODB_URI)
    .then(console.log('Connected to MongoDB'))
    .catch(async (err) => {
        console.log('Error connecting to MongoDB', err);
    });
process.on('uncaughtException', async (err, data) => {
    try {
        console.log('Caught uncaught exception: ', err, data);
    } finally {
        process.exit(1);
    }
});

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.json({ message: "Welcome to the application." });
});

// routes
require('./app/routes/auth.routes')(app);
require('./app/routes/order.routes')(app);
require('./app/routes/product.routes')(app);
require('./app/routes/cart.routes')(app);
require('./app/routes/billing.routes')(app);
require('./app/routes/firebaseAuth.routes')(app);
require('./app/routes/coupon.routes')(app);
require('./app/routes/checkout.routes')(app);


exports.sendOTPMobile = async (mobileNumber, user_id) => {
    if (!user_id) {
      throw new Error('User ID is required');
    }
    const user = await User.findById(user_id);
    if (!user) {
      throw new Error('User not found');
    }
    if (!mobileNumber) {
      throw new Error('Mobile number is required');
    }
  
    const otp = Math.floor(100000 + Math.random() * 900000);
  
    // Construct the request to Fast2SMS API
    const response = await axios.get('https://www.fast2sms.com/dev/bulkV2', {
      params: {
        authorization: '',
        variables_values: otp.toString(),
        route: 'otp',
        numbers: mobileNumber // Use the provided mobile number
      },
      headers: {
        'cache-control': 'no-cache'
      }
    });
  
    // Save the OTP to the user
    user.phoneNumber = mobileNumber;
    user.otp = otp;
    await user.save();
    console.log('OTP sent successfully:', response.data);
    return response;
  }

  Role.countDocuments()
    .then((count) => {
      if (count === 0) {
        new Role({
          name: "user"
        }).save()
          .then(() => console.log("added 'user' to roles collection"))
          .catch((err) => console.log("error", err));

        new Role({
          name: "moderator"
        }).save()
          .then(() => console.log("added 'moderator' to roles collection"))
          .catch((err) => console.log("error", err));

        new Role({
          name: "admin"
        }).save()
          .then(() => console.log("added 'admin' to roles collection"))
          .catch((err) => console.log("error", err));
      }
    })
    .catch((err) => {
      console.error("Error during countDocuments:", err);
    });


const PORT = 3000;
app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}.`);
});