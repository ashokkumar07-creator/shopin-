
async function json(path, options = {}) {
  const base = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!base || !key) {
    throw new Error('Supabase database is not configured.');
  }

  const response = await fetch(
    `${base.replace(/\/$/, '')}/rest/v1/${path}`,
    {
      ...options,
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Database error (${response.status}): ${error}`);
  }

  const result = await response.text();
  return result ? JSON.parse(result) : null;
}

module.exports = { json };
