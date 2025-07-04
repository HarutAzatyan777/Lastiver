import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDTuJFVKu_3T1HnMngi7DPPiBCiIldHR90",
  authDomain: "lastiver-4f3aa.firebaseapp.com",
  projectId: "lastiver-4f3aa",
  storageBucket: "lastiver-4f3aa.firebasestorage.app",
  messagingSenderId: "15618007253",
  appId: "1:15618007253:web:7c9bce1fee4c20f8cf025c"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
