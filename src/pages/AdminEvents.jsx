import { useEffect, useState } from "react"
import { api } from "../utils/api"

const API = import.meta.env.VITE_API_BASE

export default function AdminEvents(){
  const [artists,setArtists] = useState([])
  const [venues,setVenues]   = useState([])
  const [form,set] = useState({ artist_id:"", venue_id:"", starts_at:"", title:"", description:"" })
  const [photos, setPhotos] = useState([])
  const [busy, setBusy] = useState(false)

  useEffect(()=>{
    Promise.all([api.get('/api/artists'), api.get('/api/venues')])
      .then(async ([a,v])=>[await a.json(), await v.json()])
      .then(([a,v])=>{ setArtists(a); setVenues(v) })
  },[])

  const submit = async (e)=>{
    e.preventDefault()
    if(busy) return
    
    setBusy(true)
    try {
      const formData = new FormData()
      formData.append("artist_id", form.artist_id)
      formData.append("venue_id", form.venue_id)
      formData.append("starts_at", form.starts_at)
      if(form.title) formData.append("title", form.title)
      if(form.description) formData.append("description", form.description)
      
      // Добавляем фото
      photos.forEach((photo) => {
        formData.append("photos", photo)
      })

      const res = await fetch(`${API}/api/admin/events`, {
        method: "POST",
        body: formData
      })

      if(res.ok) {
        alert("Событие создано")
        // Сброс формы
        set({ artist_id:"", venue_id:"", starts_at:"", title:"", description:"" })
        setPhotos([])
        // Сброс input file
        const fileInput = document.querySelector('input[type="file"]')
        if(fileInput) fileInput.value = ''
      } else {
        alert("Ошибка создания события")
      }
    } catch(err) {
      console.error(err)
      alert("Ошибка создания события")
    } finally {
      setBusy(false)
    }
  }

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files || [])
    setPhotos(files)
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
        <textarea 
          className="input w-full min-h-[100px]" 
          placeholder="Описание события (опционально)"
          value={form.description} 
          onChange={e=>set({...form, description:e.target.value})}
        />
        <div>
          <label className="block text-sm mb-2">Фото события (опционально)</label>
          <p className="text-xs text-neutral-400 mb-2">Первое фото будет главным, остальные - дополнительными</p>
          <input 
            type="file" 
            accept="image/*" 
            multiple 
            onChange={handlePhotoChange}
            className="input w-full"
          />
          {photos.length > 0 && (
            <p className="text-sm text-neutral-400 mt-1">Выбрано фото: {photos.length}</p>
          )}
        </div>
        <button className="btn" disabled={busy}>{busy ? "Создаю..." : "Создать"}</button>
      </form>
    </div>
  )
}
