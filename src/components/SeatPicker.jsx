import { useMemo } from 'react'

export default function SeatPicker({ venue, occupiedSeats=[], selected=[], onToggle, pricing }){
  const occupiedKey = useMemo(()=> new Set(occupiedSeats.map(s=>`${s.row}-${s.col}`)), [occupiedSeats])
  const selectedKey = useMemo(()=> new Set(selected.map(s=>`${s.row}-${s.col}`)), [selected])
  const zoneByRow = useMemo(()=>{
    const map = new Map()
    venue.seatingMap.zones.forEach(z=>{ for(let r=z.rows[0]; r<=z.rows[1]; r++){ map.set(r, z) } })
    return map
  },[venue])
  return (
    <div className="inline-block border border-neutral-800 rounded-xl p-3 bg-neutral-900/60">
      <div className="grid gap-1" style={{gridTemplateRows:`repeat(${venue.seatingMap.rows},minmax(0,1fr))`, gridTemplateColumns:`repeat(${venue.seatingMap.cols},minmax(0,1fr))`}}>
        {Array.from({length: venue.seatingMap.rows}).map((_,r)=> 
          Array.from({length: venue.seatingMap.cols}).map((_,c)=> {
            const row=r+1, col=c+1
            const key=`${row}-${col}`
            const isOccupied=occupiedKey.has(key)
            const isSelected=selectedKey.has(key)
            const zone=zoneByRow.get(row)
            const price = Math.round((pricing?.base ?? 0) * (pricing?.factor ?? 1) * (zone?.priceFactor ?? 1))
            const disabled = price<=0
            return (
              <button
                key={key}
                aria-label={`Ряд ${row} Место ${col}`}
                disabled={isOccupied||disabled}
                onClick={()=>onToggle({row, col, price})}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded ${isOccupied?'bg-neutral-600': isSelected?'bg-brand-500 text-white':'bg-green-600 text-white'} focus:outline-none focus:ring-2 focus:ring-white`}
                title={`Ряд ${row}, Место ${col} · ${price} ₽${isOccupied?' · Занято':''}`}
              >
                <span className="sr-only">{`Ряд ${row} Место ${col}`}</span>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
