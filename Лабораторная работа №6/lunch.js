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

// ЛР №6: проверка состава ланча перед отправкой формы.
function getLunchValidationMessage() {
    const soup = Boolean(selectedDishes.soup);
    const mainCourse = Boolean(selectedDishes["main-course"]);
    const salad = Boolean(selectedDishes.salad);
    const drink = Boolean(selectedDishes.drink);
    const dessert = Boolean(selectedDishes.dessert);

    const nothingSelected = !soup && !mainCourse && !salad && !drink && !dessert;
    if (nothingSelected) {
        return "Ничего не выбрано. Выберите блюда для заказа";
    }

    // Все пять допустимых комбо сводятся к условию:
    // напиток + главное блюдо ИЛИ напиток + суп + салат.
    const validCombo = drink && (mainCourse || (soup && salad));
    if (validCombo) {
        return null;
    }

    // Выбрано полное комбо без напитка.
    if (!drink && (mainCourse || (soup && salad))) {
        return "Выберите напиток";
    }

    if (soup && !mainCourse && !salad) {
        return "Выберите главное блюдо/салат/стартер";
    }

    if (salad && !soup && !mainCourse) {
        return "Выберите суп или главное блюдо";
    }

    // Например, выбран только напиток и/или десерт.
    return "Выберите главное блюдо";
}

function closeOrderNotification() {
    document.querySelector(".order-notification")?.remove();
}

function showOrderNotification(message) {
    closeOrderNotification();

    const notification = document.createElement("div");
    notification.className = "order-notification";
    notification.setAttribute("role", "dialog");
    notification.setAttribute("aria-modal", "true");
    notification.setAttribute("aria-label", "Уведомление о составе заказа");

    const text = document.createElement("p");
    text.textContent = message;

    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "Окей 👌";
    button.addEventListener("click", closeOrderNotification);

    notification.append(text, button);
    document.body.append(notification);
    button.focus();
}

function validateLunchCombo(event) {
    const message = getLunchValidationMessage();

    if (message) {
        event.preventDefault();
        showOrderNotification(message);
        return false;
    }

    return true;
}

const orderForm = document.querySelector(".order-form");
const submitOrderButton = orderForm.querySelector('button[type="submit"]');

// Нужен click, чтобы показать наше уведомление даже раньше встроенной
// проверки required-полей браузером. submit остается основной проверкой формы.
submitOrderButton.addEventListener("click", (event) => {
    validateLunchCombo(event);
});

orderForm.addEventListener("submit", (event) => {
    validateLunchCombo(event);
});

orderForm.addEventListener("reset", () => {
    closeOrderNotification();
});
