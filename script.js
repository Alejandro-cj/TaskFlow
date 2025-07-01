document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("todo-form");
  const input = document.getElementById("todo-input");
  const cardsContainers = {
    todo: document.getElementById("todo-cards"),
    inProgress: document.getElementById("progress-cards"),
    done: document.getElementById("done-cards"),
  };

  // Cargar tarjetas al inicio
  loadFromStorage(cardsContainers);

  // Agregar nueva tarjeta
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (text !== "") {
      const card = createCard(text, "todo", cardsContainers);
      cardsContainers.todo.appendChild(card);
      saveToStorage(cardsContainers);
      input.value = "";
    }
  });

  // Configurar zonas de drop para todas las listas
  Object.entries(cardsContainers).forEach(([zoneName, zone]) => {
    zone.addEventListener("dragover", (e) => {
      e.preventDefault();
      zone.classList.add("drag-over");
    });

    zone.addEventListener("dragleave", () => {
      zone.classList.remove("drag-over");
    });

    zone.addEventListener("drop", (e) => {
      e.preventDefault();
      zone.classList.remove("drag-over");
      if (window.draggedCard) {
        zone.appendChild(window.draggedCard);
        saveToStorage(cardsContainers); // 👉 aquí se agregó esto (guardar después de mover)
      }
    });
  });
});

// Crear una tarjeta visual
function createCard(text, listName, containers) {
  const card = document.createElement("div");
  card.className = "card";
  card.setAttribute("draggable", "true");

  const span = document.createElement("span");
  span.textContent = text;

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "❌";
  deleteBtn.className = "delete-btn";
  deleteBtn.addEventListener("click", () => {
    card.remove();
    saveToStorage(containers); // 👉 aquí se agregó esto (guardar después de borrar)
  });

  card.appendChild(span);
  card.appendChild(deleteBtn);

  card.addEventListener("dragstart", () => {
    card.classList.add("dragging");
    window.draggedCard = card;
  });

  card.addEventListener("dragend", () => {
    card.classList.remove("dragging");
    window.draggedCard = null;
  });

  return card;
}

// Guardar todas las tarjetas en localStorage
function saveToStorage(containers) {
  const data = {
    todo: [],
    inProgress: [],
    done: [],
  };

  for (let key in containers) {
    const cards = containers[key].querySelectorAll(".card span");
    cards.forEach(card => {
      data[key].push(card.textContent);
    });
  }

  localStorage.setItem("taskflow-data", JSON.stringify(data));
}

// Cargar tarjetas desde localStorage
function loadFromStorage(containers) {
  const data = JSON.parse(localStorage.getItem("taskflow-data"));
  if (!data) return;

  for (let key in data) {
    if (containers[key]) {
      data[key].forEach(text => {
        const card = createCard(text, key, containers);
        containers[key].appendChild(card);
      });
    }
  }
}
