import { useParams, Link } from 'react-router-dom'
import { useActorsStore } from '../store/actors'
import { useShowsStore } from '../store/shows'
import { useMemo } from 'react'

export default function ActorProfile(){
  const { id } = useParams()
  const actorId = String(id)
  const actor = useActorsStore(s=>(s.list || []).find(a=>String(a.id)===actorId))
  const allShows = useShowsStore(s => s.list || [])
  
  // Берём все события, где artistId совпадает (проверяем оба варианта названия поля и приводим к строке для сравнения)
  const shows = useMemo(() => {
    return allShows.filter(sh=> {
      const shArtistId = sh.artistId ?? sh.artist_id
      if (shArtistId == null) return false
      // Сравниваем как числа и как строки для надежности
      return String(shArtistId) === actorId || Number(shArtistId) === Number(actorId)
    })
  }, [allShows, actorId])

  if(!actor) return <div className="p-4">Актёр не найден</div>

  // группируем по городу
  const byCity = shows.reduce((acc, sh)=>{
    const city = sh.venueCity || 'Без города'
    const sess = sh.sessions?.[0]
    acc[city] = acc[city] || []
    acc[city].push({
      id: sh.id,
      title: sh.title,
      dateISO: sess?.dateISO,
      timeISO: sess?.timeISO,
      sessionId: sess?.id,
      venueId: sh.venueId
    })
    return acc
  }, {})

  const cities = Object.keys(byCity)
  const totalEvents = shows.length

  return (
    <section className="space-y-6">
      <div className="card overflow-hidden">
        {actor.avatarUrl ? <img src={actor.avatarUrl} alt={actor.name} className="w-full h-64 object-cover" /> : null}
        <div className="p-4 space-y-2">
          <h1 className="text-2xl font-bold">{actor.name}</h1>
          <p className="text-neutral-300">{actor.bio}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Ближайшие концерты</h2>
          {totalEvents > 0 && (
            <span className="text-sm text-neutral-400">Найдено событий: {totalEvents}</span>
          )}
        </div>

        {!cities.length && <div className="text-neutral-400">Пока нет запланированных концертов.</div>}

        {cities.map(city => (
          <div key={city} className="space-y-2">
            <div className="text-lg font-medium">Город: {city}</div>
            <div className="space-y-2">
              {byCity[city].map(ev => (
                <div key={ev.id} className="flex items-center justify-between p-3 rounded-xl border border-neutral-800">
                  <div className="text-neutral-300">
                    <div className="font-medium">{ev.title}</div>
                    <div className="text-sm text-neutral-400">
                      {ev.dateISO ? new Date(ev.dateISO).toLocaleDateString('ru-RU') : ''} {ev.timeISO || ''}
                    </div>
                  </div>
                  {ev.sessionId ? (
                    <Link className="btn" to={`/shows/${ev.id}/sessions/${ev.sessionId}/zones`}>
                      Выбрать места
                    </Link>
                  ) : (
                    <Link className="btn" to={`/shows/${ev.id}`}>Подробнее</Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
