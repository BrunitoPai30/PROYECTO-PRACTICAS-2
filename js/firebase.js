import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    query,
    where,
    doc,
    updateDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// ================= CONFIG =================
const firebaseConfig = {
    apiKey: "AIzaSyCebqisxgRogFh0kdA9B-zIMv4qww5uX50",
    authDomain: "blessed-wash.firebaseapp.com",
    projectId: "blessed-wash",
    storageBucket: "blessed-wash.firebasestorage.app",
    messagingSenderId: "497561923682",
    appId: "1:497561923682:web:5c2abd7437eef87837213b",
    measurementId: "G-9L12GRYSK4"
};

// ================= INIT =================
const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);

// ================= EXPORTS =================
export {
    db,
    auth,
    collection,
    addDoc,
    getDocs,
    query,
    where,
    doc,
    updateDoc,
    deleteDoc
};