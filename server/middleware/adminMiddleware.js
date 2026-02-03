const User = require("../models/User");

const requireAdmin = async (req, res, next) => {
  try {
    const user = await User.findOne({ firebaseUID: req.user.uid });

    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required." });
    }

    next();
  } catch (error) {
    console.error("Admin middleware error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = requireAdmin;
