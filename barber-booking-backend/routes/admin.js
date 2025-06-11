// routes/admin.js

const express = require("express");
const bcrypt = require("bcrypt");
const pool = require("../db/index.js");
const router = express.Router();
console.log(pool);
// Middleware: only admin can add
const verifyAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({ message: "Access denied. Admin only." });
  }
};

router.post("/barbers", verifyAdmin, async (req, res) => {
  try {
    const { name, email, password, phone, services, price } = req.body;
    console.log(services);
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (name, email, password, phone, role) VALUES ($1, $2, $3, $4, $5) RETURNING id",
      [name, email, hashedPassword, phone, "barber"]
    );
    const barberId = result.rows[0].id;
    console.log(result);

    // Insert services (if any)
    if (services) {
      await pool.query(
        "INSERT INTO services (id, name, price) VALUES ($1, $2, $3)",
        [barberId, services, price]
      );
    }

    res.status(201).json({ message: "Barber added successfully" });
  } catch (err) {
    console.error("Error adding barber:", err);
    res.status(500).json({ message: "Error adding barber" });
  }
});

// Get all barbers with specialities
router.get("/barbers", async (req, res) => {
  try {
    const barbers = await pool.query(
      `SELECT u.id, u.name, u.phone, u.email,
            json_agg(s.name) AS services
            FROM users u
            LEFT JOIN services s ON u.id = s.id
            WHERE u.role = 'barber'
            GROUP BY u.id`
    );

    res.json(barbers.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete barber
router.delete("/barbers/:id", async (req, res) => {
  const barberId = req.params.id;

  try {
    // Delete specialities
    await pool.query("DELETE FROM services WHERE id = $1", [barberId]);

    // Delete user
    await pool.query("DELETE FROM users WHERE id = $1 AND role = $2", [
      barberId,
      "barber",
    ]);

    res.json({ message: "Barber deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/admin/barber/:id
router.get("/barber/:id", verifyAdmin, async (req, res) => {
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

    const appointments = await pool.query(
      `SELECT a.id, u.name as customer, a.appointment_time, a.status
             FROM appointments a
             JOIN users u ON a.customer_id = u.id
             WHERE a.barber_id = $1`,
      [barberId]
    );

    const feedbacks = await pool.query(
      `SELECT f.id, u.name as customer, f.rating, f.comment
             FROM feedbacks f
             JOIN users u ON f.customer_id = u.id
             WHERE f.barber_id = $1`,
      [barberId]
    );

    const services = await pool.query(
      `SELECT id, name, price
       FROM services
       WHERE id = $1`,
      [barberId]
    );

    res.json({
      barber: barber.rows[0],
      appointments: appointments.rows,
      feedbacks: feedbacks.rows,
      services: services.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
