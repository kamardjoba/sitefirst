import { useEffect } from 'react'
import { useActorsStore } from '../store/actors'
import { useShowsStore } from '../store/shows'
import { useVenuesStore } from '../store/venues'

export function useBootstrapData(){
  const setActors = useActorsStore(s=>s.set)
  const setShows = useShowsStore(s=>s.set)
  const setVenues = useVenuesStore(s=>s.set)
  useEffect(()=>{
    async function load(){
      const [actors, shows, venues] = await Promise.all([
        fetch('/mocks/actors.json').then(r=>r.json()),
        fetch('/mocks/shows.json').then(r=>r.json()),
        fetch('/mocks/venues.json').then(r=>r.json()),
      ])
      setActors({ list: actors })
      setShows({ list: shows })
      setVenues({ list: venues })
    }
    load()
  },[setActors,setShows,setVenues])
}
