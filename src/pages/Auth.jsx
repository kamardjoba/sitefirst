// src/pages/Auth.jsx
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../store/auth'

export default function AuthPage(){
  const { token, user, login, register, me } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [tab, setTab] = useState('login') // 'login' | 'register'
  const [form, setForm] = useState({ email:'', password:'', name:'' })
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  const backTo = useMemo(()=>{
    // куда возвращаться после логина
    const from = (location.state && location.state.from) || '/'
    return typeof from === 'string' ? from : '/'
  }, [location.state])

  useEffect(()=>{
    if(token && !user) me()
    if(token && user) navigate(backTo, { replace: true })
  }, [token, user])

  async function onSubmit(e){
    e.preventDefault()
    setErr(''); setBusy(true)
    try{
      if(tab === 'login'){
        await login(form.email, form.password)
      } else {
        await register(form.email, form.password, form.name)
      }
      navigate(backTo, { replace: true })
    }catch(e){
      setErr(e?.error || 'Ошибка')
    }finally{
      setBusy(false)
    }
  }

  return (
    <section className="max-w-md mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold text-center">Личный кабинет</h1>

      <div className="flex gap-2 justify-center">
        <button
          className={`px-3 py-1 rounded ${tab==='login' ? 'bg-neutral-700' : 'bg-neutral-800'}`}
          onClick={()=>setTab('login')}
        >Вход</button>
        <button
          className={`px-3 py-1 rounded ${tab==='register' ? 'bg-neutral-700' : 'bg-neutral-800'}`}
          onClick={()=>setTab('register')}
        >Регистрация</button>
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        {tab==='register' && (
          <input
            className="input w-full"
            placeholder="Имя (опционально)"
            value={form.name}
            onChange={e=>setForm(f=>({...f, name:e.target.value}))}
          />
        )}
        <input
          className="input w-full"
          type="email"
          placeholder="Email"
          required
          value={form.email}
          onChange={e=>setForm(f=>({...f, email:e.target.value}))}
        />
        <input
          className="input w-full"
          type="password"
          placeholder="Пароль"
          required
          value={form.password}
          onChange={e=>setForm(f=>({...f, password:e.target.value}))}
        />

        {err && <div className="text-red-400 text-sm">{err}</div>}

        <button className="btn w-full" disabled={busy}>
          {busy ? 'Отправляю...' : (tab==='login' ? 'Войти' : 'Создать аккаунт')}
        </button>
      </form>
    </section>
  )
}