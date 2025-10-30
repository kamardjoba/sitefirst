import { useEffect } from 'react';
import { useActorsStore } from '../store/actors';
import { useShowsStore } from '../store/shows';
import { useVenuesStore } from '../store/venues';
import { api } from '../utils/api';

const normShow = (s = {}) => ({
  id: s.id,
  title: s.title ?? '',
  description: s.description ?? '',
  venueId: s.venueId ?? null,
  rating: Number(s.rating ?? 0),
  popularity: Number(s.popularity ?? 0),
  genres: Array.isArray(s.genres) ? s.genres : [],
  posterUrl: s.posterUrl ?? '',
  sessions: Array.isArray(s.sessions) ? s.sessions : [],
});

export function useBootstrapData() {
  const setActors = useActorsStore((s) => s.set);
  const setShows  = useShowsStore((s) => s.set);
  const setVenues = useVenuesStore((s) => s.set);

  useEffect(() => {
    (async () => {
      const [actors, shows, venues] = await Promise.all([
        api.get('/api/actors').then(r => r.json()).catch(() => []),
        api.get('/api/shows').then(r => r.json()).catch(() => []),
        api.get('/api/venues').then(r => r.json()).catch(() => []),
      ]);
      setActors({ list: Array.isArray(actors) ? actors : [] });
      setShows ({ list: (Array.isArray(shows) ? shows : []).map(normShow) });
      setVenues({ list: Array.isArray(venues) ? venues : [] });
    })();
  }, [setActors, setShows, setVenues]);
}