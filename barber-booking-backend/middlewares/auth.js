const jwt = require("jsonwebtoken");
require("dotenv").config();

// Secret key from your .env or config file
const JWT_SECRET = process.env.JWT_SECRET; // Change this to your actual secret (or use process.env.JWT_SECRET)

// Middleware to verify token and attach user info to req.user
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1]; // Extract token

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Attach decoded user (id, email, role) to req.user
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = { verifyToken };
