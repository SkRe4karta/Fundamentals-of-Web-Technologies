const ORDER_CATEGORY_FIELDS = [
    ["soup_id", "Суп"],
    ["main_course_id", "Главное блюдо"],
    ["salad_id", "Салат/стартер"],
    ["drink_id", "Напиток"],
    ["dessert_id", "Десерт"]
];

let orders = [];
let dishes = [];
let activeOrder = null;

function getDishMap() {
    return new Map(dishes.map((dish) => [Number(dish.id), dish]));
}

function getOrderDishes(order) {
    const dishMap = getDishMap();

    return ORDER_CATEGORY_FIELDS
        .map(([field, title]) => {
            const id = Number(order[field]);
            const dish = id ? dishMap.get(id) : null;
            return dish ? { ...dish, title } : null;
        })
        .filter(Boolean);
}

function getOrderTotal(order) {
    return getOrderDishes(order).reduce((sum, dish) => sum + Number(dish.price || 0), 0);
}

function formatDateTime(value) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);

    return new Intl.DateTimeFormat("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    }).format(date).replace(",", "");
}

function formatDelivery(order) {
    if (order.delivery_type === "by_time") {
        return order.delivery_time ? String(order.delivery_time).slice(0, 5) : "К указанному времени";
    }
    return "Как можно скорее (с 7:00 до 23:00)";
}

