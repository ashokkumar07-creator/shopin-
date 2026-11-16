// api/_shared.js
// Shared Supabase REST API helper used by all Vercel serverless functions.

async function json(path, options = {}) {
  const base = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!base || !key) {
    throw new Error(
      'Shared database is not configured. ' +
      'Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your Vercel project environment variables.'
    );
  }
  const response = await fetch(`${base.replace(/\/$/, '')}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`Database request failed (${response.status}): ${text}`);
  }
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

module.exports = { json };
