import { useMemo, useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useShowsStore } from '../store/shows'
import { useVenuesStore } from '../store/venues'
import { useCartStore } from '../store/cart'
import SeatPicker from '../components/SeatPicker'
import SeatLegend from '../components/SeatLegend'
import { api } from '../utils/api'

export default function SeatSelect(){
  const { id, sessionId } = useParams()            // sessionId = id event'а по нашему адаптеру
  const eventId = sessionId || id                  // на всякий случай поддержим оба варианта
  const go = useNavigate()

  const show = useShowsStore(s=>s.list.find(sh=> String(sh.id)===String(id)))
  const venue = useVenuesStore(s=>s.list.find(v=> v.id===show?.venueId))

  const [seatsData, setSeatsData] = useState([])   // [{seatId,row,seat,zone,status,price}]
  const [occupied, setOccupied] = useState([])     // [{row,col}]
  const [selected, setSelected] = useState([])     // [{row,col,price,seatId}]
  const add = useCartStore(s=>s.add)

  // тянем реальную схему мест и цены
  useEffect(()=>{
    if(!eventId) return
    api.get(`/api/events/${eventId}/seats`).then(r=>r.json()).then(data=>{
      setSeatsData(Array.isArray(data)?data:[])
      const occ = data.filter(s=> s.status !== 'available').map(s => ({ row: s.row, col: s.seat }))
      setOccupied(occ)
    })
  },[eventId])

  // динамически подстроим pricing и seatingMap под реальные цены
  const pricing = useMemo(()=>{
    if (!seatsData.length) return { base: 100, factor: 1 }
    const rowMin = new Map()
    for (const s of seatsData) {
      const cur = rowMin.get(s.row) ?? Infinity
      rowMin.set(s.row, Math.min(cur, Number(s.price || 0)))
    }
    const allRowPrices = Array.from(rowMin.values()).filter(x=>x>0)
    const base = allRowPrices.length ? Math.min(...allRowPrices) : 100
    return { base, factor: 1 }
  }, [seatsData])

  // Подменим venue.seatingMap.zones так, чтобы priceFactor совпал с реальными ценами
  const venueForPicker = useMemo(()=>{
    if (!venue) return null
    const rows = venue.seatingMap?.rows || venue.rows || 0
    const cols = venue.seatingMap?.cols || venue.cols || 0

    // посчитаем среднюю цену по ряду и сделаем из этого зоны (по рядам)
    const rowPrice = new Map()
    for (const s of seatsData) {
      const acc = rowPrice.get(s.row) || { sum:0, n:0 }
      acc.sum += Number(s.price||0); acc.n += 1
      rowPrice.set(s.row, acc)
    }
    const zones = []
    const base = pricing.base || 100
    for (let r=1;r<=rows;r++){
      const agg = rowPrice.get(r)
      const avg = agg && agg.n ? agg.sum/agg.n : base
      zones.push({ name: `R${r}`, rows:[r,r], priceFactor: (avg>0? (avg/base):1), color: '#4b5563' })
    }
    return { ...venue, seatingMap: { rows, cols, zones } }
  }, [venue, seatsData, pricing])

  const toggle = (seat)=> {
    // seat = {row,col,price} пришло из SeatPicker (но цена там по факторам)
    // переопределим фактической ценой из seatsData
    const match = seatsData.find(s => s.row===seat.row && s.seat===seat.col)
    const enriched = { ...seat, price: match?.price ?? seat.price, seatId: match?.seatId }
    const key = (s)=> `${s.row}-${s.col}`
    setSelected(cur => cur.some(s=>key(s)===key(enriched)) ? cur.filter(s=>key(s)!==key(enriched)) : [...cur, enriched])
  }

  const totals = selected.reduce((acc,s)=>acc+(s.price||0),0)

  if(!show || !venueForPicker) return <div>Данные сеанса не найдены</div>

  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">{show.title}</h1>
        <div className="text-neutral-400 text-sm">
          {new Date(show.sessions[0].dateISO).toLocaleDateString('ru-RU')} · {show.sessions[0].timeISO}
        </div>
      </div>
      <SeatLegend/>
      <SeatPicker
        venue={venueForPicker}
        occupiedSeats={occupied}
        selected={selected}
        onToggle={toggle}
        pricing={pricing}
      />
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold">Сумма: {Math.round(totals)} ₽</div>
        <button
          className="btn bg-gradient-to-r from-brand-600 to-pink-600 hover:to-pink-700"
          disabled={!selected.length}
          onClick={()=>{
            // добавляем в корзину с eventId и seatId (для бэка)
            selected.forEach(seat => add({
              eventId: Number(eventId),
              seatId: seat.seatId,                 // важно для /api/orders
              seat: { row: seat.row, col: seat.col },
              price: seat.price
            }))
            setSelected([])
            go('/cart')
          }}
        >В корзину</button>
      </div>
    </section>
  )
}