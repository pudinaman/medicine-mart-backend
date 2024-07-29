const About = require('../models/aboutmodel'); // Adjust the path as necessary

// Create a new About entry
exports.createAbout = async (req, res) => {
    try {
        const about = new About({
            about: req.body.about
        });
        const savedAbout = await about.save();
        res.status(201).json(savedAbout);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all About entries
exports.getAbout = async (req, res) => {
    try {
        const about = await About.find();
        res.status(200).json(about);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
