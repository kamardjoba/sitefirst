import { useMemo, useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useShowsStore } from '../store/shows'
import { useVenuesStore } from '../store/venues'
import { useCartStore } from '../store/cart'
import SeatPicker from '../components/SeatPicker'
import SeatLegend from '../components/SeatLegend'

export default function SeatSelect(){
  const { id, sessionId } = useParams()
  const go = useNavigate()
  const show = useShowsStore(s=>s.list.find(sh=> String(sh.id)===String(id)))
  const venue = useVenuesStore(s=>s.list.find(v=> v.id===show?.venueId))
  const session = show?.sessions.find(s=> String(s.id)===String(sessionId))
  const [occupied, setOccupied] = useState([])
  const [selected, setSelected] = useState([])
  const add = useCartStore(s=>s.add)
  const totals = selected.reduce((acc,s)=>acc+s.price,0)

  useEffect(()=>{
    fetch('/mocks/occupiedSeats.json').then(r=>r.json()).then(all=>{
      const entry = all.find(o=> String(o.sessionId)===String(sessionId))
      setOccupied(entry?.seats || [])
    })
  },[sessionId])

  const toggle = (seat)=> {
    const key = (s)=> `${s.row}-${s.col}`
    setSelected(cur => cur.some(s=>key(s)===key(seat)) ? cur.filter(s=>key(s)!==key(seat)) : [...cur, seat])
  }

  const pricing = useMemo(()=>({ base: session?.basePrice||0, factor: session?.dynamicFactor||1 }),[session])

  if(!show || !venue || !session) return <div>Данные сеанса не найдены</div>

  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">{show.title}</h1>
        <div className="text-neutral-400 text-sm">{new Date(session.dateISO).toLocaleDateString('ru-RU')} · {session.timeISO}</div>
      </div>
      <SeatLegend/>
      <SeatPicker venue={venue} occupiedSeats={occupied} selected={selected} onToggle={toggle} pricing={pricing} />
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold">Сумма: {totals} ₽</div>
        <button className="btn bg-gradient-to-r from-brand-600 to-pink-600 hover:from-brand-700 hover:to-pink-700" disabled={!selected.length} onClick={()=>{
          selected.forEach(seat => add({ showId: show.id, sessionId: session.id, seat, price: seat.price, session }))
          setSelected([])
          go('/cart')
        }}>В корзину</button>
      </div>
    </section>
  )
}