function createIconButton(label, iconPath, handler) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "icon-button";
    button.title = label;
    button.setAttribute("aria-label", label);
    button.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${iconPath}</svg>`;
    button.addEventListener("click", handler);
    return button;
}

function createOrdersRow(order, index) {
    const row = document.createElement("tr");
    const names = getOrderDishes(order).map((dish) => dish.name).join(", ") || "—";

    const numberCell = document.createElement("td");
    numberCell.textContent = String(index + 1);

    const dateCell = document.createElement("td");
    dateCell.textContent = formatDateTime(order.created_at);

    const compositionCell = document.createElement("td");
    compositionCell.textContent = names;

    const priceCell = document.createElement("td");
    priceCell.className = "price-cell";
    priceCell.textContent = `${getOrderTotal(order)} ₽`;

    const deliveryCell = document.createElement("td");
    deliveryCell.className = "delivery-cell";
    deliveryCell.textContent = formatDelivery(order);

    const actionsCell = document.createElement("td");
    const actions = document.createElement("div");
    actions.className = "order-actions";

    actions.append(
        createIconButton(
            "Подробнее",
            '<path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6S2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="2.5"/>',
            () => openViewModal(order)
        ),
        createIconButton(
            "Редактирование",
            '<path d="M4 20h4l11-11-4-4L4 16v4Z"/><path d="m13.5 6.5 4 4"/>',
            () => openEditModal(order)
        ),
        createIconButton(
            "Удаление",
            '<path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="m7 7 1 13h8l1-13"/><path d="M10 11v5M14 11v5"/>',
            () => openDeleteModal(order)
        )
    );

    actionsCell.append(actions);
    row.append(numberCell, dateCell, compositionCell, priceCell, deliveryCell, actionsCell);
    return row;
}

function renderOrders() {
    const status = document.getElementById("orders-status");
    const wrap = document.getElementById("orders-table-wrap");
    const body = document.getElementById("orders-table-body");
    body.replaceChildren();

    if (orders.length === 0) {
        status.hidden = false;
        status.textContent = "У вас пока нет оформленных заказов.";
        wrap.hidden = true;
        return;
    }

    status.hidden = true;
    wrap.hidden = false;
    orders.forEach((order, index) => body.append(createOrdersRow(order, index)));
}

function showToast(message, type = "success") {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.append(toast);
    window.setTimeout(() => toast.remove(), 3500);
}

function closeModal(modal) {
    if (!modal) return;
    modal.hidden = true;
    activeOrder = null;
}

function openModal(modal) {
    modal.hidden = false;
    modal.querySelector(".modal-close")?.focus();
}

function appendDataRow(container, label, value) {
    const row = document.createElement("div");
    row.className = "modal-data-row";
    const left = document.createElement("span");
    left.textContent = label;
    const right = document.createElement("span");
    right.textContent = value || "—";
    row.append(left, right);
    container.append(row);
}

function appendComposition(container, order) {
    const selected = getOrderDishes(order);
    if (selected.length === 0) {
        const empty = document.createElement("p");
        empty.textContent = "Блюда не указаны";
        container.append(empty);
        return;
    }

    selected.forEach((dish) => {
        const row = document.createElement("div");
        row.className = "modal-composition-row";
        const title = document.createElement("span");
        title.textContent = dish.title;
        const value = document.createElement("span");
        value.textContent = `${dish.name} (${dish.price} ₽)`;
        row.append(title, value);
        container.append(row);
    });
}

function openViewModal(order) {
    activeOrder = order;
    const modal = document.getElementById("view-modal");
    const content = document.getElementById("view-modal-content");
    content.replaceChildren();

    appendDataRow(content, "Дата оформления", formatDateTime(order.created_at));

    const deliveryTitle = document.createElement("h3");
    deliveryTitle.textContent = "Доставка";
    content.append(deliveryTitle);
    appendDataRow(content, "Имя получателя", order.full_name);
    appendDataRow(content, "Адрес доставки", order.delivery_address);
    appendDataRow(content, "Время доставки", formatDelivery(order));
    appendDataRow(content, "Телефон", order.phone);
    appendDataRow(content, "Email", order.email);

    const commentTitle = document.createElement("h3");
    commentTitle.textContent = "Комментарий";
    content.append(commentTitle);
    const comment = document.createElement("p");
    comment.className = "modal-comment";
    comment.textContent = order.comment || "—";
    content.append(comment);

    const compositionTitle = document.createElement("h3");
    compositionTitle.textContent = "Состав заказа";
    content.append(compositionTitle);
    appendComposition(content, order);

    const total = document.createElement("p");
    total.className = "modal-total";
    total.textContent = `Стоимость: ${getOrderTotal(order)} ₽`;
    content.append(total);

    openModal(modal);
}

function syncEditDeliveryTimeState() {
    const form = document.getElementById("edit-order-form");
    const type = form.elements.delivery_type.value;
    const time = document.getElementById("edit-delivery-time");
    time.disabled = type !== "by_time";
    time.required = type === "by_time";
}

function openEditModal(order) {
    activeOrder = order;
    const modal = document.getElementById("edit-modal");
    const form = document.getElementById("edit-order-form");

    document.getElementById("edit-created-at").textContent = formatDateTime(order.created_at);
    form.elements.full_name.value = order.full_name || "";
    form.elements.delivery_address.value = order.delivery_address || "";
    form.elements.phone.value = order.phone || "";
    form.elements.email.value = order.email || "";
    form.elements.comment.value = order.comment || "";
    form.elements.delivery_type.value = order.delivery_type === "by_time" ? "by_time" : "now";
    form.elements.delivery_time.value = order.delivery_time ? String(order.delivery_time).slice(0, 5) : "";
    syncEditDeliveryTimeState();

    const composition = document.getElementById("edit-composition");
    composition.replaceChildren();
    appendComposition(composition, order);
    document.getElementById("edit-total").textContent = `Стоимость: ${getOrderTotal(order)} ₽`;

    openModal(modal);
}

function openDeleteModal(order) {
    activeOrder = order;
    openModal(document.getElementById("delete-modal"));
}

function buildChangedFields(form, order) {
    const formData = new FormData(form);
    const values = {
        full_name: String(formData.get("full_name") || "").trim(),
        email: String(formData.get("email") || "").trim(),
        phone: String(formData.get("phone") || "").trim(),
        delivery_address: String(formData.get("delivery_address") || "").trim(),
        delivery_type: String(formData.get("delivery_type") || "now"),
        comment: String(formData.get("comment") || "")
    };

    if (values.delivery_type === "by_time") {
        values.delivery_time = String(formData.get("delivery_time") || "");
    }

    const changed = {};
    Object.entries(values).forEach(([key, value]) => {
        const current = order[key] == null ? "" : String(order[key]).slice(0, key === "delivery_time" ? 5 : undefined);
        if (String(value) !== current) changed[key] = value;
    });

    return changed;
}

function validateEditDeliveryTime() {
    const form = document.getElementById("edit-order-form");
    if (form.elements.delivery_type.value !== "by_time") return true;

    const input = document.getElementById("edit-delivery-time");
    if (!input.value) {
        input.setCustomValidity("Укажите время доставки");
        input.reportValidity();
        return false;
    }

    const [h, m] = input.value.split(":").map(Number);
    const chosen = h * 60 + m;
    const now = new Date();
    const current = now.getHours() * 60 + now.getMinutes();
    if (chosen < current) {
        input.setCustomValidity("Время доставки не должно быть раньше текущего времени");
        input.reportValidity();
        return false;
    }

    input.setCustomValidity("");
    return true;
}

async function handleEditSubmit(event) {
    event.preventDefault();
    if (!activeOrder) return;

    const form = event.currentTarget;
    if (!form.reportValidity() || !validateEditDeliveryTime()) return;

    const changes = buildChangedFields(form, activeOrder);
    if (Object.keys(changes).length === 0) {
        closeModal(document.getElementById("edit-modal"));
        showToast("Изменений нет", "success");
        return;
    }

    const submit = form.querySelector('button[type="submit"]');
    submit.disabled = true;
    try {
        await updateOrderOnServer(activeOrder.id, changes);
        closeModal(document.getElementById("edit-modal"));
        await loadOrders();
        showToast("Заказ успешно изменён", "success");
    } catch (error) {
        console.error(error);
        showToast(`Не удалось изменить заказ: ${error.message}`, "error");
    } finally {
        submit.disabled = false;
    }
}

async function handleDelete() {
    if (!activeOrder) return;
    const button = document.getElementById("confirm-delete-button");
    button.disabled = true;
    try {
        await deleteOrderOnServer(activeOrder.id);
        closeModal(document.getElementById("delete-modal"));
        await loadOrders();
        showToast("Заказ успешно удалён", "success");
    } catch (error) {
        console.error(error);
        showToast(`Не удалось удалить заказ: ${error.message}`, "error");
    } finally {
        button.disabled = false;
    }
}

async function loadOrders() {
    const status = document.getElementById("orders-status");
    const wrap = document.getElementById("orders-table-wrap");
    status.hidden = false;
    status.textContent = "Загрузка заказов...";
    wrap.hidden = true;

    try {
        const [loadedDishes, loadedOrders] = await Promise.all([
            loadDishesFromApi(),
            loadOrdersFromApi()
        ]);

        dishes = loadedDishes;
        orders = loadedOrders
            .slice()
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        renderOrders();
    } catch (error) {
        console.error(error);
        orders = [];
        status.hidden = false;
        status.textContent = `Не удалось загрузить историю заказов. ${error.message}`;
        wrap.hidden = true;
        showToast(`Ошибка загрузки заказов: ${error.message}`, "error");
    }
}

function setupModals() {
    document.querySelectorAll("[data-close-modal]").forEach((button) => {
        button.addEventListener("click", () => closeModal(button.closest(".modal-overlay")));
    });

    document.querySelectorAll(".modal-overlay").forEach((overlay) => {
        overlay.addEventListener("click", (event) => {
            if (event.target === overlay) closeModal(overlay);
        });
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            document.querySelectorAll(".modal-overlay:not([hidden])").forEach(closeModal);
        }
    });

    document.querySelectorAll('input[name="delivery_type"]').forEach((radio) => {
        radio.addEventListener("change", syncEditDeliveryTimeState);
    });
    document.getElementById("edit-delivery-time").addEventListener("input", (event) => event.currentTarget.setCustomValidity(""));

    document.getElementById("edit-order-form").addEventListener("submit", handleEditSubmit);
    document.getElementById("confirm-delete-button").addEventListener("click", handleDelete);
}

setupModals();
loadOrders();
