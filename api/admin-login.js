// api/admin-login.js
// Server-side admin authentication — credentials are NEVER sent to the browser.
// POST { username, password } → { ok: true, token: "..." } or 401

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || '8838512878';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Ashokkumar@2006';
// A simple signed token: base64(username:timestamp) — good enough for a demo.
// In production use a proper JWT or session library.
function makeToken(username) {
  const payload = Buffer.from(`${username}:${Date.now()}`).toString('base64');
  return payload;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const body = req.body || {};
    const { username, password } = body;
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      return res.status(200).json({ ok: true, token: makeToken(username) });
    }
    return res.status(401).json({ ok: false, error: 'Incorrect username or password.' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
