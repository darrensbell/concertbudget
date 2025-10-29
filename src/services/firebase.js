// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "concert-e249e.firebaseapp.com",
  projectId: "concert-e249e",
  storageBucket: "concert-e249e.appspot.com",
  messagingSenderId: "108305364843",
  appId: "1:108305364843:web:6022afa72688439499252c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

export { db };
