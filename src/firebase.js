import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { firebase } from "firebase/compat/app";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCB70nskQEi47yOLjWqQdIhULJ6s2y06HU",
  authDomain: "equiptrack-frontend.firebaseapp.com",
  projectId: "equiptrack-frontend",
  storageBucket: "equiptrack-frontend.firebasestorage.app",
  messagingSenderId: "942560137152",
  appId: "1:942560137152:web:1e18cb8d34e7365e240225",
  measurementId: "G-QDW1GFY93N",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };
export default app;
