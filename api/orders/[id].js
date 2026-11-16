const { json } = require('../_shared');

module.exports = async (req, res) => {
  if (req.method !== 'PATCH') { res.setHeader('Allow', 'PATCH'); return res.status(405).json({ error: 'Method not allowed' }); }
  try {
    const id = String(req.query.id || '');
    const rows = await json(`orders?id=eq.${encodeURIComponent(id)}&select=data`, { method: 'GET' });
    if (!rows.length) return res.status(404).json({ error: 'Order not found' });
    const order = rows[0].data;
    const patch = req.body || {};
    if (typeof patch.status === 'string') order.status = patch.status.slice(0, 40);
    if (typeof patch.billPrepared === 'boolean') order.billPrepared = patch.billPrepared;
    if (typeof patch.acceptedAt === 'string') order.acceptedAt = patch.acceptedAt;
    if (Object.prototype.hasOwnProperty.call(patch, 'adminPackage')) order.adminPackage = Number(patch.adminPackage) || 0;
    if (Object.prototype.hasOwnProperty.call(patch, 'finalTotal')) order.finalTotal = Number(patch.finalTotal) || 0;
    const updated = await json(`orders?id=eq.${encodeURIComponent(id)}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ data: order }) });
    return res.status(200).json(order);
  } catch (error) { return res.status(500).json({ error: error.message }); }
};
