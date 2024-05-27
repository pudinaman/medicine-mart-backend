const mongoose = require('mongoose');
const ObjectID = mongoose.Schema.Types.ObjectId

const appointmentSchema = new mongoose.Schema({
    userId : {
        type: ObjectID,
        required: true,
        ref: 'User'
    }, 
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    problems: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    area: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postCode: { type: String, required: true }
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;
