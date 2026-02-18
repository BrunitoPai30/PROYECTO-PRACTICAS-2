import {
    db,
    getDocs,
    collection,
    addDoc,
    deleteDoc,
    doc,
    updateDoc,
    query,
    where
} from "./firebase.js";

document.addEventListener("DOMContentLoaded", () => {

    /* ================= ELEMENTOS ================= */
    const listaPedidos = document.getElementById("listaPedidos");
    const listaDisponibilidad = document.getElementById("listaDisponibilidad");

    const btnFiltrar = document.getElementById("btnFiltrar");
    const btnMostrarTodos = document.getElementById("btnMostrarTodos");
    const fechaFiltro = document.getElementById("fechaFiltro");
    const estadoFiltro = document.getElementById("estadoFiltro");
    const btnLogout = document.getElementById("btnLogout");

    const fechaDisponibilidad = document.getElementById("fechaDisponibilidad");
    const horariosSelect = document.getElementById("horariosDisponibles");
    const btnGuardarDisponibilidad = document.getElementById("btnGuardarDisponibilidad");

    /* =====================================================
       DISPONIBILIDAD – CREAR
    ===================================================== */
    btnGuardarDisponibilidad?.addEventListener("click", async () => {
        const fecha = fechaDisponibilidad.value;
        const horarios = Array.from(horariosSelect.selectedOptions).map(o => o.value);

        if (!fecha || horarios.length === 0) {
            alert("Seleccioná una fecha y al menos un horario");
            return;
        }

        try {
            const q = query(
                collection(db, "disponibilidad"),
                where("fecha", "==", fecha)
            );
            const snap = await getDocs(q);

            if (!snap.empty) {
                alert("⚠️ Ya existe disponibilidad para esa fecha");
                return;
            }

            await addDoc(collection(db, "disponibilidad"), {
                fecha,
                horarios
            });

            alert("Disponibilidad guardada ✔");
            fechaDisponibilidad.value = "";
            horariosSelect.selectedIndex = -1;

            cargarDisponibilidad();

        } catch (err) {
            console.error(err);
            alert("Error al guardar disponibilidad");
        }
    });

    /* =====================================================
       DISPONIBILIDAD – LISTAR / BORRAR
    ===================================================== */
    async function cargarDisponibilidad() {
        if (!listaDisponibilidad) return;

        listaDisponibilidad.innerHTML = "";

        const snap = await getDocs(collection(db, "disponibilidad"));

        if (snap.empty) {
            listaDisponibilidad.innerHTML = `<p class="text-muted">No hay disponibilidad cargada</p>`;
            return;
        }

        snap.forEach(docItem => {
            const data = docItem.data();

            const div = document.createElement("div");
            div.className = "border rounded p-3";

            div.innerHTML = `
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <strong>${data.fecha}</strong>
                    <button class="btn btn-sm btn-danger btn-borrar-fecha">
                        🗑 Borrar fecha
                    </button>
                </div>

                <div class="d-flex flex-wrap gap-2">
                    ${data.horarios.map(h => `
                        <button class="btn btn-outline-secondary btn-sm btn-borrar-hora" data-hora="${h}">
                            ${h} ❌
                        </button>
                    `).join("")}
                </div>
            `;

            div.querySelector(".btn-borrar-fecha").addEventListener("click", async () => {
                if (!confirm("¿Eliminar toda la disponibilidad de este día?")) return;
                await deleteDoc(doc(db, "disponibilidad", docItem.id));
                cargarDisponibilidad();
            });

            div.querySelectorAll(".btn-borrar-hora").forEach(btn => {
                btn.addEventListener("click", async () => {
                    const hora = btn.dataset.hora;
                    const nuevosHorarios = data.horarios.filter(h => h !== hora);

                    if (nuevosHorarios.length === 0) {
                        await deleteDoc(doc(db, "disponibilidad", docItem.id));
                    } else {
                        await updateDoc(doc(db, "disponibilidad", docItem.id), {
                            horarios: nuevosHorarios
                        });
                    }

                    cargarDisponibilidad();
                });
            });

            listaDisponibilidad.appendChild(div);
        });
    }

    /* =====================================================
       RESERVAS
    ===================================================== */
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

                if (estadoActual === "completada") return;
                if (fechaFiltro.value && data.fecha !== fechaFiltro.value) return;
                if (estadoFiltro.value && estadoActual !== estadoFiltro.value) return;

                const pedidoDiv = document.createElement("div");
                pedidoDiv.classList.add("pedido");

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
                                ✔ Completado
                            </button>

                            <button class="btn btn-danger btn-sm btn-eliminar">
                                🗑 Eliminar
                            </button>
                        </div>
                    </div>

                    <p><strong>Fecha:</strong> ${data.fecha} | <strong>Horario:</strong> ${data.hora || "-"}</p>
                    <p><strong>Total:</strong> $${Number(data.total || 0).toLocaleString()}</p>

                    <p class="mb-1"><strong>Detalle del pedido:</strong></p>
                    <ul class="mb-0">
                        ${(data.carrito || []).map(item =>
                            `<li>${item.nombre}</li>`
                        ).join("")}
                    </ul>
                `;

                listaPedidos.appendChild(pedidoDiv);

                const selectEstado = pedidoDiv.querySelector(".estado");
                selectEstado.value = estadoActual;

                selectEstado.addEventListener("change", async () => {
                    await updateDoc(doc(db, "reservas", docItem.id), {
                        estado: selectEstado.value
                    });
                });

                pedidoDiv.querySelector(".btn-completar").addEventListener("click", async () => {
                    await updateDoc(doc(db, "reservas", docItem.id), { estado: "completada" });
                    cargarReservas();
                });

                pedidoDiv.querySelector(".btn-eliminar").addEventListener("click", async () => {
                    await deleteDoc(doc(db, "reservas", docItem.id));
                    cargarReservas();
                });
            });

        } catch (err) {
            console.error(err);
        }
    }

    /* ================= INIT ================= */
    cargarReservas();
    cargarDisponibilidad();

    btnFiltrar.addEventListener("click", cargarReservas);
    btnMostrarTodos.addEventListener("click", () => {
        fechaFiltro.value = "";
        estadoFiltro.value = "";
        cargarReservas();
    });

    btnLogout?.addEventListener("click", () => {
        window.location.href = "index.html";
    });
});