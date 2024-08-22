const express = require('express');
const router = express.Router();

const appointmentController = require('../controllers/appointment.controller');


module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin","http://localhost:3000","http://127.0.0.1:5501");

    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post('/book', appointmentController.bookAppointment);

  // View appointments by user ID
  app.get('/user/:userId', appointmentController.getUserAppointments);
  
  // View all appointments
  app.get('/all', appointmentController.getAllAppointments);

};
