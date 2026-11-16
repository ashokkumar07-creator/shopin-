// api/config.js
// Stores shop open/close config in Supabase.
// GET → current config  |  PUT { openTime, closeTime, autoMode, manualOpen } → save config

const { json } = require('./_shared');

const DEFAULT_CONFIG = { openTime: '07:00', closeTime: '10:00', autoMode: false, manualOpen: true };
const CONFIG_ID = 'shop_config';

async function getConfig() {
  try {
    const rows = await json(`config?id=eq.${CONFIG_ID}&select=data`, { method: 'GET' });
    if (rows && rows.length > 0) return { ...DEFAULT_CONFIG, ...rows[0].data };
  } catch {}
  return DEFAULT_CONFIG;
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'GET') {
    try {
      return res.status(200).json(await getConfig());
    } catch (error) {
      return res.status(200).json(DEFAULT_CONFIG);
    }
  }
  if (req.method === 'PUT') {
    try {
      const body = req.body || {};
      const cfg = {
        openTime: String(body.openTime || DEFAULT_CONFIG.openTime).slice(0, 5),
        closeTime: String(body.closeTime || DEFAULT_CONFIG.closeTime).slice(0, 5),
        autoMode: !!body.autoMode,
        manualOpen: !!body.manualOpen
      };
      await json(`config?id=eq.${CONFIG_ID}`, {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify([{ id: CONFIG_ID, data: cfg }])
      });
      return res.status(200).json(cfg);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
  res.setHeader('Allow', 'GET, PUT');
  return res.status(405).json({ error: 'Method not allowed' });
};
