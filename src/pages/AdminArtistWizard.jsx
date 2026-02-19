import { useEffect, useMemo, useState } from "react"

const API = import.meta.env.VITE_API_BASE

function emptyRow(){
  return {
    mode: "existing",       // existing | new
    // для existing:
    venue_id: "",
    // для new:
    venue_name: "",
    city: "",
    address: "",
    rows: 12,
    cols: 20,
    // общее:
    starts_at: "",          // "2025-12-01T19:00"
    title: "",
    description: "",
    photos: []              // массив файлов
  }
}

export default function AdminArtistWizard(){
  // шаг 1: артист
  const [artist, setArtist] = useState({ name:"", genre:"", bio:"", photo:null, cast:[], rating:"" })
  // существующие площадки для выбора
  const [venues, setVenues] = useState([])
  // существующие артисты для выбора состава
  const [allArtists, setAllArtists] = useState([])
  // шаг 2: расписание из нескольких строк
  const [rows, setRows] = useState([ emptyRow() ])
  const [busy, setBusy] = useState(false)
  const canSubmit = useMemo(()=>{
    if(!artist.name) return false
    if(!rows.length) return false
    return rows.every(r => {
      const hasDate = !!r.starts_at
      if(r.mode === "existing") return hasDate && !!r.venue_id
      return hasDate && !!r.venue_name && !!r.city && r.rows>0 && r.cols>0
    })
  }, [artist, rows])

  useEffect(()=>{
    async function load(){
      const [venuesRes, artistsRes] = await Promise.all([
        fetch(`${API}/api/venues`),
        fetch(`${API}/api/artists`)
      ])
      const [venuesJson, artistsJson] = await Promise.all([
        venuesRes.json(),
        artistsRes.json()
      ])
      setVenues(Array.isArray(venuesJson) ? venuesJson : [])
      setAllArtists(Array.isArray(artistsJson) ? artistsJson : [])
    }
    load()
  },[])

  const addRow = ()=> setRows(rs => [...rs, emptyRow()])
  const delRow = (idx)=> setRows(rs => rs.filter((_,i)=> i!==idx))
  const patchRow = (idx, patch)=> setRows(rs => rs.map((r,i)=> i===idx ? { ...r, ...patch } : r))

  async function createArtist(){
    const fd = new FormData()
    fd.append("name", artist.name)
    if(artist.genre) fd.append("genre", artist.genre)
    if(artist.bio) fd.append("bio", artist.bio)
    if(artist.photo) fd.append("photo", artist.photo)
    if(artist.rating) fd.append("rating", artist.rating)
    if(artist.cast && artist.cast.length > 0) {
      fd.append("cast", JSON.stringify(artist.cast))
    }
    const res = await fetch(`${API}/api/admin/artists`, { method:"POST", body: fd })
    if(!res.ok) throw new Error("artist_create_failed")
    return await res.json() // { id, ... }
  }

  async function ensureVenue(row){
    if(row.mode === "existing"){
      return { id: Number(row.venue_id) }
    }
    // создаём новую площадку
    const payload = {
      name: row.venue_name,
      city: row.city,
      address: row.address || "",
      rows: Number(row.rows)||0,
      cols: Number(row.cols)||0
    }
    const res = await fetch(`${API}/api/admin/venues`, {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify(payload)
    })
    if(!res.ok) throw new Error("venue_create_failed")
    return await res.json() // { id, name, city, ... }
  }

  async function createEvent(artist_id, row, venue_id){
    const formData = new FormData()
    formData.append("artist_id", artist_id)
    formData.append("venue_id", venue_id)
    formData.append("starts_at", row.starts_at) // "YYYY-MM-DDTHH:mm"
    if(row.title) formData.append("title", row.title)
    if(row.description) formData.append("description", row.description)
    
    // Добавляем фото если есть
    if(Array.isArray(row.photos) && row.photos.length > 0) {
      row.photos.forEach((photo) => {
        formData.append("photos", photo)
      })
    }
    
    const res = await fetch(`${API}/api/admin/events`, {
      method:"POST",
      body: formData
    })
    if(!res.ok) throw new Error("event_create_failed")
    return await res.json()
  }

  async function onSubmit(e){
    e.preventDefault()
    if(!canSubmit || busy) return
    setBusy(true)
    try{
      // 1) создаём артиста
      const a = await createArtist()
      // 2) по каждой строке: ensure venue -> create event
      for(const r of rows){
        const v = await ensureVenue(r)
        await createEvent(a.id, r, v.id)
      }
      alert("Готово: артист и события созданы 🎉")
      // сброс формы
      setArtist({ name:"", genre:"", bio:"", photo:null, cast:[], rating:"" })
      setRows([ emptyRow() ])
      // Сброс всех input file
      document.querySelectorAll('input[type="file"]').forEach(input => input.value = '')
      // Перезагружаем список артистов для обновления состава
      const artistsRes = await fetch(`${API}/api/artists`)
      const artistsJson = await artistsRes.json()
      setAllArtists(Array.isArray(artistsJson) ? artistsJson : [])
    }catch(err){
      console.error(err)
      alert("Ошибка при создании. Проверь данные и логи.")
    }finally{
      setBusy(false)
    }
  }

  return (
    <div className="p-4 space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold">Админ · Мастер добавления артиста</h1>

      {/* Шаг 1 — артист */}
      <form onSubmit={onSubmit} className="space-y-6">
        <fieldset className="space-y-3 border border-neutral-800 rounded-2xl p-4">
          <legend className="px-2 text-lg font-semibold">1) Артист</legend>
          <input className="input w-full" placeholder="Имя артиста *"
                 value={artist.name} onChange={e=>setArtist(a=>({...a, name:e.target.value}))} required/>
          <input className="input w-full" placeholder="Жанр"
                 value={artist.genre} onChange={e=>setArtist(a=>({...a, genre:e.target.value}))}/>
          <input
            type="number"
            step="0.1"
            min="0"
            max="10"
            placeholder="Рейтинг (опционально, от 0 до 10)"
            value={artist.rating}
            onChange={e=>setArtist(a=>({...a, rating:e.target.value}))}
            className="input w-full"
          />
          <textarea className="input w-full min-h-[100px]" placeholder="Биография"
                    value={artist.bio} onChange={e=>setArtist(a=>({...a, bio:e.target.value}))}/>
          <div>
            <label className="block text-sm mb-2">Состав (опционально) - выберите других артистов</label>
            <select
              multiple
              className="input w-full min-h-[100px]"
              value={artist.cast.map(String)}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, option => Number(option.value));
                setArtist(a => ({ ...a, cast: selected }));
              }}
            >
              {allArtists.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
            <p className="text-xs text-neutral-400 mt-1">Удерживайте Ctrl/Cmd для выбора нескольких</p>
            {artist.cast.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {artist.cast.map(id => {
                  const actor = allArtists.find(a => a.id === id);
                  return actor ? (
                    <span key={id} className="tag">
                      {actor.name}
                      <button
                        type="button"
                        onClick={() => setArtist(a => ({ ...a, cast: a.cast.filter(c => c !== id) }))}
                        className="ml-2 text-red-400 hover:text-red-300"
                      >
                        ×
                      </button>
                    </span>
                  ) : null;
                })}
              </div>
            )}
          </div>
          <input type="file" accept="image/*"
                 onChange={e=>setArtist(a=>({...a, photo: e.target.files?.[0] || null }))}/>
        </fieldset>

        {/* Шаг 2 — расписание */}
        <fieldset className="space-y-4 border border-neutral-800 rounded-2xl p-4">
          <legend className="px-2 text-lg font-semibold">2) Концерты (несколько дат/городов)</legend>

          {rows.map((r, idx)=>(
            <div key={idx} className="grid gap-3 md:grid-cols-12 items-end border border-neutral-800 rounded-xl p-3">
              <div className="md:col-span-2">
                <label className="block text-sm mb-1">Площадка</label>
                <select className="select w-full" value={r.mode}
                        onChange={e=>patchRow(idx,{ mode: e.target.value })}>
                  <option value="existing">Выбрать</option>
                  <option value="new">Создать</option>
                </select>
              </div>

              {r.mode === "existing" ? (
                <>
                  <div className="md:col-span-4">
                    <label className="block text-sm mb-1">Существующая площадка</label>
                    <select className="select w-full" value={r.venue_id}
                            onChange={e=>patchRow(idx,{ venue_id: e.target.value })}>
                      <option value="">— выбери площадку —</option>
                      {venues.map(v => (
                        <option key={v.id} value={v.id}>{v.name} · {v.city}</option>
                      ))}
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <div className="md:col-span-3">
                    <label className="block text-sm mb-1">Название площадки *</label>
                    <input className="input w-full" value={r.venue_name}
                           onChange={e=>patchRow(idx,{ venue_name: e.target.value })} required/>
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-sm mb-1">Город *</label>
                    <input className="input w-full" value={r.city}
                           onChange={e=>patchRow(idx,{ city: e.target.value })} required/>
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-sm mb-1">Адрес</label>
                    <input className="input w-full" value={r.address}
                           onChange={e=>patchRow(idx,{ address: e.target.value })}/>
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-sm mb-1">Рядов</label>
                    <input className="input w-full" type="number" min="1" value={r.rows}
                           onChange={e=>patchRow(idx,{ rows: Number(e.target.value) })}/>
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-sm mb-1">Мест/ряд</label>
                    <input className="input w-full" type="number" min="1" value={r.cols}
                           onChange={e=>patchRow(idx,{ cols: Number(e.target.value) })}/>
                  </div>
                </>
              )}

              <div className="md:col-span-3">
                <label className="block text-sm mb-1">Дата и время *</label>
                <input className="input w-full" type="datetime-local" required
                       value={r.starts_at}
                       onChange={e=>patchRow(idx,{ starts_at: e.target.value })}/>
              </div>

              <div className="md:col-span-3">
                <label className="block text-sm mb-1">Название события (опц.)</label>
                <input className="input w-full" placeholder="Напр. Warsaw"
                       value={r.title} onChange={e=>patchRow(idx,{ title: e.target.value })}/>
              </div>

              <div className="md:col-span-12">
                <label className="block text-sm mb-1">Описание события (опц.)</label>
                <textarea className="input w-full min-h-[80px]" placeholder="Описание события"
                          value={r.description} onChange={e=>patchRow(idx,{ description: e.target.value })}/>
              </div>

              <div className="md:col-span-12">
                <label className="block text-sm mb-1">Фото события (опц.)</label>
                <p className="text-xs text-neutral-400 mb-2">Первое фото будет главным</p>
                <input 
                  type="file" 
                  accept="image/*" 
                  multiple 
                  onChange={e=>patchRow(idx,{ photos: Array.from(e.target.files || []) })}
                  className="input w-full"
                />
                {r.photos && r.photos.length > 0 && (
                  <p className="text-sm text-neutral-400 mt-1">Выбрано фото: {r.photos.length}</p>
                )}
              </div>

              <div className="md:col-span-1 flex gap-2 md:justify-end">
                <button type="button" className="btn" onClick={addRow}>+</button>
                {rows.length>1 && (
                  <button type="button" className="btn" onClick={()=>delRow(idx)}>−</button>
                )}
              </div>
            </div>
          ))}
        </fieldset>

        <div className="flex gap-3">
          <button className="btn" disabled={!canSubmit || busy}>
            {busy ? "Сохраняю..." : "Создать артиста и события"}
          </button>
        </div>
      </form>
    </div>
  )
}