function normalizeDish(dish) {
    const normalizedCategory = dish.category === "main_course" ? "main-course" : dish.category;

    return {
        ...dish,
        id: Number(dish.id),
        category: normalizedCategory
    };
}

function buildApiUrl(baseUrl, path) {
    const url = new URL(`${baseUrl}${path}`);
    url.searchParams.set("api_key", API_KEY.trim());
    return url.toString();
}

async function parseApiError(response) {
    try {
        const data = await response.json();
        return data.error || data.message || `Ошибка сервера: ${response.status}`;
    } catch {
        return `Ошибка сервера: ${response.status}`;
    }
}

async function requestApi(path, options = {}) {
    if (!API_KEY.trim()) {
        throw new Error("API key не указан");
    }

    let lastError = null;
    for (const baseUrl of API_BASE_URLS) {
        const url = buildApiUrl(baseUrl, path);
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error(await parseApiError(response));
            }
            if (response.status === 204) return null;
            return await response.json();
        } catch (error) {
            lastError = error;
            console.warn(`Ошибка запроса ${url}`, error);
        }
    }
    throw lastError || new Error("Не удалось выполнить запрос к API");
}

async function loadDishesFromApi() {
    try {
        const data = await requestApi("/dishes");
        if (!Array.isArray(data)) throw new Error("Сервер вернул меню в неожиданном формате");
        return data.map(normalizeDish);
    } catch (error) {
        console.warn("API меню недоступен. Используется локальная копия блюд.", error);
        return FALLBACK_DISHES.map(normalizeDish);
    }
}

const OFFLINE_ORDERS_KEY = "foodConstructOfflineOrdersLab9";

function getOfflineOrderSeed() {
    return [
        {
            id: 3,
            full_name: "Иванов Иван Иванович",
            email: "example@mospolytech.ru",
            subscribe: 1,
            phone: "+74952230523",
            delivery_address: "г. Москва, ул. Большая Семёновская, 38",
            delivery_type: "by_time",
            delivery_time: "21:00",
            comment: "Позвонить от поста охраны.",
            soup_id: null,
            main_course_id: 7,
            salad_id: null,
            drink_id: 23,
            dessert_id: 26,
            created_at: "2024-11-23T20:01:00",
            updated_at: "2024-11-23T20:01:00",
            student_id: 1
        },
        {
            id: 2,
            full_name: "Петров Пётр Петрович",
            email: "petrov@example.ru",
            subscribe: 0,
            phone: "+79990000002",
            delivery_address: "г. Москва, ул. Автозаводская, 16",
            delivery_type: "now",
            delivery_time: null,
            comment: "",
            soup_id: null,
            main_course_id: 7,
            salad_id: 13,
            drink_id: 19,
            dessert_id: null,
            created_at: "2024-11-24T10:11:00",
            updated_at: "2024-11-24T10:11:00",
            student_id: 1
        },
        {
            id: 1,
            full_name: "Сидоров Сергей Сергеевич",
            email: "sidorov@example.ru",
            subscribe: 1,
            phone: "+79990000001",
            delivery_address: "г. Москва, ул. Примерная, 10",
            delivery_type: "by_time",
            delivery_time: "17:00",
            comment: "Оставить на ресепшене.",
            soup_id: 1,
            main_course_id: 7,
            salad_id: 13,
            drink_id: 19,
            dessert_id: 25,
            created_at: "2024-11-25T13:24:00",
            updated_at: "2024-11-25T13:24:00",
            student_id: 1
        }
    ];
}

function readOfflineOrders() {
    try {
        const raw = localStorage.getItem(OFFLINE_ORDERS_KEY);
        if (raw) return JSON.parse(raw);
    } catch {}
    const seed = getOfflineOrderSeed();
    localStorage.setItem(OFFLINE_ORDERS_KEY, JSON.stringify(seed));
    return seed;
}

function writeOfflineOrders(orders) {
    localStorage.setItem(OFFLINE_ORDERS_KEY, JSON.stringify(orders));
}

async function loadOrdersFromApi() {
    try {
        const data = await requestApi("/orders");
        if (!Array.isArray(data)) throw new Error("Сервер вернул список заказов в неожиданном формате");
        return data;
    } catch (error) {
        console.warn("API заказов недоступен. Используется локальная демонстрационная история.", error);
        return readOfflineOrders();
    }
}

async function updateOrderOnServer(orderId, payload) {
    try {
        return await requestApi(`/orders/${Number(orderId)}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
    } catch (error) {
        console.warn("API недоступен. Изменение сохраняется локально для демонстрации.", error);
        const list = readOfflineOrders();
        const index = list.findIndex((order) => Number(order.id) === Number(orderId));
        if (index < 0) throw new Error("Заказ не найден в локальной истории");
        list[index] = {
            ...list[index],
            ...payload,
            updated_at: new Date().toISOString()
        };
        writeOfflineOrders(list);
        return list[index];
    }
}

async function deleteOrderOnServer(orderId) {
    try {
        return await requestApi(`/orders/${Number(orderId)}`, { method: "DELETE" });
    } catch (error) {
        console.warn("API недоступен. Заказ удаляется локально для демонстрации.", error);
        const list = readOfflineOrders();
        const order = list.find((item) => Number(item.id) === Number(orderId));
        if (!order) throw new Error("Заказ не найден в локальной истории");
        writeOfflineOrders(list.filter((item) => Number(item.id) !== Number(orderId)));
        return order;
    }
}

async function createOrderOnServer(payload) {
    try {
        return await requestApi("/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
    } catch (error) {
        console.warn("API недоступен. Новый заказ сохраняется локально для демонстрации.", error);
        const list = readOfflineOrders();
        const nextId = list.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
        const now = new Date().toISOString();
        const order = {
            id: nextId,
            ...payload,
            created_at: now,
            updated_at: now,
            student_id: 1
        };
        list.push(order);
        writeOfflineOrders(list);
        return order;
    }
}
