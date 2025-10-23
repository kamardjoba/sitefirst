export default function DateChips({ value, onChange }){
  const days = Array.from({length:14}).map((_,i)=>{ const d=new Date(); d.setDate(d.getDate()+i); return d })
  const fmt = (d)=> d.toLocaleDateString('ru-RU', { day:'2-digit', month:'short'})
  const key = (d)=> d.toISOString().slice(0,10)
  return (
    <div className="overflow-x-auto">
      <div className="flex gap-2 py-2">
        <button onClick={()=>onChange('')} className={`px-3 py-1.5 rounded-full border ${!value ? 'border-brand-400 bg-brand-400/10':'border-neutral-700 hover:border-neutral-500'}`}>Любая дата</button>
        {days.map(d=>{ const k=key(d); const active = value===k; return (
          <button key={k} onClick={()=>onChange(k)} className={`px-3 py-1.5 rounded-full border ${active ? 'border-brand-400 bg-brand-400/10' : 'border-neutral-700 hover:border-neutral-500'}`}>
            {fmt(d)}
          </button>
        )})}
      </div>
    </div>
  )
}
