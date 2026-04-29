const meals = [
    { dayOfWeek: "MONDAY", mealType: "BREAKFAST", recipeName: "Huevos Ahogados" },
    { dayOfWeek: "MONDAY", mealType: "LUNCH", recipeName: "Pechuga de Pollo" },
    { dayOfWeek: "TUESDAY", mealType: "BREAKFAST", recipeName: "Panqueques" },
];

const grouped = meals.reduce((acc, meal) => {
    const day = meal.dayOfWeek;
    if (!acc[day]) acc[day] = [];
    acc[day].push(meal);
    return acc;
}, {});

console.log(JSON.stringify(grouped, null, 2));
