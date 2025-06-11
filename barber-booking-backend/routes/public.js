// routes/public.js

const express = require("express");
const { pool } = require("../db");
const router = express.Router();

router.get("/barbers", async (req, res) => {
  try {
    const barbers = await pool.query(
      "SELECT id, name, email, phone FROM users WHERE role = $1",
      ["barber"]
    );

    const barberData = await Promise.all(
      barbers.rows.map(async (barber) => {
        const services = await pool.query(
          "SELECT id, name, price FROM services WHERE barber_id = $1",
          [barber.id]
        );
        return { ...barber, services: services.rows };
      })
    );

    res.json(barberData);
  } catch (err) {
    console.error("Error fetching barbers:", err);
    res.status(500).json({ message: "Error fetching barbers" });
  }
});

module.exports = router;
