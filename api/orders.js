const { json } = require('./_shared');

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    try {
      const rows = await json('orders?select=data&order=created_at.asc', { method: 'GET' });
      return res.status(200).json(rows.map(row => row.data));
    } catch (error) { return res.status(500).json({ error: error.message }); }
  }
  if (req.method === 'POST') {
    try {
      const order = req.body;
      if (!order?.id || !order.customer?.name || !order.customer?.phone || !Array.isArray(order.items) || !order.items.length) return res.status(400).json({ error: 'Incomplete order' });
      const rows = await json('orders?on_conflict=id', { method: 'POST', headers: { Prefer: 'resolution=ignore-duplicates,return=minimal' }, body: JSON.stringify([{ id: String(order.id), data: order }]) });
      return res.status(201).json(order);
    } catch (error) { return res.status(500).json({ error: error.message }); }
  }
  res.setHeader('Allow', 'GET, POST'); return res.status(405).json({ error: 'Method not allowed' });
};
