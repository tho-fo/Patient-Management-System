import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getAnalytics, isSupported } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCJKeUHK-n9gXbm5dV2QPnBZWQmqLNY734",
  authDomain: "patient-management-portas.firebaseapp.com",
  projectId: "patient-management-portas",
  storageBucket: "patient-management-portas.firebasestorage.app",
  messagingSenderId: "989015117582",
  appId: "1:989015117582:web:f3a0c5e672af6a2f26115f",
  measurementId: "G-XSJ9L2EZ51"
};

export const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);

export const analytics = isSupported()
  .then((supported) => (supported ? getAnalytics(firebaseApp) : null))
  .catch(() => null);
