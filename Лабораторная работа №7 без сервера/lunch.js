const API_URLS = [
    "https://edu.std-900.ist.mospolytech.ru/labs/api/dishes",
    "http://lab7-api.std-900.ist.mospolytech.ru/api/dishes"
];
const categories = ["soup", "main-course", "salad", "drink", "dessert"];

let dishes = [];

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

// Демонстрационная версия ЛР №7:
// сначала пробуем API, а при его недоступности используем локальную копию меню.
async function loadDishes() {
    for (const url of API_URLS) {
        const controller = new AbortController();
        const timeoutId = window.setTimeout(() => controller.abort(), 4000);

        try {
            const response = await fetch(url, { signal: controller.signal });

            if (!response.ok) {
                throw new Error(`Ошибка загрузки меню: ${response.status}`);
            }

            const data = await response.json();

            if (!Array.isArray(data)) {
                throw new Error("Сервер вернул данные в неожиданном формате");
            }

            dishes = data;
            console.log(`Меню загружено с API: ${url}`);
            return dishes;
        } catch (error) {
            console.warn(`API ${url} недоступен`, error);
        } finally {
            window.clearTimeout(timeoutId);
        }
    }

    console.warn("Оба учебных API недоступны. Используется локальная копия меню.");
    dishes = fallbackDishes.map((dish) => ({ ...dish }));
    return dishes;
}

function createDishCard(dish) {
    const card = document.createElement("div");
    card.className = "dish-card";
    card.dataset.dish = dish.keyword;

    if (selectedDishes[dish.category]?.keyword === dish.keyword) {
        card.classList.add("selected");
    }

    const image = document.createElement("img");
    image.src = dish.image;
    image.alt = dish.name;
    image.addEventListener("error", () => {
        const localDish = fallbackDishes.find((item) => item.name === dish.name)
            || fallbackDishes.find((item) => item.keyword === dish.keyword);

        if (localDish && image.src !== new URL(localDish.image, window.location.href).href) {
            image.src = localDish.image;
        }
    }, { once: true });

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

function showMenuLoadError() {
    document.querySelectorAll(".dishes-grid").forEach((container) => {
        container.innerHTML = '<p class="menu-load-error">Не удалось загрузить блюда с сервера. Обновите страницу позже.</p>';
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

    // Пять допустимых комбо:
    // 1) суп + главное + салат + напиток
    // 2) суп + главное + напиток
    // 3) суп + салат + напиток
    // 4) главное + салат + напиток
    // 5) главное + напиток
    const validCombo = drink && (mainCourse || (soup && salad));
    if (validCombo) {
        return null;
    }

    if (!drink && (mainCourse || (soup && salad))) {
        return "Выберите напиток";
    }

    if (soup && !mainCourse && !salad) {
        return "Выберите главное блюдо/салат/стартер";
    }

    if (salad && !soup && !mainCourse) {
        return "Выберите суп или главное блюдо";
    }

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

async function init() {
    document.querySelectorAll(".filter-button").forEach((button) => {
        button.setAttribute("aria-pressed", "false");
        button.addEventListener("click", handleFilterClick);
    });

    const orderForm = document.querySelector(".order-form");
    const submitOrderButton = orderForm.querySelector('button[type="submit"]');

    orderForm.addEventListener("reset", () => {
        window.setTimeout(resetPageState, 0);
        closeOrderNotification();
    });

    submitOrderButton.addEventListener("click", (event) => {
        validateLunchCombo(event);
    });

    orderForm.addEventListener("submit", (event) => {
        validateLunchCombo(event);
    });

    updateOrder();

    try {
        await loadDishes();
        renderDishes();
    } catch (error) {
        console.error(error);
        showMenuLoadError();
    }
}

init();
