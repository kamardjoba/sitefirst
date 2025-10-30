import { useEffect, useState } from "react"
import { api } from "../utils/api"

export default function AdminEvents(){
  const [artists,setArtists] = useState([])
  const [venues,setVenues]   = useState([])
  const [form,set] = useState({ artist_id:"", venue_id:"", starts_at:"", title:"" })

  useEffect(()=>{
    Promise.all([api.get('/api/artists'), api.get('/api/venues')])
      .then(async ([a,v])=>[await a.json(), await v.json()])
      .then(([a,v])=>{ setArtists(a); setVenues(v) })
  },[])

  const submit = async (e)=>{
    e.preventDefault()
    const res = await api.post('/api/admin/events', form)
    alert(res.ok ? "Событие создано" : "Ошибка создания события")
  }

  return (
    <div className="p-4 space-y-4 max-w-xl">
      <h1 className="text-2xl font-bold">Админ · События</h1>
      <form onSubmit={submit} className="space-y-3">
        <select className="select w-full" value={form.artist_id} onChange={e=>set({...form, artist_id:Number(e.target.value)})} required>
          <option value="">Артист</option>
          {artists.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        <select className="select w-full" value={form.venue_id} onChange={e=>set({...form, venue_id:Number(e.target.value)})} required>
          <option value="">Площадка</option>
          {venues.map(v=><option key={v.id} value={v.id}>{v.name} · {v.city}</option>)}
        </select>
        <input className="input w-full" type="datetime-local" value={form.starts_at} onChange={e=>set({...form, starts_at:e.target.value})} required/>
        <input className="input w-full" placeholder="Название события (опционально)" value={form.title} onChange={e=>set({...form, title:e.target.value})}/>
        <button className="btn">Создать</button>
      </form>
    </div>
  )
}
