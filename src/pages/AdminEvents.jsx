import { useEffect, useState } from "react"
import { api } from "../utils/api"

const API = import.meta.env.VITE_API_BASE

export default function AdminEvents(){
  const [artists,setArtists] = useState([])
  const [venues,setVenues]   = useState([])
  const [form, set] = useState({
    artist_id: "",
    venue_id: "",
    starts_at: "",
    title: "",
    description: "",
    price_vip: "",
    price_a: "",
    price_b: ""
  })
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
      if (form.title) formData.append("title", form.title)
      if (form.description) formData.append("description", form.description)

      const prices = []
      if (form.price_vip !== "" && Number(form.price_vip) >= 0) prices.push({ zone_code: "VIP", base_price: Number(form.price_vip), multiplier: 1 })
      if (form.price_a !== "" && Number(form.price_a) >= 0) prices.push({ zone_code: "A", base_price: Number(form.price_a), multiplier: 1 })
      if (form.price_b !== "" && Number(form.price_b) >= 0) prices.push({ zone_code: "B", base_price: Number(form.price_b), multiplier: 1 })
      if (prices.length) formData.append("prices", JSON.stringify(prices))

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
        set({ artist_id: "", venue_id: "", starts_at: "", title: "", description: "", price_vip: "", price_a: "", price_b: "" })
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
        <div className="rounded-xl border border-neutral-700 bg-neutral-800/50 p-4 space-y-3">
          <h3 className="text-sm font-semibold text-white">Цены за места в секторах</h3>
          <p className="text-xs text-neutral-400">Укажите цену билета для каждого сектора зала. Можно заполнить не все поля.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="block text-sm text-neutral-400">
              <span className="font-medium text-neutral-300">VIP</span>
              <input
                className="input w-full mt-1"
                type="number"
                min="0"
                step="10"
                placeholder="₽"
                value={form.price_vip}
                onChange={e=>set({...form, price_vip:e.target.value})}
              />
            </label>
            <label className="block text-sm text-neutral-400">
              <span className="font-medium text-neutral-300">Сектор A</span>
              <input
                className="input w-full mt-1"
                type="number"
                min="0"
                step="10"
                placeholder="₽"
                value={form.price_a}
                onChange={e=>set({...form, price_a:e.target.value})}
              />
            </label>
            <label className="block text-sm text-neutral-400">
              <span className="font-medium text-neutral-300">Сектор B</span>
              <input
                className="input w-full mt-1"
                type="number"
                min="0"
                step="10"
                placeholder="₽"
                value={form.price_b}
                onChange={e=>set({...form, price_b:e.target.value})}
              />
            </label>
          </div>
        </div>
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
