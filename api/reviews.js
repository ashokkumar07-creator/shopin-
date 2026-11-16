const { json } = require('./_shared');

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    try {
      const rows = await json('reviews?select=data&order=created_at.asc', { method: 'GET' });
      return res.status(200).json(rows.map(row => row.data));
    } catch (error) { return res.status(500).json({ error: error.message }); }
  }
  if (req.method === 'POST') {
    try {
      const review = req.body || {}, rating = Number(review.rating);
      if (!review.name || !review.text || !Number.isInteger(rating) || rating < 1 || rating > 5) return res.status(400).json({ error: 'Incomplete review' });
      const clean = { name: String(review.name).slice(0, 80), rating, text: String(review.text).slice(0, 1200), date: typeof review.date === 'string' ? review.date.slice(0, 10) : new Date().toISOString().slice(0, 10) };
      await json('reviews', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify([{ data: clean }]) });
      return res.status(201).json(clean);
    } catch (error) { return res.status(500).json({ error: error.message }); }
  }
  res.setHeader('Allow', 'GET, POST'); return res.status(405).json({ error: 'Method not allowed' });
};
