// routes/barber.js
const express = require("express");
const router = express.Router();
const pool = require("../db");
const { verifyToken, authorizeRoles } = require("../middleware/auth");

// Get all appointments for this barber
router.get(
  "/appointments",
  verifyToken,
  authorizeRoles("barber"),
  async (req, res) => {
    const barberId = req.user.id;
    try {
      const appointments = await pool.query(
        `SELECT a.id, u.name as customer, s.name as service, a.appointment_time, a.status 
             FROM appointments a
             JOIN users u ON a.customer_id = u.id
             JOIN services s ON a.service_id = s.id
             WHERE a.barber_id = $1
             ORDER BY a.appointment_time DESC`,
        [barberId]
      );
      res.json(appointments.rows);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch appointments" });
    }
  }
);

router.post(
  "/appointments/:id/cancel",
  verifyToken,
  authorizeRoles("barber"),
  async (req, res) => {
    const appointmentId = req.params.id;
    const { feedback } = req.body;
    const barberId = req.user.id;

    try {
      const result = await pool.query(
        `UPDATE appointments
             SET status = 'cancelled', barber_feedback = $1
             WHERE id = $2 AND barber_id = $3 RETURNING *`,
        [feedback, appointmentId, barberId]
      );
      if (result.rows.length === 0)
        return res.status(404).json({ error: "Appointment not found" });

      res.json({
        message: "Appointment cancelled with feedback",
        appointment: result.rows[0],
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to cancel appointment" });
    }
  }
);
