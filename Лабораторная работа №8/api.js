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
    // По условию ЛР №8 api_key передаётся в строке запроса.
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
    let lastError = null;

    for (const baseUrl of API_BASE_URLS) {
        const url = buildApiUrl(baseUrl, path);

        try {
            const response = await fetch(url, options);

            if (!response.ok) {
                const message = await parseApiError(response);
                throw new Error(message);
            }

            if (response.status === 204) {
                return null;
            }

            return await response.json();
        } catch (error) {
            lastError = error;
            console.warn(`Ошибка запроса ${url}`, error);
        }
    }

    throw lastError || new Error("Не удалось выполнить запрос к API");
}

async function loadDishesFromApi() {
    const data = await requestApi("/dishes");

    if (!Array.isArray(data)) {
        throw new Error("Сервер вернул меню в неожиданном формате");
    }

    return data.map(normalizeDish);
}

async function createOrderOnServer(payload) {
    if (!API_KEY.trim()) {
        throw new Error("Укажите персональный API_KEY в файле config.js");
    }

    return requestApi("/orders", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });
}
