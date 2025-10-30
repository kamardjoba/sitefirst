import { useEffect } from 'react'
import { useActorsStore } from '../store/actors'
import { useShowsStore } from '../store/shows'
import { useVenuesStore } from '../store/venues'
import { api } from '../utils/api'

// вспомогательные нормализаторы
const normArtistToActor = (a)=> ({
  id: a.id,
  name: a.name ?? '',
  bio: a.bio ?? '',
  genres: a.genre ? [a.genre] : [],      // у артиста один жанр -> делаем массив
  avatarUrl: a.photoUrl ?? a.photo_url ?? '' // на бэке photo_url -> на фронте avatarUrl
})

const normEventToShow = (e)=> {
  // одна «сессия» на базе startsAt
  const d = new Date(e.startsAt || e.starts_at)
  const dateISO = d.toISOString().slice(0,10)
  const timeISO = d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })

  return {
    id: e.id,
    title: e.title || `${e.artistName || e.artist_name || 'Концерт'}`,
    description: '',                       // опционально
    venueId: e.venueId || e.venue_id,
    venueCity: e.city || e.venueCity || e.venue_city,
    rating: 4.8,
    popularity: 100,
    genres: (e.genre ? [e.genre] : []),    // берём жанр артиста если придёт в details
    posterUrl: e.artistPhoto || e.artist_photo || '',
    sessions: [
      {
        id: e.id,          // одна сессия = сам event
        dateISO,
        timeISO,
        basePrice: 100,    // базу для сетки дадим потом из /seats (см. SeatSelect)
        dynamicFactor: 1
      }
    ]
  }
}

const normVenue = (v)=> {
  const rows = v.rows || v.rows_count
  const cols = v.cols || v.cols_count
  // простая сегментация: 1-3 VIP, 4-7 A, остальное B
  const zones = []
  if (rows >= 1) zones.push({ name: 'VIP', rows: [1, Math.min(3, rows)], priceFactor: 1.5, color: '#d97706' })
  if (rows >= 4) zones.push({ name: 'A', rows: [4, Math.min(7, rows)], priceFactor: 1.2, color: '#16a34a' })
  if (rows >= 8) zones.push({ name: 'B', rows: [8, rows],             priceFactor: 1.0, color: '#2563eb' })

  return {
    id: v.id,
    name: v.name,
    city: v.city,
    seatingMap: { rows, cols, zones }
  }
}

export function useBootstrapData(){
  const setActors = useActorsStore(s=>s.set)
  const setShows = useShowsStore(s=>s.set)
  const setVenues = useVenuesStore(s=>s.set)

  useEffect(()=>{
    async function load(){
      const [artistsRes, eventsRes, venuesRes] = await Promise.all([
        api.get('/api/artists'),
        api.get('/api/events'),
        api.get('/api/venues'),
      ])
      const [artists, events, venues] = await Promise.all([artistsRes.json(), eventsRes.json(), venuesRes.json()])

      setActors({ list: Array.isArray(artists) ? artists.map(normArtistToActor) : [] })
      setShows({  list: Array.isArray(events)  ? events.map(normEventToShow)   : [] })
      setVenues({ list: Array.isArray(venues) ? venues.map(normVenue)          : [] })
    }
    load()
  },[setActors,setShows,setVenues])
}