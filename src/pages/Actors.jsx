import { useMemo, useState } from 'react'
import { useActorsStore } from '../store/actors'
import ActorsGrid from '../components/ActorsGrid'
import SearchBar from '../components/SearchBar'

export default function Actors() {
  const actors = useActorsStore(s => s.list) || []
  const [q, setQ] = useState('')

  const filtered = useMemo(()=>{
    const ql = q.trim().toLowerCase()
    return (Array.isArray(actors) ? actors : []).filter(a =>
      !ql || (a?.name || '').toLowerCase().includes(ql)
    )
  }, [actors, q])

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Актёры</h1>
        <SearchBar value={q} onChange={setQ} placeholder="Поиск артиста..." />
      </div>
      <ActorsGrid actors={filtered} />
    </section>
  )
}