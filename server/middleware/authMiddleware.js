const admin = require("firebase-admin");
const serviceAccount = require("../firebase-service-account.json"); // your Firebase service account

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const verifyFirebaseToken = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ error: "No token" });

    const token = header.split(" ")[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: "Unauthorized" });
  }
};

module.exports = { verifyFirebaseToken };
