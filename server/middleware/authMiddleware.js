const admin = require("../config/firebaseAdmin");

module.exports = async function verifyFirebaseToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded; // contains uid
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};
