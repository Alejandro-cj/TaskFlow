document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("todo-form");
  const input = document.getElementById("todo-input");
  const cardsContainer = document.getElementById("todo-cards");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const taskText = input.value.trim();

    if (taskText !== "") {
      const card = document.createElement("div");
      card.className = "card";
      card.textContent = taskText;

      cardsContainer.appendChild(card);
      input.value = "";
    }
  });
});
