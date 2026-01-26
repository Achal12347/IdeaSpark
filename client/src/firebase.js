import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyB-JGQYsQbkcUeKCfa-KsLC0ahrkTUfZ1c",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "ideaspark-348df.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "ideaspark-348df",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "ideaspark-348df.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "628040014684",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:628040014684:web:18b8f1606c3f8d614d3f99"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Set persistence to local (async, but we don't await here as it's top-level)
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Firebase persistence error:", error);
});

export { auth };
