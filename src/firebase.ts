import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCkGv4yUi_yTnHj8jn5ihElGCs3SznFHAE",
  authDomain: "ckcater-3852d.firebaseapp.com",
  projectId: "ckcater-3852d",
  storageBucket: "ckcater-3852d.firebasestorage.app",
  messagingSenderId: "233568603154",
  appId: "1:233568603154:web:5bbd7a810842853a5e5ccb",
  measurementId: "G-TEX1XF1DL3"
};

const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);