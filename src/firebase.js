// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "@firebase/firestore";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const analytics = getAnalytics(app);
export const firestore = getFirestore(app);
