const express = require('express');
const router = express.Router();
const aboutController = require('../controllers/aboutController'); // Adjust the path as necessary

// Route to create a new About entry
router.post('/about', aboutController.createAbout);

// Route to get all About entries
router.get('/about/get', aboutController.getAbout);

module.exports = router;
