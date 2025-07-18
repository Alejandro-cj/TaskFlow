let currentBoard = "Principal";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("todo-form");
  const input = document.getElementById("todo-input");
  const priorityInput = document.getElementById("priority-input");
  const dueDateInput = document.getElementById("due-date");
  const searchInput = document.getElementById("task-search");

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

  function isExpired(dateString) {
    if (!dateString) return false;
    const today = new Date();
    const due = new Date(dateString);
    due.setHours(23, 59, 59, 999);
    return due < today;
  }

  function isSoon(dateString) {
    if (!dateString) return false;
    const today = new Date();
    const due = new Date(dateString);
    const diffTime = due - today;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 2;
  }

  function createCard(text, priority, dueDate, listName, containers) {
    const card = document.createElement("div");
    card.className = "card";
    card.setAttribute("draggable", "true");
    card.setAttribute("data-priority", priority);

    const span = document.createElement("span");
    span.textContent = text;

    const dateSpan = document.createElement("span");
    dateSpan.className = "due-date";
    if (dueDate) {
      dateSpan.textContent = `📅 ${dueDate}`;
      if (isExpired(dueDate)) {
        card.classList.add("expired");
      } else if (isSoon(dueDate)) {
        card.classList.add("soon");
      }
    }

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "❌";
    deleteBtn.className = "delete-btn";
    deleteBtn.addEventListener("click", () => {
      card.remove();
      saveBoard();
    });

    card.appendChild(span);
    if (dueDate) card.appendChild(dateSpan);
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

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    const priority = priorityInput.value;
    const dueDate = dueDateInput.value;

    if (text !== "") {
      const card = createCard(text, priority, dueDate, "todo", cardsContainers);
      cardsContainers.todo.appendChild(card);
      saveBoard();
      input.value = "";
      dueDateInput.value = "";
    }
  });

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
        const dateSpan = card.querySelector(".due-date");
        const dueDate = dateSpan ? dateSpan.textContent.replace("📅 ", "") : "";

        data[key].push({ text, priority, dueDate });
      });
    }

    localStorage.setItem("taskflow-board:" + currentBoard, JSON.stringify(data));
  }

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

  function loadBoard() {
    const data = JSON.parse(localStorage.getItem("taskflow-board:" + currentBoard));
    Object.values(cardsContainers).forEach(c => (c.innerHTML = ""));
    if (!data) return;

    for (let key in data) {
      if (cardsContainers[key]) {
        data[key].forEach(item => {
          const { text, priority, dueDate } =
            typeof item === "string"
              ? { text: item, priority: "baja", dueDate: "" }
              : item;

          const card = createCard(text, priority, dueDate, key, cardsContainers);
          cardsContainers[key].appendChild(card);
        });
      }
    }
  }

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

  clearBtn.addEventListener("click", () => {
    if (confirm("¿Borrar todas las tareas del tablero actual?")) {
      Object.values(cardsContainers).forEach(container => {
        container.innerHTML = "";
      });
      saveBoard();
    }
  });

  boardSelector.addEventListener("change", () => {
    currentBoard = boardSelector.value;
    loadBoard();
  });

  createBoardBtn.addEventListener("click", () => {
    const name = prompt("Nombre del nuevo tablero:");
    if (name && name.trim() !== "") {
      currentBoard = name.trim();
      loadBoardList();
      loadBoard();
      saveBoard();
    }
  });

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

  searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase();

    Object.values(cardsContainers).forEach(container => {
      const cards = container.querySelectorAll(".card");
      cards.forEach(card => {
        const text = card.querySelector("span").textContent.toLowerCase();
        card.style.display = text.includes(query) ? "flex" : "none";
      });
    });
  });

  loadBoardList();
  loadBoard();
});
