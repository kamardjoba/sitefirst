import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom'
import { api } from '../utils/api'
import { useCartStore } from '../store/cart'
import SeatPicker from '../components/SeatPicker'
import VenueZonesMap from '../components/VenueZonesMap'
import { formatCurrency } from '../utils/currency'
import { FaArrowLeft, FaShoppingCart, FaTicketAlt } from 'react-icons/fa'

export default function SeatSelect() {
  const { id, sessionId: sessionIdParam } = useParams()
  const [searchParams] = useSearchParams()
  const eventId = Number(id)
  const sessionId = sessionIdParam ? Number(sessionIdParam) : null
  const seatEventId = sessionId || eventId
  const navigate = useNavigate()
  const selectedZone = searchParams.get('zone')
  const addToCart = useCartStore(s => s.add)

  const [seatsData, setSeatsData] = useState([])
  const [zonesInfo, setZonesInfo] = useState([])
  const [eventInfo, setEventInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState([])
  const [viewMode, setViewMode] = useState('zones')

  useEffect(() => {
    let alive = true
    const loadSeats = async () => {
      if (!seatEventId) {
        setSeatsData([])
        setZonesInfo([])
        setError('Некорректный идентификатор события')
        setLoading(false)
        return
      }
      setLoading(true)
      setError('')
      try {
        const res = await api.get(`/api/events/${seatEventId}/seats`)
        if (!res.ok) throw new Error('fetch_failed')
        const data = await res.json()
        if (!alive) return
        if (Array.isArray(data)) {
          setSeatsData(data)
          setZonesInfo([])
        } else if (data.seats?.length) {
          setSeatsData(data.seats)
          setZonesInfo(data.zones || [])
        } else {
          setSeatsData([])
          setZonesInfo([])
        }
        const eventRes = await api.get(`/api/events/${seatEventId}`)
        if (eventRes.ok) {
          const ev = await eventRes.json()
          if (alive) setEventInfo(ev)
        }
      } catch (e) {
        if (alive) setError('Не удалось загрузить схему зала')
      } finally {
        if (alive) setLoading(false)
      }
    }
    loadSeats()
    return () => { alive = false }
  }, [seatEventId])

  useEffect(() => {
    setViewMode(selectedZone ? 'seats' : 'zones')
  }, [selectedZone])

  const filteredSeatsData = useMemo(() => {
    if (!selectedZone || viewMode === 'zones') return seatsData
    return seatsData.filter(s => s.zone === selectedZone)
  }, [seatsData, selectedZone, viewMode])

  const seatIdByRC = useMemo(() => {
    const m = new Map()
    filteredSeatsData.forEach(s => m.set(`${s.row}-${s.seat}`, s.seatId))
    return m
  }, [filteredSeatsData])

  const seatPriceByRC = useMemo(() => {
    const m = new Map()
    filteredSeatsData.forEach(s => m.set(`${s.row}-${s.seat}`, Number(s.price || 0)))
    return m
  }, [filteredSeatsData])

  const venueForPicker = useMemo(() => {
    if (!filteredSeatsData.length) return null
    const maxRow = Math.max(...filteredSeatsData.map(s => Number(s.row || 0)))
    const maxSeat = Math.max(...filteredSeatsData.map(s => Number(s.seat || 0)))
    const zones = {}
    if (zonesInfo.length) {
      zonesInfo.forEach(z => {
        zones[z.code] = { code: z.code, name: z.name || z.code, color: z.color || '#6b7280', minPrice: z.minPrice, maxPrice: z.maxPrice }
      })
    } else {
      const zoneSet = new Set(filteredSeatsData.map(s => s.zone).filter(Boolean))
      zoneSet.forEach(z => {
        const zoneSeats = filteredSeatsData.filter(s => s.zone === z)
        const prices = zoneSeats.map(s => Number(s.price || 0)).filter(Boolean)
        zones[z] = {
          code: z, name: z,
          color: zoneSeats[0]?.zoneColor || '#6b7280',
          minPrice: prices.length ? Math.min(...prices) : 0,
          maxPrice: prices.length ? Math.max(...prices) : 0
        }
      })
    }
    return { rows: maxRow, cols: maxSeat, zones }
  }, [filteredSeatsData, zonesInfo])

  const handleZoneSelect = (zoneCode) => {
    const base = `/shows/${eventId}${sessionId ? `/sessions/${sessionId}` : ''}/seats`
    navigate(zoneCode ? `${base}?zone=${encodeURIComponent(zoneCode)}` : base)
    setViewMode('seats')
  }

  function toggle(seat) {
    if (!filteredSeatsData.length) return
    const key = `${seat.row}-${seat.col}`
    const seatId = seatIdByRC.get(key)
    const price = seatPriceByRC.get(key) ?? seat.price
    if (!seatId) return
    const enriched = { ...seat, price: Number(price || 0), seatId }
    const mk = s => `${s.row}-${s.col}`
    setSelected(cur =>
      cur.some(s => mk(s) === mk(enriched))
        ? cur.filter(s => mk(s) !== mk(enriched))
        : [...cur, enriched]
    )
  }

  const disabledAdd = !filteredSeatsData.length || !selected.length || selected.some(s => !s.seatId)
  const totalSum = selected.reduce((s, x) => s + Number(x.price || 0), 0)

  function addSelectedToCart() {
    if (disabledAdd) return
    selected.forEach(seat => {
      addToCart({
        eventId,
        showId: eventId,
        sessionId: sessionId || eventId,
        seatId: seat.seatId,
        seat: { row: seat.row, col: seat.col },
        price: Number(seat.price || 0)
      })
    })
    setSelected([])
    navigate('/cart')
  }

  if (loading) {
    return (
      <section className="min-h-[50vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-neutral-400">
          <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p>Загрузка схемы зала…</p>
        </div>
      </section>
    )
  }

  if (error || !seatsData.length) {
    return (
      <section className="p-6 max-w-lg mx-auto text-center space-y-4">
        <p className="text-red-400">{error || 'Нет данных по местам'}</p>
        <Link to={`/shows/${eventId}`} className="btn inline-flex items-center gap-2">
          <FaArrowLeft /> Назад к событию
        </Link>
      </section>
    )
  }

  if (viewMode === 'zones' || !selectedZone) {
    const venueName = eventInfo?.venueName
      ? `${eventInfo.venueName}${eventInfo?.city ? `, ${eventInfo.city}` : ''}`
      : null
    return (
      <section className="pb-24">
        <header className="flex items-center gap-4 mb-6">
          <Link
            to={`/shows/${eventId}`}
            className="p-2.5 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 border border-neutral-700 text-neutral-300 hover:text-white transition"
            aria-label="Назад"
          >
            <FaArrowLeft className="text-lg" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl font-bold truncate">{eventInfo?.title || 'Выбор мест'}</h1>
            <p className="text-neutral-400 text-sm mt-0.5">{venueName || 'Выберите сектор'}</p>
          </div>
        </header>
        <VenueZonesMap
          seats={seatsData}
          zones={zonesInfo}
          onZoneSelect={handleZoneSelect}
          venueName={venueName}
        />
      </section>
    )
  }

  const safeVenue = venueForPicker || { rows: 0, cols: 0, zones: {} }
  const currentZone = zonesInfo.find(z => z.code === selectedZone)

  return (
    <section className="pb-32 md:pb-8">
      <header className="flex items-center justify-between gap-4 mb-4 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              navigate(`/shows/${eventId}${sessionId ? `/sessions/${sessionId}` : ''}/seats`)
              setViewMode('zones')
            }}
            className="p-2.5 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 border border-neutral-700 text-neutral-300 hover:text-white transition"
            aria-label="Другой сектор"
          >
            <FaArrowLeft className="text-lg" />
          </button>
          <div>
            <h1 className="text-lg md:text-xl font-bold">
              {currentZone ? currentZone.name : 'Зал'}
            </h1>
            <p className="text-neutral-400 text-sm">
              {currentZone?.minPrice != null && (currentZone.minPrice === currentZone.maxPrice
                ? formatCurrency(currentZone.minPrice)
                : `${formatCurrency(currentZone.minPrice)} – ${formatCurrency(currentZone.maxPrice)}`)}
            </p>
          </div>
        </div>
      </header>

      <div className="rounded-2xl border border-neutral-800 bg-neutral-950/80 overflow-hidden">
        <SeatPicker
          venue={safeVenue}
          seats={filteredSeatsData}
          selected={selected}
          onToggle={toggle}
        />
      </div>

      {/* Sticky bottom bar — как на Ticketmaster / Eventim */}
      <div
        className="fixed inset-x-0 bottom-0 z-40 bg-neutral-950/95 border-t border-neutral-800 shadow-[0_-8px_32px_rgba(0,0,0,0.5)] md:rounded-t-2xl"
        style={{ backdropFilter: 'saturate(180%) blur(12px)' }}
      >
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-brand-500/20 border border-brand-500/50 flex items-center justify-center">
              <FaTicketAlt className="text-xl text-brand-400" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-white">
                {selected.length === 0
                  ? 'Выберите места на схеме'
                  : `${selected.length} ${selected.length === 1 ? 'билет' : selected.length < 5 ? 'билета' : 'билетов'}`}
              </p>
              {selected.length > 0 && (
                <p className="text-sm text-neutral-400 truncate">
                  {selected.map(s => `Ряд ${s.row}, место ${s.col}`).join(' · ')}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4 flex-shrink-0">
            {selected.length > 0 && (
              <div className="text-right">
                <p className="text-xs text-neutral-500 uppercase tracking-wider">Итого</p>
                <p className="text-xl font-bold text-white">{formatCurrency(totalSum)}</p>
              </div>
            )}
            <button
              type="button"
              onClick={addSelectedToCart}
              disabled={disabledAdd}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold bg-brand-600 hover:bg-brand-500 text-white shadow-lg hover:shadow-brand-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-brand-600"
            >
              <FaShoppingCart className="text-lg" />
              {selected.length ? `В корзину · ${formatCurrency(totalSum)}` : 'В корзину'}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
