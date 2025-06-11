// controllers/customerController.js
const pool = require("../db");
const jwt = require("jsonwebtoken");
exports.getCustomerAppointment = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      `SELECT a.id, a.appointment_time, a.status,
                    u.name as barber_name,
                    s.name as service_name,
                    s.price
             FROM appointments a
             JOIN users u ON a.barber_id = u.id
             JOIN services s ON a.service_id = s.id
             WHERE a.customer_id = $1
             AND a.status IN ('pending', 'confirmed')
             ORDER BY a.appointment_time ASC
             `,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.json({ hasAppointment: false });
    }
    console.log(result.rows);
    res.json({
      hasAppointment: true,
      appointment: result.rows,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
};

exports.cancelAppointment = async (req, res) => {
  const userId = req.user.id;
  const appointmentId = req.params.id;

  try {
    const appointment = await pool.query(
      `SELECT * FROM appointments WHERE id = $1 AND customer_id = $2`,
      [appointmentId, userId]
    );

    if (appointment.rows.length === 0) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    const appointmentTime = new Date(appointment.rows[0].appointment_time);
    const now = new Date();
    const hoursDiff = (appointmentTime - now) / (1000 * 60 * 60);

    if (hoursDiff < 12) {
      return res
        .status(400)
        .json({ error: "Cannot cancel within 12 hours of appointment" });
    }

    await pool.query(
      `UPDATE appointments SET status = 'cancelled' WHERE id = $1`,
      [appointmentId]
    );

    res.json({ message: "Appointment cancelled successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getBarbers = async (req, res) => {
  try {
    const barbers = await pool.query(`
            SELECT u.id AS barber_id, u.name AS barber_name, s.id AS service_id, s.name AS service_name, s.price
            FROM users u
            JOIN services s ON s.id = u.id
            WHERE u.role = 'barber'
        `);
    console.log(barbers.rows);
    res.json(barbers.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.bookAppointment = async (req, res) => {
  const { barber_id, service_id, appointment_time } = req.body;
  const customer_id = req.user.id;
  console.log(customer_id, barber_id, service_id, appointment_time);

  try {
    await pool.query(
      `INSERT INTO appointments (customer_id, barber_id, service_id, appointment_time)
             VALUES ($1, $2, $3, $4)`,
      [customer_id, barber_id, service_id, appointment_time]
    );

    res.json({ message: "Appointment booked successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
