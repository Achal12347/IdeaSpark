import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB-JGQYsQbkcUeKCfa-KsLC0ahrkTUfZ1c",
  authDomain: "ideaspark-348df.firebaseapp.com",
  projectId: "ideaspark-348df",
  storageBucket: "ideaspark-348df.firebasestorage.app",
  messagingSenderId: "628040014684",
  appId: "1:628040014684:web:18b8f1606c3f8d614d3f99"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
