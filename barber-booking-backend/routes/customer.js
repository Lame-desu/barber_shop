// // routes/customer.js

// const express = require("express");
// const { pool } = require("../db");
// const router = express.Router();

// // Middleware: only customer can book
// const verifyCustomer = (req, res, next) => {
//   if (req.user && req.user.role === "customer") {
//     next();
//   } else {
//     return res.status(403).json({ message: "Access denied. Customer only." });
//   }
// };

// router.post("/book", verifyCustomer, async (req, res) => {
//   try {
//     const { barberId, serviceId, appointmentDateTime } = req.body;
//     const customerId = req.user.id;

//     await pool.query(
//       "INSERT INTO appointments (customer_id, barber_id, service_id, appointment_datetime, status) VALUES ($1, $2, $3, $4, $5)",
//       [customerId, barberId, serviceId, appointmentDateTime, "pending"]
//     );

//     res
//       .status(201)
//       .json({ message: "Appointment booked and waiting for confirmation." });
//   } catch (err) {
//     console.error("Error booking appointment:", err);
//     res.status(500).json({ message: "Error booking appointment" });
//   }
// });

// module.exports = router;

// routes/customer.js
const express = require("express");
const router = express.Router();
const {
  getCustomerAppointment,
  cancelAppointment,
  getBarbers,
  bookAppointment,
} = require("../controllers/customerController");
router.get("/appointments", getCustomerAppointment); // Get upcoming appointment
router.post("/appointments/:id/cancel", cancelAppointment); // Cancel appointment
router.get("/barbers", getBarbers); // Get all barbers with services
router.post("/bookAppointment", bookAppointment);

module.exports = router;
