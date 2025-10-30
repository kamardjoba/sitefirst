const BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/+$/,''); // например https://backdat-production.up.railway.app

export const api = {
  get: (p) => fetch(`${BASE}${p}`),
  post: (p, body) => fetch(`${BASE}${p}`, {
    method: 'POST',
    headers: { 'Content-Type':'application/json' },
    body: JSON.stringify(body)
  }),
  postForm: (p, formData) => fetch(`${BASE}${p}`, {
    method: 'POST',
    body: formData
  })
};