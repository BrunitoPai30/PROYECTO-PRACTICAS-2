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

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCebqisxgRogFh0kdA9B-zIMv4qww5uX50",
  authDomain: "blessed-wash.firebaseapp.com",
  projectId: "blessed-wash",
  storageBucket: "blessed-wash.firebasestorage.app",
  messagingSenderId: "497561923682",
  appId: "1:497561923682:web:5c2abd7437eef87837213b",
  measurementId: "G-9L12GRYSK4"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Exportar todas las funciones que se usan
export { addDoc, collection, getDocs, query, where, doc, updateDoc, deleteDoc };