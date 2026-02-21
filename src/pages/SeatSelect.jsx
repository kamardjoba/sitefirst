import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { api } from '../utils/api'
import { useCartStore } from '../store/cart'
import { SeatMap, BookingSummary, Legend } from '../components/SeatSelection'
import { rowNumberToLetter } from '../utils/seatLabels'
import { FaArrowLeft } from 'react-icons/fa'

const MAX_TICKETS = 6

export default function SeatSelect() {
  const { id, sessionId: sessionIdParam } = useParams()
  const eventId = Number(id)
  const sessionId = sessionIdParam ? Number(sessionIdParam) : null
  const seatEventId = sessionId || eventId
  const navigate = useNavigate()
  const addToCart = useCartStore(s => s.add)

  const [seatsData, setSeatsData] = useState([])
  const [zonesInfo, setZonesInfo] = useState([])
  const [eventInfo, setEventInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState([])
  const [zoom, setZoom] = useState(1)
  const [priceFilter, setPriceFilter] = useState('')

  useEffect(() => {
    let alive = true
    const load = async () => {
      if (!seatEventId) {
        setError('Некорректный идентификатор')
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
        const evRes = await api.get(`/api/events/${seatEventId}`)
        if (evRes.ok) {
          const ev = await evRes.json()
          if (alive) setEventInfo(ev)
        }
      } catch (e) {
        if (alive) setError('Не удалось загрузить схему зала')
      } finally {
        if (alive) setLoading(false)
      }
    }
    load()
    return () => { alive = false }
  }, [seatEventId])

  // Всегда показываем полную схему зала (все зоны), чтобы было видно расположение: сцена → VIP → A → B
  const seatsForMap = useMemo(() => seatsData, [seatsData])

  const seatIdByRC = useMemo(() => {
    const m = new Map()
    seatsData.forEach(s => m.set(`${s.row}-${s.seat}`, s.seatId))
    return m
  }, [seatsData])

  const handleToggleSeat = (seat) => {
    const key = `${seat.row}-${seat.seat}`
    const seatId = seatIdByRC.get(key)
    if (!seatId) return
    const price = Number(seat.price || 0)
    setSelected(cur => {
      const idx = cur.findIndex(s => `${s.row}-${s.seat}` === key)
      if (idx >= 0) return cur.filter((_, i) => i !== idx)
      if (cur.length >= MAX_TICKETS) return cur
      return [...cur, { row: seat.row, seat: seat.seat, seatId, price }]
    })
  }

  const handleAutoSelectBest = (seats) => {
    const next = seats
      .map(s => {
        const key = `${s.row}-${s.seat}`
        const seatId = seatIdByRC.get(key)
        return seatId ? { row: s.row, seat: s.seat, seatId, price: Number(s.price || 0) } : null
      })
      .filter(Boolean)
    setSelected(next)
  }

  const totalSum = selected.reduce((s, x) => s + x.price, 0)
  const pricePerTicket = selected.length ? totalSum / selected.length : null
  const selectedForSummary = useMemo(() => selected.map(s => ({
    rowLabel: rowNumberToLetter(s.row),
    seatNumber: s.seat,
    price: s.price
  })), [selected])

  const handleContinue = () => {
    if (!selected.length) return
    selected.forEach(s => {
      addToCart({
        eventId,
        showId: eventId,
        sessionId: sessionId || eventId,
        seatId: s.seatId,
        seat: { row: s.row, col: s.seat },
        price: s.price
      })
    })
    setSelected([])
    navigate('/cart')
  }

  const dateTimeStr = useMemo(() => {
    if (!eventInfo?.startsAt) return null
    const d = new Date(eventInfo.startsAt)
    return d.toLocaleString('ru-RU', { dateStyle: 'long', timeStyle: 'short' })
  }, [eventInfo?.startsAt])

  const locationStr = useMemo(() => {
    if (!eventInfo?.venueName) return null
    return [eventInfo.venueName, eventInfo.city].filter(Boolean).join(', ')
  }, [eventInfo?.venueName, eventInfo?.city])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-neutral-950">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-neutral-700 border-t-brand-500 rounded-full animate-spin mb-4" />
          <p className="text-neutral-400 font-medium">Загрузка схемы зала</p>
          <div className="mt-4 w-64 h-48 rounded-xl bg-neutral-800/80 animate-pulse mx-auto" />
        </div>
      </div>
    )
  }

  if (error || !seatsData.length) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center bg-neutral-950 p-6">
        <div className="text-center max-w-md">
          <p className="text-red-400 font-medium mb-4">{error || 'Нет данных по местам'}</p>
          <Link
            to={`/shows/${eventId}`}
            className="btn inline-flex items-center gap-2"
          >
            <FaArrowLeft /> Назад к событию
          </Link>
        </div>
      </div>
    )
  }

  const priceFilterNum = priceFilter ? Number(priceFilter) : null

  return (
    <div className="min-h-screen bg-neutral-950 py-6 px-4">
      <div className="max-w-7xl mx-auto">
        <header className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <div className="flex items-center gap-3">
            <Link
              to={`/shows/${eventId}`}
              className="p-2.5 rounded-xl border border-neutral-700 bg-neutral-900/80 text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors"
              aria-label="Назад"
            >
              <FaArrowLeft className="text-lg" />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-white">{eventInfo?.title || 'Выбор мест'}</h1>
              <p className="text-neutral-400 text-sm">
                Сцена сверху · VIP → Сектор A → Сектор B · макс. {MAX_TICKETS} билетов · выбрано {selected.length}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-neutral-400">
              <span>Цена до</span>
              <input
                type="number"
                min="0"
                step="10"
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
                placeholder="—"
                className="input w-24 py-2 text-sm"
              />
            </label>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <SeatMap
              seats={seatsForMap}
              selectedList={selected}
              onToggleSeat={handleToggleSeat}
              maxSelection={MAX_TICKETS}
              zoom={zoom}
              onZoomChange={setZoom}
              priceFilter={priceFilterNum}
              onAutoSelectBest={handleAutoSelectBest}
            />
            <Legend />
          </div>
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <BookingSummary
                eventName={eventInfo?.title}
                dateTime={dateTimeStr}
                location={locationStr}
                selectedSeats={selectedForSummary}
                pricePerTicket={pricePerTicket}
                total={totalSum}
                onContinue={handleContinue}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
