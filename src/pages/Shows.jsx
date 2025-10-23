import { useMemo, useState } from 'react'
import { useShowsStore } from '../store/shows'
import { useActorsStore } from '../store/actors'
import ShowsGrid from '../components/ShowsGrid'
import Pill from '../components/Pill'
import SearchBar from '../components/SearchBar'

export default function Shows(){
  const shows = useShowsStore(s=>s.list)
  const actors = useActorsStore(s=>s.list)
  const [q,setQ]=useState('')
  const [genre,setGenre]=useState('')
  const [sort,setSort]=useState('popular')
  const actorsById = useMemo(()=>Object.fromEntries(actors.map(a=>[a.id,a])),[actors])
  const genres = useMemo(()=> Array.from(new Set(shows.flatMap(a=>a.genres))),[shows])
  const filtered = shows
    .filter(s=> s.title.toLowerCase().includes(q.toLowerCase()) && (!genre || s.genres.includes(genre)))
    .sort((a,b)=> sort==='rating' ? b.rating - a.rating : sort==='date' ? new Date(a.sessions[0].dateISO)-new Date(b.sessions[0].dateISO) : b.popularity - a.popularity)
  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3">
        <SearchBar value={q} onChange={setQ} placeholder="Поиск постановки..."/>
        <div className="flex items-center gap-3 flex-wrap">
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
