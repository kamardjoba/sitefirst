import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { api } from '../utils/api'
import { useCartStore } from '../store/cart'
import SeatPicker from '../components/SeatPicker'
import { formatCurrency } from '../utils/currency'

export default function SeatSelect() {
  const { id, sessionId: sessionIdParam } = useParams()
  const [searchParams] = useSearchParams()
  const eventId = Number(id)
  const sessionId = sessionIdParam ? Number(sessionIdParam) : null
  const seatEventId = sessionId || eventId
  const navigate = useNavigate()
  
  // Получаем параметр зоны из URL
  const selectedZone = searchParams.get('zone')

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
            // Фильтруем по зоне, если указана
            let filteredSeats = data
            if (selectedZone) {
              filteredSeats = data.filter(s => s.zone === selectedZone)
            }
            setSeatsData(filteredSeats)
            setZonesInfo([])
          }
        } else if (data.seats && Array.isArray(data.seats)) {
          if (alive) {
            // Фильтруем по зоне, если указана
            let filteredSeats = data.seats
            if (selectedZone) {
              filteredSeats = data.seats.filter(s => s.zone === selectedZone)
            }
            setSeatsData(filteredSeats)
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
  }, [seatEventId, selectedZone])

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

  // Находим информацию о текущей зоне
  const currentZone = selectedZone ? zonesInfo.find(z => z.code === selectedZone) : null

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {currentZone ? `Выбор мест - ${currentZone.name}` : 'Выбор мест'}
          </h1>
          {currentZone && (
            <p className="text-sm text-neutral-400 mt-1">
              {currentZone.minPrice === currentZone.maxPrice 
                ? formatCurrency(currentZone.minPrice)
                : `${formatCurrency(currentZone.minPrice)} - ${formatCurrency(currentZone.maxPrice)}`
              }
            </p>
          )}
        </div>
        {selectedZone && (
          <button
            onClick={() => {
              const basePath = `/shows/${eventId}`
              const sessionPath = sessionId ? `/sessions/${sessionId}` : ''
              navigate(`${basePath}${sessionPath}/zones`)
            }}
            className="text-sm text-brand-400 hover:text-brand-300"
          >
            ← Выбрать другую зону
          </button>
        )}
      </div>

      <div className="card p-6 bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 border-neutral-800">
        <SeatPicker
          venue={safeVenue}
          seats={seatsData}
          selected={selected}
          onToggle={toggle}
        />
      </div>

      {/* Панель выбранных мест */}
      <div className="card p-6 bg-gradient-to-r from-brand-600/20 to-pink-600/20 border-brand-500/30">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="text-neutral-300">
              Выбрано мест: <span className="font-bold text-white text-lg">{selected.length}</span>
            </div>
            {!!selected.length && (
              <div className="text-neutral-400 text-sm">
                Общая сумма: <span className="font-bold text-brand-400 text-lg">
                  {formatCurrency(selected.reduce((s, x) => s + Number(x.price || 0), 0))}
                </span>
              </div>
            )}
            {selected.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selected.map((seat, idx) => (
                  <div
                    key={idx}
                    className="px-3 py-1 rounded-full bg-brand-500/20 border border-brand-500/50 text-xs text-neutral-200"
                  >
                    Ряд {seat.row}, Место {seat.col} · {formatCurrency(seat.price)}
                  </div>
                ))}
              </div>
            )}
          </div>
          <button
            className="btn bg-gradient-to-r from-brand-600 to-pink-600 hover:from-brand-700 hover:to-pink-700 text-white font-bold px-8 py-3 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={disabledAdd}
            onClick={addSelectedToCart}
          >
            Добавить в корзину ({selected.length})
          </button>
        </div>
      </div>
    </section>
  )
}