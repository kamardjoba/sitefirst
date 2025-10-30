const BASE = import.meta.env.VITE_API_BASE?.replace(/\/+$/,'') || '';
export const api = {
  get: (p) => fetch(`${BASE}${p}`, { credentials: 'omit' }),
  post: (p, body) => fetch(`${BASE}${p}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
};