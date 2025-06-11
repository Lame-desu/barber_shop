const express = require("express");
const router = express.Router();

const {
  getBarberAppointments,
  CancelBarberAppointment,
  deleteCanceledAppointment,
} = require("../controllers/barberController");
router.get("/appointments", getBarberAppointments); // Get upcoming appointment
router.post("/appointments/:id/cancel", CancelBarberAppointment); // Cancel appointment
router.post("/appointments/:id/delete", deleteCanceledAppointment); // Delete canceled appointment

module.exports = router;
