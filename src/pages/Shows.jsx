import { useMemo, useState } from 'react'
import { useShowsStore } from '../store/shows'
import { useActorsStore } from '../store/actors'
import ShowsGrid from '../components/ShowsGrid'
import Pill from '../components/Pill'
import DateChips from '../components/DateChips'
import SearchBar from '../components/SearchBar'

const getSoonestTimestamp = show => {
  const sessions = Array.isArray(show?.sessions) ? show.sessions : []
  if (!sessions.length) return Number.MAX_SAFE_INTEGER
  return Math.min(
    ...sessions.map(s => {
      if (!s.dateISO) return Number.MAX_SAFE_INTEGER
      const ts = Date.parse(s.dateISO)
      return Number.isNaN(ts) ? Number.MAX_SAFE_INTEGER : ts
    })
  )
}

export default function Shows(){
  const shows = useShowsStore(s=>s.list) || []
  const actors = useActorsStore(s=>s.list) || []
  const [q,setQ]=useState('')
  const [genre,setGenre]=useState('')
  const [sort,setSort] = useState('popular')
  const [dateISO,setDateISO] = useState('')
  const [city,setCity] = useState('')

  const cities = useMemo(()=> (
    Array.from(new Set((shows||[]).map(s=>s.venueCity).filter(Boolean))).sort()
  ),[shows])

  const actorsById = useMemo(()=>Object.fromEntries(actors.map(a=>[a.id,a])),[actors])

  const genres = useMemo(()=> (
    Array.from(
      new Set(
        (shows||[]).flatMap(s=>Array.isArray(s.genres) ? s.genres : [])
      )
    ).filter(Boolean)
  ),[shows])

  const filtered = useMemo(()=>{
    const ql = q.trim().toLowerCase()
    return (shows || [])
      .filter(s => {
        const title = (s?.title || '').toLowerCase()
        return !ql || title.includes(ql)
      })
      .filter(s => !genre || (Array.isArray(s.genres) && s.genres.includes(genre)))
      .filter(s => !city || s.venueCity === city)
      .filter(s => {
        if (!dateISO) return true
        const sessions = Array.isArray(s.sessions) ? s.sessions : []
        return sessions.some(sess => sess.dateISO === dateISO)
      })
      .sort((a,b)=>{
        if (sort === 'rating') {
          return (b.rating || 0) - (a.rating || 0)
        }
        if (sort === 'date') {
          return getSoonestTimestamp(a) - getSoonestTimestamp(b)
        }
        return (b.popularity || 0) - (a.popularity || 0)
      })
  }, [shows, q, genre, city, dateISO, sort])

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3">
        <SearchBar value={q} onChange={setQ} placeholder="Поиск постановки..."/>
        <div className="flex items-center gap-3 flex-wrap">
          <DateChips value={dateISO} onChange={setDateISO} />
          <select className="select" value={city} onChange={e=>setCity(e.target.value)} aria-label="Город">
            <option value="">Все города</option>
            {cities.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
          <Pill active={!genre} onClick={()=>setGenre('')}>Все жанры</Pill>
          {genres.map(g=> <Pill key={g} active={genre===g} onClick={()=>setGenre(g)}>{g}</Pill>)}
          <select className="select ml-auto" value={sort} onChange={(e)=>setSort(e.target.value)} aria-label="Сортировка">
            <option value="popular">По популярности</option>
            <option value="rating">По рейтингу</option>
            <option value="date">По дате</option>
          </select>
        </div>
      </div>
      <ShowsGrid shows={filtered} actorsById={actorsById}/>
    </section>
  )
}
