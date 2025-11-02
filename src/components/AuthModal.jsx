import { useState } from 'react'
import { useAuth } from '../store/auth'

export default function AuthModal({ onClose }) {
  const { login, register } = useAuth()
  const [tab,setTab] = useState('login') // login | register
  const [form,setForm] = useState({ email:'', password:'', name:'' })
  const [err,setErr] = useState(''); const [busy,setBusy] = useState(false)

  async function onSubmit(e){
    e.preventDefault(); setErr(''); setBusy(true)
    try{
      if(tab==='login') await login(form.email, form.password)
      else await register(form.email, form.password, form.name)
      onClose()
    }catch(e){ setErr(e?.error || 'Ошибка') } finally{ setBusy(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-md rounded-2xl bg-neutral-900 border border-neutral-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex gap-2">
            <button className={`px-3 py-1 rounded ${tab==='login'?'bg-neutral-700':'bg-neutral-800'}`} onClick={()=>setTab('login')}>Вход</button>
            <button className={`px-3 py-1 rounded ${tab==='register'?'bg-neutral-700':'bg-neutral-800'}`} onClick={()=>setTab('register')}>Регистрация</button>
          </div>
          <button className="text-neutral-400 hover:text-white" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          {tab==='register' && (
            <input className="input w-full" placeholder="Имя (опционально)"
                   value={form.name} onChange={e=>setForm(f=>({...f, name:e.target.value}))}/>
          )}
          <input className="input w-full" type="email" placeholder="Email" required
                 value={form.email} onChange={e=>setForm(f=>({...f, email:e.target.value}))}/>
          <input className="input w-full" type="password" placeholder="Пароль" required
                 value={form.password} onChange={e=>setForm(f=>({...f, password:e.target.value}))}/>
          {err && <div className="text-red-400 text-sm">{err}</div>}
          <button className="btn w-full" disabled={busy}>
            {busy ? 'Отправляю...' : (tab==='login' ? 'Войти' : 'Создать аккаунт')}
          </button>
        </form>
      </div>
    </div>
  )
}