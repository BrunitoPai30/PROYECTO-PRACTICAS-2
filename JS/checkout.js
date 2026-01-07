import { db, addDoc, collection, getDocs, query, where } from "./firebase.js";

document.addEventListener("DOMContentLoaded", () => {
    const detalleDiv = document.getElementById("detalle-items");
    const totalFinal = document.getElementById("total-final");
    const form = document.getElementById("formReserva");
    const spinner = document.getElementById("spinner");
    const submitButton = form.querySelector("button[type='submit']");
    const mensajeReserva = document.getElementById("mensaje-reserva");
    const fechaInput = form.querySelector("input[type='date']");
    const selectHora = document.getElementById("hora");

    const carritoDetalle = JSON.parse(localStorage.getItem("carritoDetalle")) || [];
    let totalCarrito = localStorage.getItem("totalCarrito");
    totalCarrito = totalCarrito ? Number(totalCarrito) : 0;

    // Mostrar carrito
    detalleDiv.innerHTML = "";
    carritoDetalle.forEach(item => {
        const fila = document.createElement("div");
        fila.classList.add("detalle-item");
        fila.innerHTML = `<strong>${item.nombre}</strong><br>Cantidad: ${item.cantidad} — $${item.precio}`;
        detalleDiv.appendChild(fila);
    });

    totalFinal.textContent = "$ " + totalCarrito.toLocaleString();

    function generarHorarios() {
        const horarios = [];
        for (let h = 9; h <= 17; h++) {
            horarios.push(`${h.toString().padStart(2, "0")}:00`);
            horarios.push(`${h.toString().padStart(2, "0")}:30`);
        }
        return horarios;
    }

    async function cargarHorariosDisponibles(fecha) {
        if (!fecha || !selectHora) return;
        const horarios = generarHorarios();

        try {
            const reservasRef = collection(db, "reservas");
            const q = query(reservasRef, where("fecha", "==", fecha));
            const snapshot = await getDocs(q);
            const horariosOcupados = snapshot.docs
                .map(doc => doc.data().hora)
                .filter(Boolean);

            selectHora.innerHTML = `<option value="">-- Elige un horario --</option>`;
            horarios.forEach(h => {
                if (!horariosOcupados.includes(h)) {
                    const option = document.createElement("option");
                    option.value = h;
                    option.textContent = h;
                    selectHora.appendChild(option);
                }
            });
        } catch (err) {
            console.error("Error cargando horarios:", err);
        }
    }

    if (fechaInput) {
        fechaInput.addEventListener("change", () => {
            cargarHorariosDisponibles(fechaInput.value);
        });

        if (fechaInput.value) {
            cargarHorariosDisponibles(fechaInput.value);
        }
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        spinner.style.display = "block";
        submitButton.disabled = true;

        const nombre = form.querySelector("input[type='text']").value;
        const email = form.querySelector("input[type='email']").value;
        const telefono = form.querySelector("#telefono").value;
        const fecha = fechaInput ? fechaInput.value : "";
        const hora = selectHora ? selectHora.value : "";
        const metodo = form.querySelector("select").value;
        const comentario = form.querySelector("textarea").value;

        if (carritoDetalle.length === 0) {
            alert("⚠️ Tu carrito está vacío. Agrega productos antes de confirmar.");
            spinner.style.display = "none";
            submitButton.disabled = false;
            return;
        }
        if (!fecha) {
            alert("⚠️ Debes seleccionar una fecha.");
            spinner.style.display = "none";
            submitButton.disabled = false;
            return;
        }
        if (!hora) {
            alert("⚠️ Debes seleccionar un horario disponible.");
            spinner.style.display = "none";
            submitButton.disabled = false;
            return;
        }

        try {
            const reservasRef = collection(db, "reservas");
            const qCheck = query(reservasRef, where("fecha", "==", fecha), where("hora", "==", hora));
            const snapshotCheck = await getDocs(qCheck);

            if (snapshotCheck.size > 0) {
                alert("⚠️ Este horario ya fue reservado, elige otro.");
                spinner.style.display = "none";
                submitButton.disabled = false;
                return;
            }

            await addDoc(collection(db, "reservas"), {
                nombre,
                email,
                telefono,
                fecha,
                hora,
                metodo,
                comentario,
                carrito: carritoDetalle,
                total: totalCarrito,
                fechaCreacion: new Date()
            });

            mensajeReserva.textContent = "✅ ¡Reserva enviada correctamente!";
            mensajeReserva.classList.remove("alert-danger");
            mensajeReserva.classList.add("alert-success");
            mensajeReserva.style.display = "block";

            localStorage.removeItem("carritoDetalle");
            localStorage.removeItem("totalCarrito");

            setTimeout(() => {
                window.location.href = "index.html";
            }, 2000);
        } catch (error) {
            console.error("❌ Error enviando reserva:", error);
            mensajeReserva.textContent = "❌ Hubo un error al enviar la reserva. Revisa la consola.";
            mensajeReserva.classList.remove("alert-success");
            mensajeReserva.classList.add("alert-danger");
            mensajeReserva.style.display = "block";
        } finally {
            spinner.style.display = "none";
            submitButton.disabled = false;
        }
    });
});