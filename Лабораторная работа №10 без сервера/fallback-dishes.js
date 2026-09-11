const FALLBACK_DISHES = [
    {
        id: 1,
        keyword: "gazpacho",
        name: "Гаспачо",
        price: 195,
        category: "soup",
        count: "350 г",
        image: "images/gazpacho.jpg",
        kind: "veg"
    },
    {
        id: 2,
        keyword: "mushroom_soup",
        name: "Грибной суп-пюре",
        price: 185,
        category: "soup",
        count: "330 г",
        image: "images/mushroom_soup.jpg",
        kind: "veg"
    },
    {
        id: 3,
        keyword: "norwegian_soup",
        name: "Норвежский суп",
        price: 270,
        category: "soup",
        count: "330 г",
        image: "images/norwegian_soup.jpg",
        kind: "fish"
    },
    {
        id: 4,
        keyword: "ramen",
        name: "Рамен",
        price: 375,
        category: "soup",
        count: "425 г",
        image: "images/ramen.jpg",
        kind: "meat"
    },
    {
        id: 5,
        keyword: "tom_yum",
        name: "Том ям с креветками",
        price: 650,
        category: "soup",
        count: "500 г",
        image: "images/tom_yum.jpg",
        kind: "fish"
    },
    {
        id: 6,
        keyword: "chicken_soup",
        name: "Куриный суп",
        price: 330,
        category: "soup",
        count: "350 г",
        image: "images/chicken_soup.jpg",
        kind: "meat"
    },

    {
        id: 7,
        keyword: "fried_potatoes_with_mushrooms",
        name: "Жареная картошка с грибами",
        price: 150,
        category: "main-course",
        count: "250 г",
        image: "images/fried_potatoes.jpg",
        kind: "veg"
    },
    {
        id: 8,
        keyword: "lasagna",
        name: "Лазанья",
        price: 385,
        category: "main-course",
        count: "310 г",
        image: "images/lasagna.jpg",
        kind: "meat"
    },
    {
        id: 9,
        keyword: "chicken_cutlets_with_puree",
        name: "Котлеты из курицы с картофельным пюре",
        price: 225,
        category: "main-course",
        count: "280 г",
        image: "images/chicken_cutlets.jpg",
        kind: "meat"
    },
    {
        id: 10,
        keyword: "fish_cutlet_with_rice",
        name: "Рыбная котлета с рисом и спаржей",
        price: 320,
        category: "main-course",
        count: "270 г",
        image: "images/fish_cutlet.jpg",
        kind: "fish"
    },
    {
        id: 11,
        keyword: "margherita_pizza",
        name: "Пицца Маргарита",
        price: 450,
        category: "main-course",
        count: "470 г",
        image: "images/margherita_pizza.jpg",
        kind: "veg"
    },
    {
        id: 12,
        keyword: "shrimp_pasta",
        name: "Паста с креветками",
        price: 340,
        category: "main-course",
        count: "280 г",
        image: "images/shrimp_pasta.jpg",
        kind: "fish"
    },

    {
        id: 13,
        keyword: "korean_salad",
        name: "Корейский салат с овощами и яйцом",
        price: 330,
        category: "salad",
        count: "250 г",
        image: "images/korean_salad.jpg",
        kind: "veg"
    },
    {
        id: 14,
        keyword: "caesar_chicken",
        name: "Цезарь с цыпленком",
        price: 370,
        category: "salad",
        count: "220 г",
        image: "images/caesar_chicken.jpg",
        kind: "meat"
    },
    {
        id: 15,
        keyword: "caprese",
        name: "Капрезе с моцареллой",
        price: 350,
        category: "salad",
        count: "235 г",
        image: "images/caprese.jpg",
        kind: "veg"
    },
    {
        id: 16,
        keyword: "tuna_salad",
        name: "Салат с тунцом",
        price: 480,
        category: "salad",
        count: "250 г",
        image: "images/tuna_salad.jpg",
        kind: "fish"
    },
    {
        id: 17,
        keyword: "fries_caesar",
        name: "Картофель фри с соусом Цезарь",
        price: 280,
        category: "salad",
        count: "235 г",
        image: "images/fries_caesar.jpg",
        kind: "veg"
    },
    {
        id: 18,
        keyword: "fries_ketchup",
        name: "Картофель фри с кетчупом",
        price: 260,
        category: "salad",
        count: "235 г",
        image: "images/fries_ketchup.jpg",
        kind: "veg"
    },

    {
        id: 19,
        keyword: "orange_juice",
        name: "Апельсиновый сок",
        price: 120,
        category: "drink",
        count: "300 мл",
        image: "images/orange_juice.jpg",
        kind: "cold"
    },
    {
        id: 20,
        keyword: "apple_juice",
        name: "Яблочный сок",
        price: 90,
        category: "drink",
        count: "300 мл",
        image: "images/apple_juice.jpg",
        kind: "cold"
    },
    {
        id: 21,
        keyword: "carrot_juice",
        name: "Морковный сок",
        price: 110,
        category: "drink",
        count: "300 мл",
        image: "images/carrot_juice.jpg",
        kind: "cold"
    },
    {
        id: 22,
        keyword: "cappuccino",
        name: "Капучино",
        price: 180,
        category: "drink",
        count: "300 мл",
        image: "images/cappuccino.jpg",
        kind: "hot"
    },
    {
        id: 23,
        keyword: "green_tea",
        name: "Зеленый чай",
        price: 100,
        category: "drink",
        count: "300 мл",
        image: "images/green_tea.jpg",
        kind: "hot"
    },
    {
        id: 24,
        keyword: "black_tea",
        name: "Черный чай",
        price: 90,
        category: "drink",
        count: "300 мл",
        image: "images/black_tea.jpg",
        kind: "hot"
    },

    {
        id: 25,
        keyword: "baklava",
        name: "Пахлава",
        price: 220,
        category: "dessert",
        count: "300 г",
        image: "images/baklava.jpg",
        kind: "medium"
    },
    {
        id: 26,
        keyword: "cheesecake",
        name: "Чизкейк",
        price: 240,
        category: "dessert",
        count: "125 г",
        image: "images/cheesecake.jpg",
        kind: "small"
    },
    {
        id: 27,
        keyword: "chocolate_cheesecake",
        name: "Шоколадный чизкейк",
        price: 260,
        category: "dessert",
        count: "125 г",
        image: "images/chocolate_cheesecake.jpg",
        kind: "small"
    },
    {
        id: 28,
        keyword: "chocolate_cake",
        name: "Шоколадный торт",
        price: 270,
        category: "dessert",
        count: "140 г",
        image: "images/chocolate_cake.jpg",
        kind: "small"
    },
    {
        id: 29,
        keyword: "donuts3",
        name: "Пончики (3 штуки)",
        price: 410,
        category: "dessert",
        count: "350 г",
        image: "images/donuts3.jpg",
        kind: "medium"
    },
    {
        id: 30,
        keyword: "donuts6",
        name: "Пончики (6 штук)",
        price: 650,
        category: "dessert",
        count: "700 г",
        image: "images/donuts6.jpg",
        kind: "large"
    }
];
