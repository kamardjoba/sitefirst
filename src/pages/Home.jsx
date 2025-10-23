import { useState, useMemo } from 'react'
import ShowsGrid from '../components/ShowsGrid'
import { useShowsStore } from '../store/shows'
import { useActorsStore } from '../store/actors'
import { useVenuesStore } from '../store/venues'
import Hero from '../components/Hero'
import DateChips from '../components/DateChips'

export default function Home(){
  const [q,setQ]=useState('')
  const [city,setCity]=useState('')
  const [date,setDate]=useState('')
  const shows = useShowsStore(s=>s.list)
  const actors = useActorsStore(s=>s.list)
  const venues = useVenuesStore(s=>s.list)
  const actorsById = useMemo(()=>Object.fromEntries(actors.map(a=>[a.id,a])),[actors])
  const venueById = useMemo(()=>Object.fromEntries(venues.map(v=>[v.id,v])),[venues])
  const cities = useMemo(()=> Array.from(new Set(venues.map(v=>v.city))),[venues])

  const filtered = shows.filter(s => {
    const matchQ = s.title.toLowerCase().includes(q.toLowerCase())
    const matchCity = !city || venueById[s.venueId]?.city===city
    const matchDate = !date || s.sessions.some(ss => ss.dateISO===date)
    return matchQ && matchCity && matchDate
  })

  return (
    <section className="space-y-6">
      <Hero q={q} setQ={setQ} cities={cities} activeCity={city} onCity={setCity} />
      <div className="space-y-3">
        <h2 className="text-xl font-semibold">По дате</h2>
        <DateChips value={date} onChange={setDate} />
      </div>
      <ShowsGrid shows={filtered.slice(0,9)} actorsById={actorsById}/>
    </section>
  )
}
