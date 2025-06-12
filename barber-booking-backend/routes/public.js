// routes/public.js

const express = require("express");
const pool = require("../db");
const router = express.Router();

router.get("/barbers", async (req, res) => {
  try {
    const barbers = await pool.query(
      "SELECT id, name, email, phone FROM users WHERE role = $1",
      ["barber"]
    );

    res.json(barbers.rows);
  } catch (err) {
    console.error("Error fetching barbers:", err);
    res.status(500).json({ message: "Error fetching barbers" });
  }
});

// Get all services (for customers)
router.get("/services", async (req, res) => {
  try {
    const services = await pool.query("SELECT * FROM services ORDER BY id");
    res.json(services.rows);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to fetch services" });
  }
});

module.exports = router;
