const ORDER_STORAGE_KEY = "foodConstructOrder";
const ORDER_CATEGORIES = ["soup", "main-course", "salad", "drink", "dessert"];

function emptyOrderIds() {
    return {
        soup: null,
        "main-course": null,
        salad: null,
        drink: null,
        dessert: null
    };
}

function loadOrderIds() {
    try {
        const raw = localStorage.getItem(ORDER_STORAGE_KEY);
        if (!raw) {
            return emptyOrderIds();
        }

        const parsed = JSON.parse(raw);
        const result = emptyOrderIds();

        ORDER_CATEGORIES.forEach((category) => {
            const value = Number(parsed?.[category]);
            result[category] = Number.isInteger(value) && value > 0 ? value : null;
        });

        return result;
    } catch {
        return emptyOrderIds();
    }
}

function saveOrderIds(orderIds) {
    // В localStorage сохраняются только идентификаторы выбранных блюд.
    const data = {};

    ORDER_CATEGORIES.forEach((category) => {
        const value = Number(orderIds[category]);
        if (Number.isInteger(value) && value > 0) {
            data[category] = value;
        }
    });

    if (Object.keys(data).length === 0) {
        localStorage.removeItem(ORDER_STORAGE_KEY);
        return;
    }

    localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(data));
}

function clearOrderIds() {
    localStorage.removeItem(ORDER_STORAGE_KEY);
}

function hasAnyDish(orderIds) {
    return ORDER_CATEGORIES.some((category) => Boolean(orderIds[category]));
}

function isValidLunchCombo(orderIds) {
    const soup = Boolean(orderIds.soup);
    const mainCourse = Boolean(orderIds["main-course"]);
    const salad = Boolean(orderIds.salad);
    const drink = Boolean(orderIds.drink);

    // Допустимые комбо из ЛР №6:
    // суп + главное + салат + напиток
    // суп + главное + напиток
    // суп + салат + напиток
    // главное + салат + напиток
    // главное + напиток
    return drink && (mainCourse || (soup && salad));
}

function getLunchValidationMessage(orderIds) {
    const soup = Boolean(orderIds.soup);
    const mainCourse = Boolean(orderIds["main-course"]);
    const salad = Boolean(orderIds.salad);
    const drink = Boolean(orderIds.drink);
    const dessert = Boolean(orderIds.dessert);

    if (!soup && !mainCourse && !salad && !drink && !dessert) {
        return "Ничего не выбрано. Выберите блюда для заказа";
    }

    if (isValidLunchCombo(orderIds)) {
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
