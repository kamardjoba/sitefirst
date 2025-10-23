import { useState } from 'react'
export default function CheckoutForm({ onSubmit }){
  const [form, setForm] = useState({ name:'', email:'', phone:'', payment:'card', agree:false })
  const change = (k,v)=>setForm(f=>({...f,[k]:v}))
  const valid = form.name && /.+@.+\..+/.test(form.email) && /^\+?\d[\d\s-]{6,}$/.test(form.phone) && form.agree
  return (
    <form className="space-y-3" onSubmit={(e)=>{e.preventDefault(); if(valid) onSubmit(form)}}>
      <input className="input" placeholder="Имя" value={form.name} onChange={(e)=>change('name', e.target.value)} aria-label="Имя"/>
      <input className="input" placeholder="Email" value={form.email} onChange={(e)=>change('email', e.target.value)} aria-label="Email"/>
      <input className="input" placeholder="Телефон" value={form.phone} onChange={(e)=>change('phone', e.target.value)} aria-label="Телефон"/>
      <div className="flex gap-4">
        <label className="flex items-center gap-2"><input type="radio" name="pay" checked={form.payment==='card'} onChange={()=>change('payment','card')}/>Карта</label>
        <label className="flex items-center gap-2"><input type="radio" name="pay" checked={form.payment==='sbp'} onChange={()=>change('payment','sbp')}/>СБП</label>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={form.agree} onChange={(e)=>change('agree', e.target.checked)} />
        Согласен с условиями
      </label>
      <button className="btn w-full bg-gradient-to-r from-brand-600 to-pink-600 hover:from-brand-700 hover:to-pink-700" disabled={!valid}>Оплатить</button>
    </form>
  )
}
