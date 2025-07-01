let currentBoard = "Principal";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("todo-form");
  const input = document.getElementById("todo-input");
  const priorityInput = document.getElementById("priority-input");

  const cardsContainers = {
    todo: document.getElementById("todo-cards"),
    inProgress: document.getElementById("progress-cards"),
    done: document.getElementById("done-cards"),
  };

  const boardSelector = document.getElementById("board-selector");
  const createBoardBtn = document.getElementById("create-board");
  const deleteBoardBtn = document.getElementById("delete-board");
  const clearBtn = document.getElementById("clear-board");
  const darkToggle = document.getElementById("toggle-dark");

  // Cargar lista de tableros
  function loadBoardList() {
    boardSelector.innerHTML = "";
    const boardNames = Object.keys(localStorage)
      .filter(key => key.startsWith("taskflow-board:"))
      .map(key => key.split(":")[1]);

    if (!boardNames.includes("Principal")) boardNames.unshift("Principal");

    boardNames.forEach(name => {
      const opt = document.createElement("option");
      opt.value = name;
      opt.textContent = name;
      boardSelector.appendChild(opt);
    });

    boardSelector.value = currentBoard;
  }

  // Cargar tareas del tablero actual
  function loadBoard() {
    const data = JSON.parse(localStorage.getItem("taskflow-board:" + currentBoard));
    Object.values(cardsContainers).forEach(c => (c.innerHTML = ""));
    if (!data) return;

    for (let key in data) {
      if (cardsContainers[key]) {
        data[key].forEach(item => {
          const { text, priority } = typeof item === "string" ? { text: item, priority: "baja" } : item;
          const card = createCard(text, priority, key, cardsContainers);
          cardsContainers[key].appendChild(card);
        });
      }
    }
  }

  // Guardar tareas en localStorage
  function saveBoard() {
    const data = {
      todo: [],
      inProgress: [],
      done: [],
    };

    for (let key in cardsContainers) {
      const cards = cardsContainers[key].querySelectorAll(".card");
      cards.forEach(card => {
        const text = card.querySelector("span").textContent;
        const priority = card.getAttribute("data-priority") || "baja";
        data[key].push({ text, priority });
      });
    }

    localStorage.setItem("taskflow-board:" + currentBoard, JSON.stringify(data));
  }

  // Crear tarjeta visual
  function createCard(text, priority, listName, containers) {
    const card = document.createElement("div");
    card.className = "card";
    card.setAttribute("draggable", "true");
    card.setAttribute("data-priority", priority);

    const span = document.createElement("span");
    span.textContent = text;

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "❌";
    deleteBtn.className = "delete-btn";
    deleteBtn.addEventListener("click", () => {
      card.remove();
      saveBoard();
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

  // Crear nueva tarjeta
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    const priority = priorityInput.value;

    if (text !== "") {
      const card = createCard(text, priority, "todo", cardsContainers);
      cardsContainers.todo.appendChild(card);
      saveBoard();
      input.value = "";
    }
  });

  // Configurar zonas de drop
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
        saveBoard();
      }
    });
  });

  // Botón para limpiar tablero
  clearBtn.addEventListener("click", () => {
    if (confirm("¿Borrar todas las tareas del tablero actual?")) {
      Object.values(cardsContainers).forEach(container => {
        container.innerHTML = "";
      });
      saveBoard();
    }
  });

  // Cambiar de tablero
  boardSelector.addEventListener("change", () => {
    currentBoard = boardSelector.value;
    loadBoard();
  });

  // Crear nuevo tablero
  createBoardBtn.addEventListener("click", () => {
    const name = prompt("Nombre del nuevo tablero:");
    if (name && name.trim() !== "") {
      currentBoard = name.trim();
      loadBoardList();
      loadBoard();
      saveBoard();
    }
  });

  // Borrar tablero
  deleteBoardBtn.addEventListener("click", () => {
    if (currentBoard === "Principal") {
      alert("No puedes borrar el tablero Principal.");
      return;
    }

    if (confirm(`¿Borrar el tablero "${currentBoard}"?`)) {
      localStorage.removeItem("taskflow-board:" + currentBoard);
      currentBoard = "Principal";
      loadBoardList();
      loadBoard();
    }
  });

  // Modo oscuro
  function applyTheme() {
    const darkMode = localStorage.getItem("taskflow-dark") === "true";
    document.body.classList.toggle("dark", darkMode);
    darkToggle.textContent = darkMode ? "☀️ Modo claro" : "🌙 Modo oscuro";
  }

  darkToggle.addEventListener("click", () => {
    const current = document.body.classList.contains("dark");
    localStorage.setItem("taskflow-dark", !current);
    applyTheme();
  });

  applyTheme();
  loadBoardList();
  loadBoard();
});
