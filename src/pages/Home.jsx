import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { useShowsStore } from '../store/shows'
import { useActorsStore } from '../store/actors'
import Hero from '../components/Hero'
import ShowsGrid from '../components/ShowsGrid'
import { FaShieldAlt, FaClock, FaTicketAlt, FaStar, FaTheaterMasks } from 'react-icons/fa'

const getSoonestTimestamp = show => {
  const sessions = Array.isArray(show?.sessions) ? show.sessions : []
  if (!sessions.length) return Number.MAX_SAFE_INTEGER
  return Math.min(
    ...sessions.map(s => {
      if (!s.dateISO) return Number.MAX_SAFE_INTEGER
      const ts = Date.parse(s.dateISO)
      return Number.isNaN(ts) ? Number.MAX_SAFE_INTEGER : ts
    })
  )
}

export default function Home(){
  const shows = useShowsStore(s => s.list) || []
  const actors = useActorsStore(s => s.list) || []
  const [q, setQ] = useState('')
  const [activeCity, setActiveCity] = useState('')

  const cities = useMemo(() => (
    Array.from(new Set((shows || []).map(s => s.venueCity).filter(Boolean))).sort()
  ), [shows])

  const actorsById = useMemo(() => Object.fromEntries(actors.map(a => [a.id, a])), [actors])

  // Популярные постановки (топ 6 по популярности)
  const popularShows = useMemo(() => {
    return [...shows]
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
      .slice(0, 6)
  }, [shows])

  // Ближайшие события (следующие 6 по дате)
  const upcomingShows = useMemo(() => {
    return [...shows]
      .filter(s => getSoonestTimestamp(s) < Number.MAX_SAFE_INTEGER)
      .sort((a, b) => getSoonestTimestamp(a) - getSoonestTimestamp(b))
      .slice(0, 6)
  }, [shows])

  // Жанры для быстрого доступа
  const genres = useMemo(() => (
    Array.from(
      new Set(
        (shows || []).flatMap(s => Array.isArray(s.genres) ? s.genres : [])
      )
    ).filter(Boolean).slice(0, 6)
  ), [shows])

  return (
    <section className="space-y-12">
      {/* Hero секция с поиском */}
      <Hero 
        q={q} 
        setQ={setQ} 
        cities={cities} 
        activeCity={activeCity} 
        onCity={setActiveCity}
      />

      {/* Секция преимуществ */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-500/20 text-brand-400 mb-3">
            <FaShieldAlt className="text-xl" />
          </div>
          <h3 className="font-semibold mb-1">Безопасная оплата</h3>
          <p className="text-sm text-neutral-400">Защищённые транзакции и возврат средств</p>
        </div>
        <div className="card p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-pink-500/20 text-pink-400 mb-3">
            <FaClock className="text-xl" />
          </div>
          <h3 className="font-semibold mb-1">Мгновенная покупка</h3>
          <p className="text-sm text-neutral-400">Билеты доступны сразу после оплаты</p>
        </div>
        <div className="card p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 mb-3">
            <FaTicketAlt className="text-xl" />
          </div>
          <h3 className="font-semibold mb-1">Электронные билеты</h3>
          <p className="text-sm text-neutral-400">Без очередей и печати</p>
        </div>
        <div className="card p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 mb-3">
            <FaStar className="text-xl" />
          </div>
          <h3 className="font-semibold mb-1">Лучшие постановки</h3>
          <p className="text-sm text-neutral-400">Только проверенные площадки и артисты</p>
        </div>
      </div>

      {/* Секция доверия / Статистика */}
      <div className="card p-8 bg-gradient-to-br from-neutral-900 to-neutral-800 border-brand-500/20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl md:text-4xl font-bold text-brand-400 mb-1">
              {shows.length}+
            </div>
            <div className="text-sm text-neutral-400">Постановок</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-pink-400 mb-1">
              {actors.length}+
            </div>
            <div className="text-sm text-neutral-400">Артистов</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-purple-400 mb-1">
              {cities.length}+
            </div>
            <div className="text-sm text-neutral-400">Городов</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-blue-400 mb-1">
              4.8
            </div>
            <div className="text-sm text-neutral-400">Рейтинг</div>
          </div>
        </div>
      </div>

      {/* Популярные постановки */}
      {popularShows.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <FaStar className="text-brand-400" />
              Популярные постановки
            </h2>
            <Link to="/shows" className="text-brand-400 hover:text-brand-300 text-sm font-medium">
              Смотреть все →
            </Link>
          </div>
          <ShowsGrid shows={popularShows} actorsById={actorsById} />
        </div>
      )}

      {/* Ближайшие события */}
      {upcomingShows.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <FaClock className="text-pink-400" />
              Скоро в продаже
            </h2>
            <Link to="/shows" className="text-brand-400 hover:text-brand-300 text-sm font-medium">
              Смотреть все →
            </Link>
          </div>
          <ShowsGrid shows={upcomingShows} actorsById={actorsById} />
        </div>
      )}

      {/* Быстрый доступ по жанрам */}
      {genres.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <FaTheaterMasks className="text-purple-400" />
            Жанры
          </h2>
          <div className="flex flex-wrap gap-3">
            {genres.map(genre => (
              <Link
                key={genre}
                to={`/shows?genre=${encodeURIComponent(genre)}`}
                className="card px-6 py-3 hover:border-brand-500/50 hover:bg-brand-500/5 transition"
              >
                <span className="font-medium">{genre}</span>
              </Link>
            ))}
            <Link
              to="/shows"
              className="card px-6 py-3 hover:border-brand-500/50 hover:bg-brand-500/5 transition"
            >
              <span className="font-medium text-brand-400">Все жанры →</span>
            </Link>
          </div>
        </div>
      )}

      {/* CTA секция */}
      <div className="card p-8 md:p-12 bg-gradient-to-br from-brand-600 to-pink-600 text-white text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-3">
          Не нашли то, что искали?
        </h2>
        <p className="text-white/90 mb-6 max-w-2xl mx-auto">
          Изучите полный каталог постановок, артистов и площадок. Мы поможем найти идеальное событие для вас.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link to="/shows" className="btn bg-white/20 hover:bg-white/30 border-white/40 text-white">
            Все постановки
          </Link>
          <Link to="/actors" className="btn bg-white/20 hover:bg-white/30 border-white/40 text-white">
            Все артисты
          </Link>
        </div>
      </div>
    </section>
  )
}