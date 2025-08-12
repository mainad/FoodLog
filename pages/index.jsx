function extractNutrients(food) {
  // nutrientNumber codes (from USDA docs):
  // Energy: 208, Protein: 203, Carbs: 205, Fat: 204, Fiber: 291, Sodium: 307, Calcium: 301, Iron: 303, Potassium: 306, Vit D: 328
  const nutrientsMap = {
    208: 'energy',
    203: 'protein',
    205: 'carbs',
    204: 'fat',
    291: 'fiber',
    307: 'sodium',
    301: 'calcium',
    303: 'iron',
    306: 'potassium',
    328: 'vitaminD',
  };
  const result = {
    energy: 0, protein: 0, carbs: 0, fat: 0, fiber: 0,
    sodium: 0, calcium: 0, iron: 0, potassium: 0, vitaminD: 0
  };
  (food.foodNutrients || []).forEach(n => {
    const key = nutrientsMap[n.nutrientNumber];
    if (key) {
      const val = Number(n.value ?? 0);
      if (!isNaN(val)) result[key] = val;
    }
  });
  return result;
}
