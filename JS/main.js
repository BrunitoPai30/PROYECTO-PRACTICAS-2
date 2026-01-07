document.addEventListener("DOMContentLoaded", () => {

  // ---------------------------
  // ELEMENTOS DEL NAVBAR
  // ---------------------------
  const cartMenu = document.getElementById("cart-menu");
  const cartCount = document.getElementById("cart-count");

  // Carrito desde localStorage
  let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

  // ---------------------------
  // FUNCIONES
  // ---------------------------

  // Convierte "$7.000" en 7000
  function parsePrecio(text) {
    if (!text) return 0;
    const cleaned = String(text)
      .replace(/[^0-9.,]/g, "")
      .replace(/\./g, "")
      .replace(/,/g, "");
    const num = Number(cleaned);
    return isNaN(num) ? 0 : num;
  }

  // Guarda carrito + total en localStorage
  function guardarCarrito() {
    localStorage.setItem("carrito", JSON.stringify(carrito));
    
    const total = carrito.reduce((sum, item) => {
      return sum + (Number(item.precio) || 0);
    }, 0);

    localStorage.setItem("montoTotal", total);
  }

  // Actualiza UI del dropdown del carrito
  function actualizarCarrito() {
    cartMenu.innerHTML = "";

    if (carrito.length === 0) {
      cartMenu.innerHTML = `
        <li class="dropdown-item text-center text-muted">
          El carrito está vacío
        </li>`;
      cartCount.textContent = "0";
      return;
    }

    carrito.forEach((item, index) => {
      const li = document.createElement("li");
      li.className =
        "dropdown-item d-flex justify-content-between align-items-center";
      li.innerHTML = `
        <div>
          <div class="small text-primary">${item.categoria || ""}</div>
          <strong>${item.nombre}</strong>
          <div class="text-muted small">${item.subtexto || ""}</div>
        </div>
        <div style="text-align:right;">
          <div><strong>$${item.precio}</strong></div>
          <button class="btn-remove btn btn-sm btn-link text-danger" data-index="${index}" style="padding:0;line-height:1;">✖</button>
        </div>
      `;
      cartMenu.appendChild(li);
    });

    // Botón vaciar
    const vaciar = document.createElement("li");
    vaciar.className = "dropdown-item text-center";
    vaciar.innerHTML = `
      <button class="btn btn-sm btn-danger" id="vaciarCarrito">Vaciar carrito</button>`;
    cartMenu.appendChild(vaciar);

    // Botón finalizar compra
    const finalizar = document.createElement("li");
    finalizar.className = "dropdown-item text-center";
    finalizar.innerHTML = `
      <button id="btn-finalizar-compra" class="btn btn-sm btn-primary w-100">
        Finalizar compra
      </button>`;
    cartMenu.appendChild(finalizar);

    cartCount.textContent = carrito.length;

    // Eliminar elemento
    document.querySelectorAll(".btn-remove").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const index = e.currentTarget.dataset.index;
        carrito.splice(index, 1);
        guardarCarrito();
        actualizarCarrito();
      });
    });

    // Vaciar todo
    const vaciarBtn = document.getElementById("vaciarCarrito");
    if (vaciarBtn) {
      vaciarBtn.addEventListener("click", () => {
        carrito = [];
        guardarCarrito();
        actualizarCarrito();
      });
    }

    // FINALIZAR COMPRA (🔴 ACÁ ESTÁ CHECKOUT.HTML)
    const finBtn = document.getElementById("btn-finalizar-compra");
    if (finBtn) {
      finBtn.addEventListener("click", () => {
        localStorage.setItem("carritoDetalle", JSON.stringify(carrito));

        const total = carrito.reduce((acc, it) => acc + (Number(it.precio) || 0), 0);
        localStorage.setItem("totalCarrito", String(total));

        window.location.href = "checkout.html";
      });
    }
  }

  // Lee datos desde el botón clickeado
  function leerItemDesdeBtn(btn) {
    const card = btn.closest(".cat-item") || btn.closest(".card") || btn.closest("div");

    let nombre = "";
    let precio = 0;
    let categoria = "";
    let subtexto = "";

    if (card) {
      const h4 = card.querySelector("h4");
      const ct = card.querySelector(".card-title");
      const strong = card.querySelector("strong");

      nombre =
        (h4 && h4.textContent.trim()) ||
        (ct && ct.textContent.trim()) ||
        (strong && strong.textContent.trim()) ||
        "Servicio";

      const precioTexto =
        (card.querySelector(".cat-precio")?.textContent) ||
        (card.querySelector(".precio")?.textContent) ||
        btn.dataset.price ||
        "";

      precio = parsePrecio(precioTexto);

      // categoría
      const catBox = card.closest(".categoria-box");
      if (catBox) {
        categoria = catBox.querySelector(".categoria-titulo")?.textContent.trim() || "";
      }

      const desc = card.querySelector("p");
      subtexto = desc ? desc.textContent.trim() : "";
    }

    return { nombre, precio, categoria, subtexto };
  }

  // Handler para agregar item
  function handlerAgregar(e) {
    const btn = e.currentTarget;
    const info = leerItemDesdeBtn(btn);

    carrito.push({
      nombre: info.nombre,
      precio: info.precio,
      categoria: info.categoria,
      subtexto: info.subtexto,
    });

    guardarCarrito();
    actualizarCarrito();

    btn.classList.add("added-temp");
    setTimeout(() => btn.classList.remove("added-temp"), 300);
  }

  // Conectar botones
  function conectarBotones() {
    const botones = document.querySelectorAll(".btn-servicio, .add-to-cart");
    botones.forEach((btn) => {
      btn.removeEventListener("click", handlerAgregar);
      btn.addEventListener("click", handlerAgregar);
    });
  }

  // ---------------------------
  // INICIALIZACIÓN
  // ---------------------------
  conectarBotones();
  actualizarCarrito();
});
