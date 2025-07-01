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

            const text = document.createElement("span");
            text.textContent = taskText;

            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "❌";
            deleteBtn.className = "delete-btn";
            deleteBtn.addEventListener("click", () => {
                card.remove();
            });

            card.appendChild(text);
            card.appendChild(deleteBtn);
            cardsContainer.appendChild(card);
            input.value = "";
        }
    });
});
