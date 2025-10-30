import { useShowsStore } from '../store/shows';

export default function ShowsGrid() {
  const raw = useShowsStore((s) => s.list) || [];

  // ✅ гарантируем массив и поля, чтобы .slice никогда не падал
  const shows = (Array.isArray(raw) ? raw : []).map((s) => ({
    ...s,
    title: s?.title ?? '',
    description: s?.description ?? '',
    genres: Array.isArray(s?.genres) ? s.genres : [],
    sessions: Array.isArray(s?.sessions) ? s.sessions : [],
  }));

  // если данных ещё нет — можно показать лоадер
  if (!shows.length) return <div>Loading…</div>;

  const top = shows.slice(0, 12);  // ← тут теперь безопасно

  return (
    <div className="grid">
      {top.map((show) => (
        <article key={show.id} className="card">
          <h3>{show.title}</h3>
          <p>{(show.description || '').slice(0, 120)}</p> {/* ✅ безопасно */}
          <div className="muted">
            {(show.genres || []).slice(0, 3).join(', ')}   {/* ✅ безопасно */}
          </div>
        </article>
      ))}
    </div>
  );
}