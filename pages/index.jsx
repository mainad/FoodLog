import { useState } from 'react';

export default function Home() {
  const [foodLog, setFoodLog] = useState([]);
  const [summary, setSummary] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });

  const USDA_API_KEY = process.env.NEXT_PUBLIC_USDA_API_KEY;

  // Debug-friendly nutrient extractor
  function extractNutrients(food) {
    const nutrientsMap = {
      208: 'calories', // Energy
      203: 'protein',
      205: 'carbs',
      204: 'fat',
    };
    const result = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    (food.foodNutrients || []).forEach(n => {
      const key = nutrientsMap[n.nutrientNumber];
      if (key) {
        const val = Number(n.value);
        if (!isNaN(val)) {
          result[key] = val;
        }
      }
    });
    console.log('[extractNutrients] Result:', result);
    return result;
  }

  async function fetchFoodDetails(fdcId) {
    console.log('[fetchFoodDetails] Fetching details for:', fdcId);
    try {
      const res = await fetch(
        `https://api.nal.usda.gov/fdc/v1/food/${fdcId}?api_key=${USDA_API_KEY}`
      );
      console.log('[fetchFoodDetails] Status:', res.status);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      console.log('[fetchFoodDetails] Raw API data:', data);
      return data;
    } catch (err) {
      console.error('[fetchFoodDetails] Error:', err);
      return null;
    }
  }

  async function addFood(fdcId, qty = 100) {
    console.log('[addFood] Adding FDC ID:', fdcId, 'qty:', qty);
    const details = await fetchFoodDetails(fdcId);
    if (!details) {
      console.warn('[addFood] No details returned for', fdcId);
      return;
    }
    const base = extractNutrients(details);
    const multiplier = qty / 100; // USDA default 100g serving
    const scaled = Object.fromEntries(
      Object.entries(base).map(([k, v]) => [k, v * multiplier])
    );
    console.log('[addFood] Scaled nutrients:', scaled);

    const newLog = [...foodLog, { name: details.description, nutrients: scaled }];
    setFoodLog(newLog);

    // Update summary
    const newSummary = { ...summary };
    Object.keys(scaled).forEach(k => {
      if (newSummary[k] !== undefined) {
        newSummary[k] += scaled[k];
      }
    });
    console.log('[addFood] Updated summary:', newSummary);
    setSummary(newSummary);
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Food Logger Debug</h1>
      <button onClick={() => addFood(1104067, 150)}>Add Sample Food (150g)</button>

      <h2>Summary</h2>
      <pre>{JSON.stringify(summary, null, 2)}</pre>

      <h2>Log</h2>
      <ul>
        {foodLog.map((item, idx) => (
          <li key={idx}>
            {item.name} — {Math.round(item.nutrients.calories)} kcal
          </li>
        ))}
      </ul>
    </div>
  );
}
