import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAs4uv8r9YQkxXkFWINbHC5tuT9qNDvN1E", // <-- Paste your key here
  authDomain: "rossms-digital-hall-pass.firebaseapp.com", // <-- Paste your domain here
  projectId: "rossms-digital-hall-pass", // This should be correct
  storageBucket: "rossms-digital-hall-pass.firebasestorage.app", // <-- Paste your bucket here
  messagingSenderId: "872475014885", // <-- Paste your ID here
  appId: "1:872475014885:web:d376a1e3544efb1274860c" // <-- Paste your App ID here
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and EXPORT Firebase services (This is the corrected part)
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);