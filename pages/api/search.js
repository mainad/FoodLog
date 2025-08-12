export default async function handler(req, res) {
  const apiKey = process.env.FDC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'FDC API key not configured' });

  const q = (req.query.q || '').trim();
  if (!q) return res.status(400).json({ error: 'q query required' });

  try {
    const body = { query: q, pageSize: 10 };
    const r = await fetch(`https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await r.json();
    const items = (data.foods || []).map(f => ({
      id: f.fdcId,
      description: f.description,
      brand: f.brandOwner || null,
      dataType: f.dataType,
      servingSize: f.servingSize || null,
      servingSizeUnit: f.servingSizeUnit || null,
      foodNutrients: f.foodNutrients || []
    }));
    res.json({ items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
