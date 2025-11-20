document.addEventListener("DOMContentLoaded", () => {

  const buttons = document.querySelectorAll(".btn-servicio");
  const cartMenu = document.getElementById("cart-menu");
  const cartCount = document.getElementById("cart-count");

  let carrito = [];

  // Agregar al carrito
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".cat-item"); // CAMBIADO
      const nombre = item.querySelector("h4").textContent; // CAMBIADO
      const precio = item.querySelector(".cat-precio").textContent; // CAMBIADO

      carrito.push({ nombre, precio });
      actualizarCarrito();
    });
  });

  // Actualizar carrito
  function actualizarCarrito() {
    cartMenu.innerHTML = "";

    if (carrito.length === 0) {
      cartMenu.innerHTML = `<li class="dropdown-item text-center text-muted">El carrito está vacío</li>`;
      cartCount.textContent = "0";
      return;
    }

    carrito.forEach((item, index) => {
      const li = document.createElement("li");
      li.classList.add("dropdown-item");
      li.innerHTML = `
        ${item.nombre} - <strong>${item.precio}</strong>
        <button class="btn-remove" data-index="${index}">✖</button>
      `;
      cartMenu.appendChild(li);
    });

    // Botón vaciar
    const vaciar = document.createElement("li");
    vaciar.classList.add("dropdown-item", "text-center");
    vaciar.innerHTML = `<button class="btn btn-sm btn-danger" id="vaciarCarrito">Vaciar carrito</button>`;
    cartMenu.appendChild(vaciar);

    cartCount.textContent = carrito.length;

    // Botones borrar uno
    document.querySelectorAll(".btn-remove").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const i = e.target.dataset.index;
        carrito.splice(i, 1);
        actualizarCarrito();
      });
    });

    // Vaciar todo
    document.getElementById("vaciarCarrito").addEventListener("click", () => {
      carrito = [];
      actualizarCarrito();
    });
  }

});

