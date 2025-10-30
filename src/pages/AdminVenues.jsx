import { useState } from "react"
const API = import.meta.env.VITE_API_BASE;

export default function AdminVenues(){
  const [form,set] = useState({ name:"", city:"", address:"", rows:10, cols:18 })
  const submit = async (e)=>{
    e.preventDefault()
    const res = await fetch(`${API}/api/admin/venues`,{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify(form)
    })
    alert(res.ok ? "Зал создан" : "Ошибка создания зала")
  }
  return (
    <div className="p-4 space-y-4 max-w-xl">
      <h1 className="text-2xl font-bold">Админ · Залы</h1>
      <form onSubmit={submit} className="space-y-3">
        <input className="input" placeholder="Название" value={form.name} onChange={e=>set({...form, name:e.target.value})}/>
        <input className="input" placeholder="Город" value={form.city} onChange={e=>set({...form, city:e.target.value})}/>
        <input className="input" placeholder="Адрес" value={form.address} onChange={e=>set({...form, address:e.target.value})}/>
        <div className="flex gap-2">
          <input className="input" type="number" placeholder="Ряды" value={form.rows} onChange={e=>set({...form, rows:Number(e.target.value)})}/>
          <input className="input" type="number" placeholder="Мест в ряду" value={form.cols} onChange={e=>set({...form, cols:Number(e.target.value)})}/>
        </div>
        <button className="btn">Создать</button>
      </form>
    </div>
  )
}
