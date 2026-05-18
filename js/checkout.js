import {
    db,
    addDoc,
    collection,
    getDocs,
    query,
    where
} from "./firebase.js";

document.addEventListener("DOMContentLoaded", () => {

    const detalleDiv = document.getElementById("detalle-items");
    const totalFinal = document.getElementById("total-final");
    const form = document.getElementById("formReserva");
    const spinner = document.getElementById("spinner");
    const mensajeReserva = document.getElementById("mensaje-reserva");

    const fechaInput = form.querySelector("input[type='date']");
    const selectHora = document.getElementById("hora");
    const submitButton = form.querySelector("button[type='submit']");

    /* ================= CARRITO ================= */
    const carritoDetalle = JSON.parse(localStorage.getItem("carritoDetalle")) || [];
    const totalCarrito = Number(localStorage.getItem("totalCarrito")) || 0;

    detalleDiv.innerHTML = "";

    carritoDetalle.forEach(item => {
        const div = document.createElement("div");
        div.innerHTML = `
            <strong>${item.nombre}</strong><br>
            
        `;
        detalleDiv.appendChild(div);
    });
/*Cantidad: ${item.cantidad} — $${item.precio}*/
    totalFinal.textContent = "$ " + totalCarrito.toLocaleString();

    /* ================= HORARIOS DISPONIBLES ================= */
    async function cargarHorariosDisponibles(fecha) {
        if (!fecha) return;

        selectHora.innerHTML = `<option value="">Cargando horarios...</option>`;

        try {
            // 1️⃣ Horarios habilitados por el admin
            const disponibilidadQ = query(
                collection(db, "disponibilidad"),
                where("fecha", "==", fecha)
            );
            const disponibilidadSnap = await getDocs(disponibilidadQ);

            if (disponibilidadSnap.empty) {
                selectHora.innerHTML = `<option value="">No hay horarios disponibles</option>`;
                return;
            }

            const horariosAdmin = disponibilidadSnap.docs[0].data().horarios || [];

            // 2️⃣ Horarios ya reservados
            const reservasQ = query(
                collection(db, "reservas"),
                where("fecha", "==", fecha)
            );
            const reservasSnap = await getDocs(reservasQ);

            const horariosOcupados = reservasSnap.docs
                .map(doc => doc.data().hora)
                .filter(Boolean);

            // 3️⃣ Mostrar solo los libres
            selectHora.innerHTML = `<option value="">-- Selecciona un horario --</option>`;

            horariosAdmin.forEach(hora => {
                if (!horariosOcupados.includes(hora)) {
                    const opt = document.createElement("option");
                    opt.value = hora;
                    opt.textContent = hora;
                    selectHora.appendChild(opt);
                }
            });

            if (selectHora.options.length === 1) {
                selectHora.innerHTML = `<option value="">No hay horarios disponibles</option>`;
            }

        } catch (error) {
            console.error("Error cargando horarios:", error);
            selectHora.innerHTML = `<option value="">Error al cargar horarios</option>`;
        }
    }

    fechaInput.addEventListener("change", () => {
        cargarHorariosDisponibles(fechaInput.value);
    });

    /* ================= SUBMIT ================= */
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const nombre = form.querySelector("input[type='text']").value;
        const email = form.querySelector("input[type='email']").value;
        const telefono = document.getElementById("telefono").value;
        const fecha = fechaInput.value;
        const hora = selectHora.value;
        const metodo = form.querySelector("select").value;
        const comentario = form.querySelector("textarea").value;

        if (!fecha || !hora) {
            alert("Seleccioná fecha y horario");
            return;
        }

        spinner.style.display = "block";
        submitButton.disabled = true;

        try {
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
                estado: "pendiente",
                fechaCreacion: new Date()
            });

            mensajeReserva.innerHTML = `
                <h5>¡Reserva enviada correctamente! ✅</h5>
                <p>Te contactaremos a la brevedad.</p>
                <button class="btn btn-success mt-2" id="btnAceptar">Aceptar</button>
            `;

            mensajeReserva.style.display = "block";
            form.style.display = "none";
            localStorage.clear();

            document.getElementById("btnAceptar").onclick = () => {
                window.location.href = "index.html";
            };

        } catch (error) {
            console.error(error);
            alert("Error al enviar la reserva");
        } finally {
            spinner.style.display = "none";
            submitButton.disabled = false;
        }
    });

});