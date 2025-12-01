import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { api } from '../utils/api'
import { formatCurrency } from '../utils/currency'
import { FaArrowLeft } from 'react-icons/fa'

export default function ZoneSelect() {
  const { id, sessionId: sessionIdParam } = useParams()
  const eventId = Number(id)
  const sessionId = sessionIdParam ? Number(sessionIdParam) : null
  const seatEventId = sessionId || eventId
  const navigate = useNavigate()

  const [zonesInfo, setZonesInfo] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [eventInfo, setEventInfo] = useState(null)

  useEffect(() => {
    let alive = true
    ;(async () => {
      if (!seatEventId) {
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
        
        // Поддержка старого и нового формата
        if (Array.isArray(data)) {
          // Старый формат - извлекаем зоны из мест
          const zoneMap = new Map()
          data.forEach(seat => {
            if (seat.zone && !zoneMap.has(seat.zone)) {
              zoneMap.set(seat.zone, {
                code: seat.zone,
                name: seat.zoneName || seat.zone,
                color: seat.zoneColor || '#999999',
                minPrice: Number(seat.price || 0),
                maxPrice: Number(seat.price || 0)
              })
            } else if (seat.zone) {
              const existing = zoneMap.get(seat.zone)
              const price = Number(seat.price || 0)
              if (price > 0) {
                existing.minPrice = Math.min(existing.minPrice || price, price)
                existing.maxPrice = Math.max(existing.maxPrice || price, price)
              }
            }
          })
          if (alive) setZonesInfo(Array.from(zoneMap.values()))
        } else if (data.seats && Array.isArray(data.seats)) {
          if (alive) {
            setZonesInfo(data.zones || [])
          }
        }

        // Получаем информацию о событии
        const eventRes = await api.get(`/api/events/${seatEventId}`)
        if (eventRes.ok) {
          const eventData = await eventRes.json()
          if (alive) setEventInfo(eventData)
        }
      } catch (e) {
        if (alive) setError('Не удалось загрузить информацию о зонах')
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [seatEventId])

  const handleZoneSelect = (zoneCode) => {
    const basePath = `/shows/${eventId}`
    const sessionPath = sessionId ? `/sessions/${sessionId}` : ''
    navigate(`${basePath}${sessionPath}/seats?zone=${encodeURIComponent(zoneCode)}`)
  }

  if (loading) {
    return (
      <section className="p-4">
        <div className="text-neutral-400">Загружаем информацию о зонах…</div>
      </section>
    )
  }

  if (error || !zonesInfo.length) {
    return (
      <section className="p-4 space-y-4">
        <div className="text-red-400">{error || 'Нет доступных зон'}</div>
        <Link to={`/shows/${eventId}`} className="btn">
          Вернуться к событию
        </Link>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          to={`/shows/${eventId}`}
          className="text-neutral-400 hover:text-white transition"
        >
          <FaArrowLeft className="text-xl" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Выбор зоны</h1>
          {eventInfo && (
            <p className="text-neutral-400 text-sm mt-1">{eventInfo.title || 'Выберите зону для покупки билетов'}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {zonesInfo.map(zone => (
          <button
            key={zone.code}
            onClick={() => handleZoneSelect(zone.code)}
            className="card p-6 text-left hover:border-brand-500/50 hover:bg-brand-500/5 transition-all group"
          >
            <div className="flex items-start gap-4">
              <div
                className="w-16 h-16 rounded-xl flex-shrink-0 border-2 flex items-center justify-center text-2xl font-bold"
                style={{
                  backgroundColor: `${zone.color}20`,
                  borderColor: zone.color,
                  color: zone.color
                }}
              >
                {zone.code}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold mb-1 group-hover:text-brand-400 transition">
                  {zone.name}
                </h3>
                {zone.minPrice > 0 && (
                  <div className="text-sm text-neutral-400">
                    {zone.minPrice === zone.maxPrice ? (
                      <span className="text-brand-400 font-medium">
                        {formatCurrency(zone.minPrice)}
                      </span>
                    ) : (
                      <span>
                        От <span className="text-brand-400 font-medium">{formatCurrency(zone.minPrice)}</span>
                        {' '}до <span className="text-brand-400 font-medium">{formatCurrency(zone.maxPrice)}</span>
                      </span>
                    )}
                  </div>
                )}
                <div className="mt-3 text-xs text-neutral-500 group-hover:text-neutral-400 transition">
                  Нажмите для выбора мест →
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Альтернатива: показать все места сразу */}
      <div className="card p-4 bg-neutral-900/50 border-brand-500/20">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-neutral-200">Показать все места</h3>
            <p className="text-sm text-neutral-400 mt-1">Выбрать место из всех зон сразу</p>
          </div>
          <button
            onClick={() => {
              const basePath = `/shows/${eventId}`
              const sessionPath = sessionId ? `/sessions/${sessionId}` : ''
              navigate(`${basePath}${sessionPath}/seats`)
            }}
            className="btn"
          >
            Все места
          </button>
        </div>
      </div>
    </section>
  )
}

