let currentBoard = "Principal"; // tablero por defecto

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("todo-form");
  const input = document.getElementById("todo-input");
  const cardsContainers = {
    todo: document.getElementById("todo-cards"),
    inProgress: document.getElementById("progress-cards"),
    done: document.getElementById("done-cards"),
  };

  const boardSelector = document.getElementById("board-selector");
  const createBoardBtn = document.getElementById("create-board");
  const deleteBoardBtn = document.getElementById("delete-board");
  const clearBtn = document.getElementById("clear-board");

  // 🧠 Cargar lista de tableros disponibles
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

  // 🧠 Cargar tarjetas del tablero actual
  function loadBoard() {
    const data = JSON.parse(localStorage.getItem("taskflow-board:" + currentBoard));
    Object.values(cardsContainers).forEach(c => (c.innerHTML = ""));
    if (!data) return;

    for (let key in data) {
      if (cardsContainers[key]) {
        data[key].forEach(text => {
          const card = createCard(text, key, cardsContainers);
          cardsContainers[key].appendChild(card);
        });
      }
    }
  }

  // 🧠 Guardar tarjetas del tablero actual
  function saveBoard() {
    const data = {
      todo: [],
      inProgress: [],
      done: [],
    };

    for (let key in cardsContainers) {
      const cards = cardsContainers[key].querySelectorAll(".card span");
      cards.forEach(card => {
        data[key].push(card.textContent);
      });
    }

    localStorage.setItem("taskflow-board:" + currentBoard, JSON.stringify(data));
  }

  // 🧠 Crear tarjeta DOM
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

  // 👉 Crear tarjeta nueva
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (text !== "") {
      const card = createCard(text, "todo", cardsContainers);
      cardsContainers.todo.appendChild(card);
      saveBoard();
      input.value = "";
    }
  });

  // 👉 Drag & Drop entre listas
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

  // 👉 Botón limpiar tablero actual
  clearBtn.addEventListener("click", () => {
    if (confirm("¿Borrar todas las tareas del tablero actual?")) {
      Object.values(cardsContainers).forEach(container => {
        container.innerHTML = "";
      });
      saveBoard();
    }
  });

  // 👉 Cambiar de tablero
  boardSelector.addEventListener("change", () => {
    currentBoard = boardSelector.value;
    loadBoard();
  });

  // 👉 Crear nuevo tablero
  createBoardBtn.addEventListener("click", () => {
    const name = prompt("Nombre del nuevo tablero:");
    if (name && name.trim() !== "") {
      currentBoard = name.trim();
      loadBoardList();
      loadBoard(); // tablero vacío
      saveBoard(); // guardar estructura vacía
    }
  });

  // 👉 Eliminar tablero actual
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

  // 🧠 Cargar lista de tableros y tablero actual
  loadBoardList();
  loadBoard();

    // 👉 Paso 9: Activar modo oscuro si está guardado
  const darkToggle = document.getElementById("toggle-dark");

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

});
