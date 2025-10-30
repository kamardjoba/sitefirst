import { Link } from 'react-router-dom'

export default function ShowsGrid({ shows, actorsById }) {
  if (!Array.isArray(shows) || shows.length === 0) {
    return <div className="p-4 text-neutral-400">Пока нет подходящих событий.</div>
  }

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {shows.map((show) => {
        const firstSession = show.sessions?.[0]
        const hasSeats = Boolean(firstSession?.id)

        return (
          <article key={show.id} className="card overflow-hidden flex flex-col">
            {/* Кликабельная шапка карточки ведёт на страницу шоу */}
            <Link to={`/shows/${show.id}`} className="block group">
              {show.posterUrl ? (
                <img
                  src={show.posterUrl}
                  alt={show.title}
                  className="w-full h-48 object-cover"
                  loading="lazy"
                />
              ) : null}
              <div className="p-4 space-y-2">
                <h3 className="font-semibold text-lg group-hover:underline">{show.title}</h3>
                <p className="text-sm text-neutral-300 line-clamp-2">
                  {(show.description || '').slice(0, 120)}
                </p>
                <div className="text-xs text-neutral-400">
                  {(show.genres || []).slice(0, 3).join(', ')}
                </div>
                <div className="text-xs text-neutral-400">
                  {show.venueCity ? `Город: ${show.venueCity}` : null}
                </div>
                {firstSession ? (
                  <div className="text-xs text-neutral-400">
                    {firstSession.dateISO} · {firstSession.timeISO}
                  </div>
                ) : null}
              </div>
            </Link>

            {/* Кнопка сразу к выбору мест для первого сеанса (если он есть) */}
            <div className="mt-auto p-4 pt-0">
              {hasSeats ? (
                <Link
                  to={`/shows/${show.id}/sessions/${firstSession.id}/seats`}
                  className="btn w-full"
                >
                  Выбрать места
                </Link>
              ) : (
                <Link to={`/shows/${show.id}`} className="btn w-full">
                  Подробнее
                </Link>
              )}
            </div>
          </article>
        )
      })}
    </div>
  )
}