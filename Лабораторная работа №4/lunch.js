const selectedDishes = {
    soup: null,
    "main-course": null,
    drink: null
};

function createDishCard(dish) {
    const card = document.createElement("div");
    card.className = "dish-card";
    card.dataset.dish = dish.keyword;
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `Добавить ${dish.name} в заказ`);

    card.innerHTML = `
        <img src="${dish.image}" alt="${dish.name}">
        <p class="dish-price">${dish.price} ₽</p>
        <p class="dish-name">${dish.name}</p>
        <p class="dish-weight">${dish.count}</p>
        <button class="dish-button" type="button">Добавить</button>
    `;

    card.addEventListener("click", selectDish);
    card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            selectDish(event);
        }
    });

    return card;
}

function renderDishes() {
    const categories = ["soup", "main-course", "drink"];

    categories.forEach((category) => {
        const container = document.querySelector(`.dishes-grid[data-category="${category}"]`);
        const categoryDishes = dishes
            .filter((dish) => dish.category === category)
            .sort((a, b) => a.name.localeCompare(b.name, "ru"));

        categoryDishes.forEach((dish) => {
            container.append(createDishCard(dish));
        });
    });
}

function selectDish(event) {
    const card = event.currentTarget;
    const keyword = card.dataset.dish;
    const dish = dishes.find((item) => item.keyword === keyword);

    if (!dish) {
        return;
    }

    selectedDishes[dish.category] = dish;

    document
        .querySelectorAll(`.dish-card[data-dish]`)
        .forEach((item) => {
            const itemDish = dishes.find((dishItem) => dishItem.keyword === item.dataset.dish);
            if (itemDish && itemDish.category === dish.category) {
                item.classList.toggle("selected", item.dataset.dish === keyword);
            }
        });

    updateOrder();
}

function updateOrder() {
    const nothingSelected = document.getElementById("nothing-selected");
    const orderDetails = document.getElementById("order-details");
    const orderTotal = document.getElementById("order-total");
    const totalPrice = document.getElementById("total-price");

    const selected = Object.values(selectedDishes).filter(Boolean);

    if (selected.length === 0) {
        nothingSelected.hidden = false;
        orderDetails.hidden = true;
        orderTotal.hidden = true;
        return;
    }

    nothingSelected.hidden = true;
    orderDetails.hidden = false;
    orderTotal.hidden = false;

    const emptyText = {
        soup: "Блюдо не выбрано",
        "main-course": "Блюдо не выбрано",
        drink: "Напиток не выбран"
    };

    Object.keys(selectedDishes).forEach((category) => {
        const output = document.querySelector(`[data-order-category="${category}"]`);
        const dish = selectedDishes[category];
        output.textContent = dish ? `${dish.name} ${dish.price} ₽` : emptyText[category];
    });

    const total = selected.reduce((sum, dish) => sum + dish.price, 0);
    totalPrice.textContent = `${total} ₽`;
}

function resetSelectedDishes() {
    Object.keys(selectedDishes).forEach((category) => {
        selectedDishes[category] = null;
    });

    document.querySelectorAll(".dish-card.selected").forEach((card) => {
        card.classList.remove("selected");
    });

    updateOrder();
}

renderDishes();
updateOrder();

document.querySelector(".order-form").addEventListener("reset", () => {
    window.setTimeout(resetSelectedDishes, 0);
});
