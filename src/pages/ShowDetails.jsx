import { useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useShowsStore } from '../store/shows'
import { useActorsStore } from '../store/actors'
import SessionList from '../components/SessionList'

export default function ShowDetails(){
  const { id } = useParams()
  const show = useShowsStore(s=>(s.list || []).find(sh=> String(sh.id)===String(id)))
  const actors = useActorsStore(s=>s.list || [])
  const actorsById = useMemo(()=>Object.fromEntries((actors || []).map(a=>[a.id,a])),[actors])
  if(!show) return <div>Постановка не найдена</div>
  
  const genres = Array.isArray(show.genres) ? show.genres : []
  const cast = Array.isArray(show.cast) ? show.cast : []
  
  return (
    <section className="space-y-6">
      <div className="grid md:grid-cols-3 gap-6">
        <img src={show.posterUrl} alt={show.title} className="w-full h-72 object-cover rounded-2xl border border-neutral-800" />
        <div className="md:col-span-2 space-y-3">
          <h1 className="text-2xl font-bold">{show.title}</h1>
          {genres.length > 0 && (
            <div className="flex flex-wrap gap-2">{genres.map(g=><span key={g} className="tag">{g}</span>)}</div>
          )}
          <div className="text-sm text-neutral-300">Рейтинг: {show.rating} · {show.durationMin} мин</div>
          <p className="text-neutral-300">{show.description}</p>
          {cast.length > 0 && (
            <div className="text-sm">Состав: {cast.map(id=> <Link key={id} className="underline mr-1" to={`/actors/${id}`}>{actorsById[id]?.name}</Link>)}</div>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Сеансы</h2>
        <SessionList show={show} />
      </div>
    </section>
  )
}
