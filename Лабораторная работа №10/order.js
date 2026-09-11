const orderCategories = ["soup", "main-course", "salad", "drink", "dessert"];
const categoryTitles = {
    soup: "Суп",
    "main-course": "Главное блюдо",
    salad: "Салат/стартер",
    drink: "Напиток",
    dessert: "Десерт"
};
const emptyCategoryText = {
    soup: "Не выбран",
    "main-course": "Не выбрано",
    salad: "Не выбран",
    drink: "Не выбран",
    dessert: "Не выбран"
};

let dishes = [];
let selectedIds = loadOrderIds();

function getDishById(id) {
    return dishes.find((dish) => dish.id === Number(id)) || null;
}

function getSelectedDishes() {
    return orderCategories
        .map((category) => getDishById(selectedIds[category]))
        .filter(Boolean);
}

function createOrderDishCard(dish) {
    const card = document.createElement("div");
    card.className = "dish-card order-dish-card";
    card.dataset.dishId = String(dish.id);

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
    button.textContent = "Удалить";
    button.addEventListener("click", () => removeDish(dish.category));

    card.append(image, price, name, count, button);
    return card;
}

function renderComposition() {
    const grid = document.getElementById("order-composition-grid");
    const emptyMessage = document.getElementById("order-empty-message");
    const selected = getSelectedDishes();

    grid.replaceChildren();
    emptyMessage.hidden = selected.length > 0;
    grid.hidden = selected.length === 0;

    selected.forEach((dish) => {
        grid.append(createOrderDishCard(dish));
    });
}

function renderOrderSummary() {
    let total = 0;

    orderCategories.forEach((category) => {
        const output = document.querySelector(`[data-summary-category="${category}"]`);
        const dish = getDishById(selectedIds[category]);

        if (dish) {
            output.textContent = `${dish.name} ${dish.price} ₽`;
            total += Number(dish.price);
        } else {
            output.textContent = emptyCategoryText[category];
        }
    });

    document.getElementById("order-total-price").textContent = `${total} ₽`;
}

function removeDish(category) {
    selectedIds[category] = null;
    saveOrderIds(selectedIds);
    renderComposition();
    renderOrderSummary();
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

function validateDeliveryTime() {
    const deliveryType = document.querySelector('input[name="delivery_type"]:checked')?.value;
    const deliveryTime = document.getElementById("delivery-time");

    if (deliveryType !== "by_time") {
        deliveryTime.required = false;
        deliveryTime.setCustomValidity("");
        return true;
    }

    deliveryTime.required = true;

    if (!deliveryTime.value) {
        deliveryTime.setCustomValidity("Укажите время доставки");
        deliveryTime.reportValidity();
        return false;
    }

    const [hours, minutes] = deliveryTime.value.split(":").map(Number);
    const now = new Date();
    const chosenMinutes = hours * 60 + minutes;
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    if (chosenMinutes < currentMinutes) {
        deliveryTime.setCustomValidity("Время доставки не должно быть раньше текущего времени");
        deliveryTime.reportValidity();
        return false;
    }

    deliveryTime.setCustomValidity("");
    return true;
}

function buildOrderPayload(form) {
    const formData = new FormData(form);
    const payload = {
        full_name: formData.get("full_name"),
        email: formData.get("email"),
        subscribe: document.getElementById("subscribe").checked ? 1 : 0,
        phone: formData.get("phone"),
        delivery_address: formData.get("delivery_address"),
        delivery_type: formData.get("delivery_type"),
        comment: formData.get("comment") || ""
    };

    if (payload.delivery_type === "by_time") {
        payload.delivery_time = formData.get("delivery_time");
    }

    const apiFieldByCategory = {
        soup: "soup_id",
        "main-course": "main_course_id",
        salad: "salad_id",
        drink: "drink_id",
        dessert: "dessert_id"
    };

    orderCategories.forEach((category) => {
        if (selectedIds[category]) {
            payload[apiFieldByCategory[category]] = selectedIds[category];
        }
    });

    return payload;
}

async function submitOrder(event) {
    event.preventDefault();
    const form = event.currentTarget;

    if (!form.reportValidity()) {
        return;
    }

    const comboMessage = getLunchValidationMessage(selectedIds);
    if (comboMessage) {
        showOrderNotification(comboMessage);
        return;
    }

    if (!validateDeliveryTime()) {
        return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;

    try {
        const payload = buildOrderPayload(form);
        await createOrderOnServer(payload);

        clearOrderIds();
        selectedIds = loadOrderIds();
        renderComposition();
        renderOrderSummary();
        form.reset();
        alert("Заказ успешно оформлен");
    } catch (error) {
        console.error(error);
        alert(`Не удалось оформить заказ: ${error.message}`);
    } finally {
        submitButton.disabled = false;
    }
}

function setupDeliveryControls() {
    const deliveryTime = document.getElementById("delivery-time");

    document.querySelectorAll('input[name="delivery_type"]').forEach((radio) => {
        radio.addEventListener("change", () => {
            deliveryTime.required = radio.value === "by_time" && radio.checked;
            deliveryTime.setCustomValidity("");
        });
    });

    deliveryTime.addEventListener("input", () => deliveryTime.setCustomValidity(""));
}

async function initOrderPage() {
    setupDeliveryControls();
    document.getElementById("order-form").addEventListener("submit", submitOrder);

    try {
        dishes = await loadDishesFromApi();

        orderCategories.forEach((category) => {
            if (selectedIds[category] && !getDishById(selectedIds[category])) {
                selectedIds[category] = null;
            }
        });
        saveOrderIds(selectedIds);

        renderComposition();
        renderOrderSummary();
    } catch (error) {
        console.error(error);
        document.getElementById("order-composition-grid").hidden = true;
        const emptyMessage = document.getElementById("order-empty-message");
        emptyMessage.hidden = false;
        emptyMessage.textContent = `Не удалось загрузить данные блюд с сервера. ${error.message}`;
        renderOrderSummary();
    }
}

initOrderPage();
