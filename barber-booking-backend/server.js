// server.js
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/admin");
const customerRoutes = require("./routes/customer");
const barberRoutes = require("./routes/barberRoutes");
const publicRoutes = require("./routes/public");
const { verifyToken } = require("./middlewares/auth");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/admin", verifyToken, adminRoutes);
app.use("/api/customers", verifyToken, customerRoutes);
app.use("/api/barber", verifyToken, barberRoutes);
app.use("/api", publicRoutes);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
