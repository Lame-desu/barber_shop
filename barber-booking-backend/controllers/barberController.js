// routes/barber.js
const pool = require("../db");

// Get all appointments for this barber
exports.getBarberAppointments = async (req, res) => {
  console.log("Fetching appointments for barber:", req.user.id);
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
};
// Cancel an appointment (Barber only)
exports.CancelBarberAppointment = async (req, res) => {
  const barberId = req.user.id;
  const appointmentId = req.params.id;

  try {
    // Check if the appointment belongs to this barber
    const check = await pool.query(
      "SELECT * FROM appointments WHERE id = $1 AND barber_id = $2",
      [appointmentId, barberId]
    );

    if (check.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Appointment not found or not authorized" });
    }

    // Update the status to 'cancelled'
    await pool.query("UPDATE appointments SET status = $1 WHERE id = $2", [
      "cancelled",
      appointmentId,
    ]);

    res.json({ message: "Appointment cancelled successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to cancel appointment" });
  }
};
// Get barber details by ID
exports.getBarberDetails = async (req, res) => {
  const barberId = req.params.id;

  try {
    const barber = await pool.query(
      `SELECT u.id, u.name, u.email, u.phone
             FROM users u
             WHERE u.id = $1 AND u.role = 'barber'`,
      [barberId]
    );

    if (barber.rows.length === 0) {
      return res.status(404).json({ message: "Barber not found" });
    }

    const services = await pool.query(
      `SELECT id, name, price FROM services WHERE barber_id = $1`,
      [barberId]
    );

    res.json({ ...barber.rows[0], services: services.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch barber details" });
  }
};

// Delete canceled appointment
exports.deleteCanceledAppointment = async (req, res) => {
  console.log("Deleting canceled appointment for barber:", req.user.id);
  const barberId = req.user.id;
  const appointmentId = req.params.id;
  console.log(barberId, appointmentId);
  try {
    // Check if the appointment belongs to this barber and is canceled
    const result = await pool.query(
      `SELECT * FROM appointments WHERE id = $1 AND barber_id = $2 AND status = 'cancelled'`,
      [appointmentId, barberId]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Appointment not found or not canceled" });
    }

    // Delete the appointment
    await pool.query(`DELETE FROM appointments WHERE id = $1`, [appointmentId]);

    res.json({ message: "Canceled appointment permanently deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete canceled appointment" });
  }
};
