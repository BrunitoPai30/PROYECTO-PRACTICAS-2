import {
    collection,
    getDocs,
    query,
    where
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import { db } from "./firebase.js";

const lista = document.getElementById("listaCompletados");
const totalRecaudadoDiv = document.getElementById("totalRecaudado");
const btnMostrarTodos = document.getElementById("btnMostrarTodos");
const btnFiltrar = document.getElementById("btnFiltrar");
const fechaFiltro = document.getElementById("fechaFiltro");
const mesFiltro = document.getElementById("mesFiltro");

let totalRecaudado = 0;

// ==============================
// CARGAR COMPLETADOS
// ==============================
async function cargarCompletados() {

    lista.innerHTML = "";
    totalRecaudado = 0;

    const q = query(
        collection(db, "reservas"),
        where("estado", "==", "completada")
    );

    const snapshot = await getDocs(q);

    snapshot.forEach(docSnap => {
        const data = docSnap.data();

        const fechaReserva = data.fecha; // formato YYYY-MM-DD
        const mesReserva = fechaReserva?.slice(0, 7); // YYYY-MM

        // 🔹 PRIORIDAD: MES
        if (mesFiltro.value && mesReserva !== mesFiltro.value) return;

        // 🔹 SI NO HAY MES, FILTRA POR FECHA
        if (!mesFiltro.value && fechaFiltro.value && fechaReserva !== fechaFiltro.value) return;

        let totalPedido = Number(data.total || 0);
        totalRecaudado += totalPedido;

        const card = document.createElement("div");
        card.className = "card shadow-sm";

        card.innerHTML = `
            <div class="card-body">
                <h6 class="fw-bold">
                    ${data.nombre} (${data.email}) | 📱 ${data.telefono || "-"}
                </h6>

                <p class="mb-1">
                    📅 ${data.fecha} — ⏰ ${data.hora}
                </p>

                <ul>
                    ${(data.carrito || []).map(p =>
                        `<li>${p.nombre} - $${p.precio}</li>`
                    ).join("")}
                </ul>

                <p class="fw-bold text-success mb-0">
                    Total: $${totalPedido.toLocaleString()}
                </p>
            </div>
        `;

        lista.appendChild(card);
    });

    totalRecaudadoDiv.innerText =
        `Total recaudado: $${totalRecaudado.toLocaleString()}`;
}

// ==============================
// EVENTOS
// ==============================
btnFiltrar.addEventListener("click", cargarCompletados);

btnMostrarTodos.addEventListener("click", () => {
    fechaFiltro.value = "";
    mesFiltro.value = "";
    cargarCompletados();
});

// ==============================
// INIT
// ==============================
cargarCompletados();