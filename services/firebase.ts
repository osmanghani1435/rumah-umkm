import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAO0sEyH8EitID_QuncUxBBOQr6LsSsKEs",
  authDomain: "rumahumkm-bfba4.firebaseapp.com",
  projectId: "rumahumkm-bfba4",
  storageBucket: "rumahumkm-bfba4.firebasestorage.app",
  messagingSenderId: "923359767324",
  appId: "1:923359767324:web:edc0d483ab8a5c8be868d9",
  measurementId: "G-ESL2VTDS7K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, analytics, auth, db };