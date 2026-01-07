import { auth } from "./firebase.js";
import {
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const emailInput = document.getElementById("adminEmail");
const passInput = document.getElementById("adminPass");
const btnLogin = document.getElementById("btnLogin");
const msg = document.getElementById("loginMessage");

btnLogin.addEventListener("click", () => {
    const email = emailInput.value.trim();
    const pass = passInput.value.trim();

    if (!email || !pass) {
        msg.textContent = "Complete todos los campos.";
        msg.style.color = "orange";
        return;
    }

    signInWithEmailAndPassword(auth, email, pass)
        .then(() => {
            msg.textContent = "Acceso concedido. Redirigiendo...";
            msg.style.color = "lightgreen";

            setTimeout(() => {
                window.location.href = "admin.html";
            }, 1000);
        })
        .catch(() => {
            msg.textContent = "Credenciales incorrectas.";
            msg.style.color = "red";
        });
});