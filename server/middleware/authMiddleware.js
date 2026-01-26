const admin = require("../config/firebaseAdmin");

module.exports = async function verifyFirebaseToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    // 🔐 Check Authorization header
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    // 🔎 Verify Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Attach user info to request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: decodedToken.role || "user", // optional future use
    };

    next();
  } catch (err) {
    console.error("Firebase token verification failed:", err.message);

    return res.status(401).json({ error: "Invalid or expired token" });
  }
};
