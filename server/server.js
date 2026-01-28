require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Routes
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const ideaRoutes = require("./routes/ideaRoutes");

// Create app FIRST
const app = express();

/* =========================
   Middleware
========================= */

// CORS (allow frontend + local dev)
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://idea-spark-olive.vercel.app",
    ],
  })
);

app.use(express.json());

/* =========================
   Routes
========================= */

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/ideas", ideaRoutes);

// Health check (IMPORTANT for Render debugging)
app.get("/", (req, res) => {
  res.send("IdeaSpark API is running 🚀");
});

/* =========================
   Database
========================= */

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Atlas connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

/* =========================
   Server
========================= */

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
