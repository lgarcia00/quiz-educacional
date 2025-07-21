// src/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCKq215U7ACX8fjja6yqt7FEke9R0mMdIY",
  authDomain: "quiz-app-enf.firebaseapp.com",
  projectId: "quiz-app-enf",
  storageBucket: "quiz-app-enf.appspot.com", // corrigido: era firebasestorage.app
  messagingSenderId: "31500491879",
  appId: "1:31500491879:web:611cd59fa6670d5bf948c2"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
