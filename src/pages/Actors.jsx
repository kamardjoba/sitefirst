import { useMemo, useState } from 'react'
import { useActorsStore } from '../store/actors'
import { useShowsStore } from '../store/shows'
import SearchBar from '../components/SearchBar'
import ActorsGrid from '../components/ActorsGrid'
import Pill from '../components/Pill'

export default function Actors(){
  const [q,setQ]=useState('')
  const [genre,setGenre]=useState('')
  const actors = useActorsStore(s=>s.list)
  const shows = useShowsStore(s=>s.list)
  const showsById = useMemo(()=>Object.fromEntries(shows.map(a=>[a.id,a])),[shows])
  const genres = useMemo(()=> Array.from(new Set(actors.flatMap(a=>a.genres))),[actors])
  const filtered = actors.filter(a => 
    a.name.toLowerCase().includes(q.toLowerCase()) && (!genre || a.genres.includes(genre))
  )
  return (
    <section className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <SearchBar value={q} onChange={setQ} placeholder="Поиск актёра..."/>
        <div className="flex gap-2 flex-wrap">
          <Pill active={!genre} onClick={()=>setGenre('')}>Все жанры</Pill>
          {genres.map(g=> <Pill key={g} active={genre===g} onClick={()=>setGenre(g)}>{g}</Pill>)}
        </div>
      </div>
      <ActorsGrid actors={filtered} showsById={showsById}/>
    </section>
  )
}
