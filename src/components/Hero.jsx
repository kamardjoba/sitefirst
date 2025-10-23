import SearchBar from './SearchBar'
export default function Hero({ q, setQ, cities=[], activeCity='', onCity }){
  return (
    <section className="relative rounded-3xl border border-neutral-800 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(40%_50%_at_20%_-10%,rgba(139,92,246,0.35),transparent_60%),radial-gradient(40%_50%_at_80%_0%,rgba(236,72,153,0.25),transparent_60%)]" aria-hidden />
      <div className="relative p-8 md:p-12 space-y-6">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">Билеты на спектакли рядом</h1>
        <p className="text-neutral-300 max-w-2xl">Ищи постановки, актёров и площадки. Мгновенная покупка без очередей.</p>
        <div className="max-w-xl"><SearchBar value={q} onChange={setQ} placeholder="Найти постановку, актёра, площадку"/></div>
        <div className="flex flex-wrap gap-2 pt-2">
          {['Все', ...cities].map(c => (
            <button key={c} onClick={()=>onCity(c==='Все'?'':c)} className={`px-4 py-2 rounded-full border ${activeCity===c || (!activeCity && c==='Все') ? 'border-brand-400 bg-brand-400/10 text-white' : 'border-neutral-700 hover:border-neutral-500 text-neutral-300'}`}>
              {c}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
