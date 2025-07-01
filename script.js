// Esperar a que el documento esté listo
document.addEventListener("DOMContentLoaded", () => {
  // Obtener referencias al formulario, input y contenedor de tarjetas de "Por hacer"
  const form = document.getElementById("todo-form");
  const input = document.getElementById("todo-input");
  const cardsContainer = document.getElementById("todo-cards");

  // Evento para agregar nuevas tarjetas
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const taskText = input.value.trim();

    if (taskText !== "") {
      const card = createCard(taskText); // Crear tarjeta con función aparte
      cardsContainer.appendChild(card);
      input.value = "";
    }
  });

  // Obtener todos los contenedores de listas para drag & drop
  document.querySelectorAll(".cards").forEach((zone) => {
    // Permitir arrastrar sobre una zona
    zone.addEventListener("dragover", (e) => {
      e.preventDefault();
      zone.classList.add("drag-over"); // 👉 aquí se agregó esto (resalta la zona)
    });

    // Quitar el efecto visual al salir de la zona
    zone.addEventListener("dragleave", () => {
      zone.classList.remove("drag-over"); // 👉 aquí se agregó esto
    });

    // Al soltar la tarjeta en la zona
    zone.addEventListener("drop", (e) => {
      e.preventDefault();
      zone.classList.remove("drag-over"); // 👉 aquí se agregó esto
      if (window.draggedCard) {
        zone.appendChild(window.draggedCard); // 👉 aquí se agregó esto (mover tarjeta)
      }
    });
  });
});

// 👉 aquí se agregó esto: función para crear una tarjeta con botón eliminar y drag & drop
function createCard(taskText) {
  const card = document.createElement("div");
  card.className = "card";
  card.setAttribute("draggable", "true");

  // Texto de la tarjeta
  const text = document.createElement("span");
  text.textContent = taskText;

  // Botón de eliminar
  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "❌";
  deleteBtn.className = "delete-btn";
  deleteBtn.addEventListener("click", () => {
    card.remove(); // 👉 aquí se agregó esto (elimina tarjeta)
  });

  // Eventos de arrastrar
  card.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("text/plain", ""); // necesario en algunos navegadores
    card.classList.add("dragging");
    window.draggedCard = card; // 👉 aquí se agregó esto (guardar tarjeta que se arrastra)
  });

  card.addEventListener("dragend", () => {
    card.classList.remove("dragging");
    window.draggedCard = null; // 👉 aquí se agregó esto (limpiar al soltar)
  });

  // Ensamblar tarjeta
  card.appendChild(text);
  card.appendChild(deleteBtn);

  return card;
}
