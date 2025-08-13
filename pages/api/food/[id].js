export default async function handler(req, res) {
  const apiKey = process.env.FDC_API_KEY;
  const { id } = req.query;
  if (!apiKey) return res.status(500).json({ error: 'FDC API key not configured' });
  if (!id) return res.status(400).json({ error: 'food id required' });
  try {
    const r = await fetch(`https://api.nal.usda.gov/fdc/v1/food/${encodeURIComponent(id)}?api_key=${apiKey}`);
    const data = await r.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
