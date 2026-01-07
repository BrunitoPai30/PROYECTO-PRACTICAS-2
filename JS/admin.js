import {
    db,
    getDocs,
    collection,
    deleteDoc,
    doc,
    updateDoc
} from "./firebase.js";

document.addEventListener("DOMContentLoaded", () => {

    const listaPedidos = document.getElementById("listaPedidos");
    const btnFiltrar = document.getElementById("btnFiltrar");
    const btnMostrarTodos = document.getElementById("btnMostrarTodos");
    const fechaFiltro = document.getElementById("fechaFiltro");
    const estadoFiltro = document.getElementById("estadoFiltro");
    const btnLogout = document.getElementById("btnLogout");

    // ================= CARGAR RESERVAS =================
    async function cargarReservas() {
        try {
            listaPedidos.innerHTML = "";

            const snapshot = await getDocs(collection(db, "reservas"));

            if (snapshot.empty) {
                listaPedidos.innerHTML = `<p>No hay reservas.</p>`;
                return;
            }

            snapshot.forEach(docItem => {
                const data = docItem.data();
                const estadoActual = (data.estado || "pendiente").toLowerCase();

                // 🔹 FILTRO FECHA
                if (fechaFiltro.value && data.fecha !== fechaFiltro.value) return;

                // 🔹 FILTRO ESTADO
                if (estadoFiltro.value && estadoActual !== estadoFiltro.value) return;

                const pedidoDiv = document.createElement("div");
                pedidoDiv.classList.add("pedido");
                pedidoDiv.dataset.estado = estadoActual;

                pedidoDiv.innerHTML = `
                    <div class="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
                        <h5 class="mb-0">
                            ${data.nombre} (${data.email}) | 📱 ${data.telefono || "-"}
                        </h5>

                        <div class="d-flex gap-2">
                            <select class="estado form-select form-select-sm">
                                <option value="pendiente">Pendiente</option>
                                <option value="confirmada">Confirmada</option>
                            </select>

                            <button class="btn btn-success btn-sm btn-completar">
                                Completado
                            </button>

                            <button class="btn btn-danger btn-sm btn-eliminar">
                                Eliminar
                            </button>
                        </div>
                    </div>

                    <p><strong>Fecha:</strong> ${data.fecha} | <strong>Horario:</strong> ${data.hora || "-"}</p>
                    <p><strong>Total:</strong> $${Number(data.total || 0).toLocaleString()}</p>

                    <p class="mb-1"><strong>Carrito:</strong></p>
                    <ul>
                        ${(data.carrito || []).map(item =>
                            `<li>${item.nombre} x ${item.cantidad} - $${item.precio}</li>`
                        ).join("")}
                    </ul>
                `;

                listaPedidos.appendChild(pedidoDiv);

                // ===== SELECT ESTADO (solo pendiente / confirmada) =====
                const selectEstado = pedidoDiv.querySelector(".estado");
                selectEstado.value = estadoActual === "completada" ? "confirmada" : estadoActual;

                selectEstado.addEventListener("change", async () => {
                    const nuevoEstado = selectEstado.value;
                    pedidoDiv.dataset.estado = nuevoEstado;

                    await updateDoc(doc(db, "reservas", docItem.id), {
                        estado: nuevoEstado
                    });
                });

                // ===== BOTÓN COMPLETADO =====
                pedidoDiv.querySelector(".btn-completar").addEventListener("click", async () => {
                    if (!confirm("¿Marcar esta reserva como COMPLETADA?")) return;

                    await updateDoc(doc(db, "reservas", docItem.id), {
                        estado: "completada"
                    });

                    pedidoDiv.dataset.estado = "completada";

                    // opcional: refrescar lista
                    cargarReservas();
                });

                // ===== ELIMINAR =====
                pedidoDiv.querySelector(".btn-eliminar").addEventListener("click", async () => {
                    if (!confirm("¿Eliminar esta reserva?")) return;
                    await deleteDoc(doc(db, "reservas", docItem.id));
                    cargarReservas();
                });
            });

        } catch (error) {
            console.error(error);
            listaPedidos.innerHTML = `<p style="color:red;">Error al cargar reservas.</p>`;
        }
    }

    // ================= EVENTOS =================
    btnFiltrar.addEventListener("click", cargarReservas);

    btnMostrarTodos.addEventListener("click", () => {
        fechaFiltro.value = "";
        estadoFiltro.value = "";
        cargarReservas();
    });

    btnLogout?.addEventListener("click", () => {
        window.location.href = "index.html";
    });

    cargarReservas();
});