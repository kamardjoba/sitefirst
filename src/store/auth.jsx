import { create } from 'zustand'

const KEY = 'auth_token'

export const useAuth = create((set, get) => ({
  token: localStorage.getItem(KEY) || null,
  user: null,

  setToken: (t) => { t ? localStorage.setItem(KEY,t) : localStorage.removeItem(KEY); set({ token:t }) },
  setUser: (u) => set({ user:u }),
  logout: () => { localStorage.removeItem(KEY); set({ token:null, user:null }) },

  me: async () => {
    const t = get().token; if(!t) return null;
    const res = await fetch((import.meta.env.VITE_API_BASE||'') + '/api/auth/me', {
      headers:{ Authorization:`Bearer ${t}` }
    })
    if(!res.ok) return null;
    const u = await res.json(); set({ user:u }); return u;
  },

  login: async (email,password)=>{
    const res = await fetch((import.meta.env.VITE_API_BASE||'') + '/api/auth/login', {
      method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email,password })
    })
    const data = await res.json(); if(!res.ok) throw data;
    localStorage.setItem(KEY, data.token);
    set({ token:data.token, user:data.user });
    return data.user;
  },

  register: async (email,password,name)=>{
    const res = await fetch((import.meta.env.VITE_API_BASE||'') + '/api/auth/register', {
      method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email,password, name })
    })
    const data = await res.json(); if(!res.ok) throw data;
    localStorage.setItem(KEY, data.token);
    set({ token:data.token, user:data.user });
    return data.user;
  }
}))