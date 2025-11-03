// src/pages/SeatSelect.jsx
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

  const [seatsData, setSeatsData] = useState([])     // [{ seatId, row, seat, zone, status, price }]
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [selected, setSelected] = useState([])        // [{ row, col, price, seatId? }]

  // загрузка схемы мест/цен
  useEffect(() => {
    let alive = true
    async function load() {
      setLoading(true); setError('')
      try {
        const res = await api.get(`/api/events/${eventId}/seats`)
        if (!res.ok) throw new Error('failed_fetch_seats')
        const data = await res.json()
        if (alive) {
          setSeatsData(Array.isArray(data) ? data : [])
        }
      } catch (e) {
        if (alive) setError('Не удалось загрузить схему зала')
      } finally {
        if (alive) setLoading(false)
      }
    }
    if (eventId) load()
    return () => { alive = false }
  }, [eventId])

  // быстрый доступ к id/цене по row-col
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

  // данные для отрисовки сетки (минимум — размеры)
  const venueForPicker = useMemo(() => {
    if (!seatsData.length) return null
    const maxRow  = Math.max(...seatsData.map(s => Number(s.row)))
    const maxSeat = Math.max(...seatsData.map(s => Number(s.seat)))
    return { rows: maxRow, cols: maxSeat }
  }, [seatsData])

  // запрет клика до загрузки схемы
  function toggle(seat) {
    if (!seatsData.length) return

    const key      = `${seat.row}-${seat.col}`
    const seatId   = seatIdByRC.get(key)
    const realPrice= seatPriceByRC.get(key) ?? seat.price

    // если почему-то не нашли seatId — не добавляем битые позиции
    if (!seatId) return

    const enriched = { ...seat, price: realPrice, seatId }
    const mk = (s) => `${s.row}-${s.col}`

    setSelected(cur =>
      cur.some(s => mk(s) === mk(enriched))
        ? cur.filter(s => mk(s) !== mk(enriched))
        : [...cur, enriched]
    )
  }

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

  if (loading) {
    return (
      <section className="p-4">
        <div className="text-neutral-400">Загружаем схему зала…</div>
      </section>
    )
  }

  if (error || !seatsData.length) {
    return (
      <section className="p-4">
        <div className="text-red-400">{error || 'Нет данных по местам'}</div>
      </section>
    )
  }

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Выбор мест</h1>

      {/* Схема зала */}
      <div className="card p-4">
        {venueForPicker ? (
          <SeatPicker
            // минимальный набор, если у тебя есть дополнительные пропсы — оставь их
            venue={venueForPicker}
            seats={seatsData}
            selected={selected}
            onToggle={toggle}
          />
        ) : (
          <div className="text-neutral-400">Схема недоступна</div>
        )}
      </div>

      {/* Итог и переход в корзину */}
      <div className="flex items-center justify-between">
        <div className="text-neutral-300">
          Выбрано: <b>{selected.length}</b>
          {!!selected.length && (
            <>
              {' '}· Сумма:{' '}
              <b>
                {selected.reduce((sum, s) => sum + Number(s.price || 0), 0)}
              </b>
            </>
          )}
        </div>
        <button
          className="btn"
          disabled={disabledAdd}
          onClick={addSelectedToCart}
        >
          В корзину
        </button>
      </div>
    </section>
  )
}