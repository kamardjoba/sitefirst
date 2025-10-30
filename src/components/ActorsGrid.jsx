import { useMemo } from 'react'
import { useShowsStore } from '../store/shows'
import ActorCard from './ActorCard'

export default function ActorsGrid({ actors, showsById }){
  const shows = useShowsStore(s=>s.list)
  const localShowsById = useMemo(() => Object.fromEntries((shows||[]).map(s=>[s.id,s])), [shows])
  const map = showsById || localShowsById
  const list = Array.isArray(actors) ? actors : []

  if (!list.length) {
    return <div className="p-4 text-neutral-400">Список артистов пуст.</div>
  }

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {list.map((a)=> <ActorCard key={a?.id} actor={a} showsById={map} />)}
    </div>
  )
}
