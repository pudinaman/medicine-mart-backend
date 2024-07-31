const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const admin = require('firebase-admin');
const Razorpay = require('razorpay');
const dbConfig = require('./app/config/db.config');
const serviceAccount = require('./wayumart-9e794-firebase-adminsdk-gx86d-425bd46890.json');
const db = require('./app/models');
const User = require('./app/models/user.model');
const Role = db.role;
const Product = db.product;
const {slackLogger, webHookURL} = require('./app/middlewares/webHook');

dotenv.config();

// Initialize Razorpay
const instance = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_API_SECRET
});

// Initialize Firebase admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


  
   db.mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(async (err) => {
    console.log('Error connecting to MongoDB', err)
    await slackLogger("Error connecting to MongoDB", err.message, err, null, webHookURL);
  });

// Handle uncaught exceptions
process.on('uncaughtException', async err => {
  console.log('Caught uncaught exception: ', err);
  await slackLogger("Uncaught Exception", err.message, err, null, webHookURL);
  process.exit(1);
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: "Welcome to Wayumart Backend" });
});

// Search endpoint
app.get('/search', async (req, res, next) => {
  try {
    const query = req.query.query;
    if (!query) {
      return res.status(400).json({ message: 'Query parameter is required' });
    }
    const products = await Product.find({ product_name: new RegExp(query, 'i') });
    res.status(200).json(products);
  } catch (error) {
    next(error); // Pass the error to the next middleware
  }
});

// Routes
require('./app/routes/auth.routes')(app);
require('./app/routes/order.routes')(app);
require('./app/routes/product.routes')(app);
require('./app/routes/cart.routes')(app);
require('./app/routes/billing.routes')(app);
require('./app/routes/firebaseAuth.routes')(app);
require('./app/routes/coupon.routes')(app);
require('./app/routes/checkout.routes')(app);
require('./app/routes/appointment.routes')(app);
const about = require("./app/routes/about.routes");
app.use('/api', about);

// Initialize roles if none exist
Role.countDocuments()
  .then((count) => {
    if (count === 0) {
      Promise.all([
        new Role({ name: "user" }).save(),
        new Role({ name: "moderator" }).save(),
        new Role({ name: "admin" }).save()
      ]).then(() => {
        console.log("Roles initialized");
      }).catch((err) => {
        console.error("Error initializing roles:", err);
        // Send error initializing roles to Slack
        slackLogger(err, null, null, () => {});
      });
    }
  })
  .catch((err) => {
    console.error("Error during countDocuments:", err);
    // Send error during countDocuments to Slack
    slackLogger(err, null, null, () => {});
  });

// Error handling middleware
app.use(slackLogger);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ message: 'Internal Server Error', error: err.message });
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
