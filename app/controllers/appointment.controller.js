const mongoose = require('mongoose');
const Appointment = require('../models/appointment.model');
const User = require('../models/user.model');

// Controller to book an appointment
exports.bookAppointment = async (req, res) => {
    try {
        const { userId, name, phone, email, problems, date, time, area, city, state, postCode } = req.body;

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Create new appointment
        const newAppointment = new Appointment({ userId, name, phone, email, problems, date, time, area, city, state, postCode });
        await newAppointment.save();

        // Add appointment ID to user's appointments array
        await User.findByIdAndUpdate(userId, {
            $push: { appointments: newAppointment._id }
        });

        res.status(201).json(newAppointment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Controller to get appointments by user ID
exports.getUserAppointments = async (req, res) => {
    try {
        const userId = req.params.userId;

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const appointments = await Appointment.find({ userId }).exec();
        res.status(200).json(appointments);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Controller to get all appointments
exports.getAllAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find().exec();
        res.status(200).json(appointments);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};