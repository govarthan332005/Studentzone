// Firebase Configuration - User App
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getDatabase, ref, onValue, get, child
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDAisnBAmG3qGyjA_lkzSDrWccNxyr2jMc",
  authDomain: "slice-investment.firebaseapp.com",
  databaseURL: "https://slice-investment-default-rtdb.firebaseio.com",
  projectId: "slice-investment",
  storageBucket: "slice-investment.firebasestorage.app",
  messagingSenderId: "263752083276",
  appId: "1:263752083276:web:03b4f22872ccec55c3d1e9",
  measurementId: "G-4J9033N8WS"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { app, db, ref, onValue, get, child };
