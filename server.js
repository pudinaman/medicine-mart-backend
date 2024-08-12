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
const { remoteConfig } = require('./firebase'); // Import remoteConfig
const { slackLogger, webHookURL } = require('./app/middlewares/webHook');

dotenv.config();


const fetchRemoteConfig = async () => {
  try {
    const template = await remoteConfig.getTemplate();
    const portValue = template.parameters.PORT ? template.parameters.PORT.defaultValue.value : '4000';
    const portNumber = parseInt(portValue, 10); // Convert to number
    if (isNaN(portNumber)) {
      throw new Error('Invalid PORT value');
    }

    const mongodbUri = template.parameters.MONGODB_URI ? template.parameters.MONGODB_URI.defaultValue.value : '';
    if (!mongodbUri) {
      throw new Error('MongoDB URI is missing from Remote Config');
    }

    return { portNumber, mongodbUri };
  } catch (error) {
    console.error('Error fetching remote config:', error);
    await slackLogger("Error starting server", error.message, error, null, webHookURL);
    return { portNumber: 4000, mongodbUri: '' }; // Fallback values
  }
};



// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Start server
const startServer = async () => {
  try {
    const { portNumber, mongodbUri } = await fetchRemoteConfig();

    if (isNaN(portNumber)) {
      throw new Error('PORT is not a valid number');
    }
    if (!mongodbUri) {
      throw new Error('MongoDB URI is not a valid string');
    }

    // Connect to MongoDB
    await mongoose.connect(mongodbUri);
    console.log('Connected to MongoDB');

    // Start Express server
    app.listen(portNumber, () => {
      console.log(`Server is running on port ${portNumber}.`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    await slackLogger("Error starting server", error.message, error, null, webHookURL);
    process.exit(1);
  }
};

startServer();

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

// Error handling middleware
app.use(slackLogger);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ message: 'Internal Server Error', error: err.message });
});
