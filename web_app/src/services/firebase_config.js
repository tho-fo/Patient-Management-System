import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getAnalytics, isSupported } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

// Load Firebase config from environment variables (for Vercel/production)
// or use default values (for local development)
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCJKeUHK-n9gXbm5dV2QPnBZWQmqLNY734",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "patient-management-portas.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "patient-management-portas",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "patient-management-portas.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "989015117582",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:989015117582:web:f3a0c5e672af6a2f26115f",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-XSJ9L2EZ51"
};

export const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);

export const analytics = isSupported()
  .then((supported) => (supported ? getAnalytics(firebaseApp) : null))
  .catch(() => null);
