import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../utils/api'
import { useCartStore } from '../store/cart'
import SeatPicker from '../components/SeatPicker'
import { formatCurrency } from '../utils/currency'

export default function SeatSelect() {
  const { id, sessionId: sessionIdParam } = useParams()
  const eventId = Number(id)
  const sessionId = sessionIdParam ? Number(sessionIdParam) : null
  const seatEventId = sessionId || eventId
  const navigate = useNavigate()

  const addToCart = useCartStore(s => s.add)

  const [seatsData, setSeatsData] = useState([])   // [{ seatId,row,seat,zone,status,price,zoneName,zoneColor }]
  const [zonesInfo, setZonesInfo] = useState([])  // [{ code, name, color, minPrice, maxPrice }]
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [selected, setSelected] = useState([])      // [{ row,col,price,seatId }]

  // 1) Загружаем места события
  useEffect(() => {
    let alive = true
    ;(async () => {
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
        if (!res.ok) throw new Error(`fetch_failed_${res.status}`)
        const data = await res.json()
        // Поддержка старого формата (массив) и нового (объект с seats и zones)
        if (Array.isArray(data)) {
          if (alive) {
            setSeatsData(data)
            setZonesInfo([])
          }
        } else if (data.seats && Array.isArray(data.seats)) {
          if (alive) {
            setSeatsData(data.seats)
            setZonesInfo(data.zones || [])
          }
        } else {
          if (alive) {
            setSeatsData([])
            setZonesInfo([])
          }
        }
      } catch (e) {
        if (alive) setError('Не удалось загрузить схему зала')
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [seatEventId])

  // 2) Быстрые мапы по (row,col)
  const seatIdByRC = useMemo(() => {
    const m = new Map()
    for (const s of seatsData) m.set(`${s.row}-${s.seat}`, s.seatId)
    return m
  }, [seatsData])

  const seatPriceByRC = useMemo(() => {
    const m = new Map()
    for (const s of seatsData) m.set(`${s.row}-${s.seat}`, Number(s.price || 0))
    return m
  }, [seatsData])

  // 3) Собираем venue для пикера: rows/cols + безопасное zones с цветами
  const venueForPicker = useMemo(() => {
    if (!seatsData.length) return null

    const maxRow  = Math.max(...seatsData.map(s => Number(s.row || 0)))
    const maxSeat = Math.max(...seatsData.map(s => Number(s.seat || 0)))

    // Строим справочник зон из zonesInfo или из данных мест
    const zones = {}
    if (zonesInfo.length > 0) {
      zonesInfo.forEach(z => {
        zones[z.code] = {
          code: z.code,
          name: z.name || z.code,
          color: z.color || '#999999',
          minPrice: z.minPrice,
          maxPrice: z.maxPrice
        }
      })
    } else {
      // Fallback: строим из данных мест
      const zoneSet = new Set(seatsData.map(s => s.zone).filter(Boolean))
      Array.from(zoneSet).forEach(z => {
        const zoneSeats = seatsData.filter(s => s.zone === z)
        const prices = zoneSeats.map(s => Number(s.price || 0)).filter(p => p > 0)
        zones[z] = {
          code: z,
          name: z,
          color: zoneSeats[0]?.zoneColor || '#999999',
          minPrice: prices.length > 0 ? Math.min(...prices) : 0,
          maxPrice: prices.length > 0 ? Math.max(...prices) : 0
        }
      })
    }

    return { rows: maxRow, cols: maxSeat, zones }   // <= всегда есть zones (пусть и пустой)
  }, [seatsData, zonesInfo])

  // 4) Переключение места
  function toggle(seat) {
    // Пока seatsData не подгружены — ничего не делаем
    if (!seatsData.length) return

    const key = `${seat.row}-${seat.col}`
    const seatId = seatIdByRC.get(key)
    const price  = seatPriceByRC.get(key) ?? seat.price

    if (!seatId) return  // без seatId не добавляем "битое" место

    const enriched = { ...seat, price: Number(price || 0), seatId }
    const mk = (s) => `${s.row}-${s.col}`

    setSelected(cur =>
      cur.some(s => mk(s) === mk(enriched))
        ? cur.filter(s => mk(s) !== mk(enriched))
        : [...cur, enriched]
    )
  }

  // 5) Добавление в корзину
  const disabledAdd =
    !seatsData.length || !selected.length || selected.some(s => !s.seatId)

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

  // UI
  if (loading) {
    return <section className="p-4"><div className="text-neutral-400">Загружаем схему зала…</div></section>
  }
  if (error || !seatsData.length) {
    return <section className="p-4"><div className="text-red-400">{error || 'Нет данных по местам'}</div></section>
  }

  const safeVenue = venueForPicker || { rows: 0, cols: 0, zones: {} }

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Выбор мест</h1>

      <div className="card p-6">
        <SeatPicker
          venue={safeVenue}         // всегда есть zones (хотя бы пустой объект)
          seats={seatsData}
          selected={selected}
          onToggle={toggle}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="text-neutral-300">
          Выбрано: <b>{selected.length}</b>
          {!!selected.length && (
            <> · Сумма: <b>{formatCurrency(selected.reduce((s, x) => s + Number(x.price || 0), 0))}</b></>
          )}
        </div>
        <button className="btn" disabled={disabledAdd} onClick={addSelectedToCart}>
          В корзину
        </button>
      </div>
    </section>
  )
}