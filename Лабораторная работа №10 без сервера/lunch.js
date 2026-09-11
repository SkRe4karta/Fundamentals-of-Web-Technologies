const categories = ["soup", "main-course", "salad", "drink", "dessert"];
let dishes = [];
let selectedIds = loadOrderIds();

const activeFilters = {
    soup: null,
    "main-course": null,
    salad: null,
    drink: null,
    dessert: null
};

function getDishById(id) {
    return dishes.find((dish) => dish.id === Number(id)) || null;
}

function createDishCard(dish) {
    const card = document.createElement("div");
    card.className = "dish-card";
    card.dataset.dishId = String(dish.id);

    if (selectedIds[dish.category] === dish.id) {
        card.classList.add("selected");
    }

    const image = document.createElement("img");
    image.src = dish.image;
    image.alt = dish.name;

    const price = document.createElement("p");
    price.className = "dish-price";
    price.textContent = `${dish.price} ₽`;

    const name = document.createElement("p");
    name.className = "dish-name";
    name.textContent = dish.name;

    const count = document.createElement("p");
    count.className = "dish-weight";
    count.textContent = dish.count;

    const button = document.createElement("button");
    button.className = "dish-button";
    button.type = "button";
    button.textContent = "Добавить";

    card.append(image, price, name, count, button);
    card.addEventListener("click", () => selectDish(dish));

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

function selectDish(dish) {
    selectedIds[dish.category] = dish.id;
    saveOrderIds(selectedIds);
    renderCategory(dish.category);
    updateCheckoutPanel();
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

function getSelectedDishes() {
    return categories
        .map((category) => getDishById(selectedIds[category]))
        .filter(Boolean);
}

function updateCheckoutPanel() {
    const panel = document.getElementById("checkout-panel");
    const totalOutput = document.getElementById("checkout-total");
    const checkoutLink = document.getElementById("checkout-link");
    const selected = getSelectedDishes();

    panel.hidden = selected.length === 0;

    if (selected.length === 0) {
        return;
    }

    const total = selected.reduce((sum, dish) => sum + Number(dish.price), 0);
    totalOutput.textContent = `${total} ₽`;

    const canCheckout = isValidLunchCombo(selectedIds);
    checkoutLink.classList.toggle("disabled", !canCheckout);
    checkoutLink.setAttribute("aria-disabled", String(!canCheckout));
    checkoutLink.tabIndex = canCheckout ? 0 : -1;
}

function showMenuLoadError(error) {
    document.querySelectorAll(".dishes-grid").forEach((container) => {
        const message = document.createElement("p");
        message.className = "menu-load-error";
        message.textContent = `Не удалось загрузить блюда с сервера. ${error.message}`;
        container.replaceChildren(message);
    });
}

async function init() {
    document.querySelectorAll(".filter-button").forEach((button) => {
        button.setAttribute("aria-pressed", "false");
        button.addEventListener("click", handleFilterClick);
    });

    document.getElementById("checkout-link").addEventListener("click", (event) => {
        if (!isValidLunchCombo(selectedIds)) {
            event.preventDefault();
        }
    });

    try {
        dishes = await loadDishesFromApi();

        // Удаляем из localStorage идентификаторы блюд, которых больше нет в меню.
        categories.forEach((category) => {
            if (selectedIds[category] && !getDishById(selectedIds[category])) {
                selectedIds[category] = null;
            }
        });
        saveOrderIds(selectedIds);

        renderDishes();
        updateCheckoutPanel();
    } catch (error) {
        console.error(error);
        showMenuLoadError(error);
    }
}

init();
