const categories = ["soup", "main-course", "salad", "drink", "dessert"];

const selectedDishes = {
    soup: null,
    "main-course": null,
    salad: null,
    drink: null,
    dessert: null
};

const activeFilters = {
    soup: null,
    "main-course": null,
    salad: null,
    drink: null,
    dessert: null
};

function createDishCard(dish) {
    const card = document.createElement("div");
    card.className = "dish-card";
    card.dataset.dish = dish.keyword;

    if (selectedDishes[dish.category]?.keyword === dish.keyword) {
        card.classList.add("selected");
    }

    card.innerHTML = `
        <img src="${dish.image}" alt="${dish.name}">
        <p class="dish-price">${dish.price} ₽</p>
        <p class="dish-name">${dish.name}</p>
        <p class="dish-weight">${dish.count}</p>
        <button class="dish-button" type="button">Добавить</button>
    `;

    card.addEventListener("click", selectDish);
    return card;
}

function getCategoryDishes(category) {
    const kind = activeFilters[category];

    return dishes
        .filter((dish) => dish.category === category)
        .filter((dish) => kind === null || dish.kind === kind)
        .sort((a, b) => a.name.localeCompare(b.name, "ru"));
}

function renderCategory(category) {
    const container = document.querySelector(`.dishes-grid[data-category="${category}"]`);
    container.innerHTML = "";

    getCategoryDishes(category).forEach((dish) => {
        container.append(createDishCard(dish));
    });
}

function renderDishes() {
    categories.forEach(renderCategory);
}

function selectDish(event) {
    const card = event.currentTarget;
    const keyword = card.dataset.dish;
    const dish = dishes.find((item) => item.keyword === keyword);

    if (!dish) {
        return;
    }

    selectedDishes[dish.category] = dish;
    renderCategory(dish.category);
    updateOrder();
}

function handleFilterClick(event) {
    const button = event.currentTarget;
    const section = button.closest(".menu-section");
    const category = section.dataset.sectionCategory;
    const kind = button.dataset.kind;
    const wasActive = button.classList.contains("active");

    section.querySelectorAll(".filter-button").forEach((item) => {
        item.classList.remove("active");
        item.setAttribute("aria-pressed", "false");
    });

    if (wasActive) {
        activeFilters[category] = null;
    } else {
        activeFilters[category] = kind;
        button.classList.add("active");
        button.setAttribute("aria-pressed", "true");
    }

    renderCategory(category);
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
        salad: "Блюдо не выбрано",
        drink: "Напиток не выбран",
        dessert: "Блюдо не выбрано"
    };

    categories.forEach((category) => {
        const output = document.querySelector(`[data-order-category="${category}"]`);
        const dish = selectedDishes[category];
        output.textContent = dish ? `${dish.name} ${dish.price} ₽` : emptyText[category];
    });

    const total = selected.reduce((sum, dish) => sum + dish.price, 0);
    totalPrice.textContent = `${total} ₽`;
}

function resetPageState() {
    categories.forEach((category) => {
        selectedDishes[category] = null;
        activeFilters[category] = null;
    });

    document.querySelectorAll(".filter-button.active").forEach((button) => {
        button.classList.remove("active");
        button.setAttribute("aria-pressed", "false");
    });

    renderDishes();
    updateOrder();
}

document.querySelectorAll(".filter-button").forEach((button) => {
    button.setAttribute("aria-pressed", "false");
    button.addEventListener("click", handleFilterClick);
});

renderDishes();
updateOrder();

document.querySelector(".order-form").addEventListener("reset", () => {
    window.setTimeout(resetPageState, 0);
});
