import ShowCard from './ShowCard'

export default function ShowsGrid({ shows = [], actorsById = {} }) {
  const list = (Array.isArray(shows) ? shows : []).map(show => ({
    ...show,
    title: show?.title ?? '',
    description: show?.description ?? '',
    cast: Array.isArray(show?.cast) ? show.cast : [],
    genres: Array.isArray(show?.genres) ? show.genres : [],
    sessions: Array.isArray(show?.sessions) ? show.sessions : [],
  }))

  if (!list.length) {
    return <div className="p-4 text-neutral-400">Постановки не найдены.</div>
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {list.map(show => (
        <ShowCard key={show.id} show={show} actorsById={actorsById} />
      ))}
    </div>
  )
}