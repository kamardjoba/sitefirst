import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../utils/api'
import { useCartStore } from '../store/cart'
import SeatPicker from '../components/SeatPicker'

export default function SeatSelect() {
  const { id } = useParams()
  const eventId = Number(id)
  const navigate = useNavigate()

  const addToCart = useCartStore(s => s.add)

  const [seatsData, setSeatsData] = useState([])   // [{ seatId,row,seat,zone,status,price }]
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [selected, setSelected] = useState([])      // [{ row,col,price,seatId }]

  // 1) Загружаем места события
  useEffect(() => {
    let alive = true
    ;(async () => {
      setLoading(true); setError('')
      try {
        const res = await api.get(`/api/events/${eventId}/seats`)
        if (!res.ok) throw new Error('fetch_failed')
        const data = await res.json()
        if (alive) setSeatsData(Array.isArray(data) ? data : [])
      } catch (e) {
        if (alive) setError('Не удалось загрузить схему зала')
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => { alive = false }
  }, [eventId])

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

  // 3) Собираем venue для пикера: rows/cols + безопасное zones
  const venueForPicker = useMemo(() => {
    if (!seatsData.length) return null

    const maxRow  = Math.max(...seatsData.map(s => Number(s.row || 0)))
    const maxSeat = Math.max(...seatsData.map(s => Number(s.seat || 0)))

    // Построим мини-справочник зон (если zone не приходит — будет пустой объект)
    const zoneSet = new Set(seatsData.map(s => s.zone).filter(Boolean))
    const zones = Object.fromEntries(
      Array.from(zoneSet).map(z => [z, { code: z, name: z }])
    )

    return { rows: maxRow, cols: maxSeat, zones }   // <= всегда есть zones (пусть и пустой)
  }, [seatsData])

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

      <div className="card p-4">
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
            <> · Сумма: <b>{selected.reduce((s, x) => s + Number(x.price || 0), 0)}</b></>
          )}
        </div>
        <button className="btn" disabled={disabledAdd} onClick={addSelectedToCart}>
          В корзину
        </button>
      </div>
    </section>
  )
}