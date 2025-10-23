export default function Pill({ children, active=false, onClick }){
  return (
    <button type="button" onClick={onClick}
      className={`px-3 py-1 rounded-full border ${active?'border-brand-400 bg-brand-400/10 text-white':'border-neutral-700 bg-neutral-800 text-neutral-300 hover:border-neutral-500'} transition`}>
      {children}
    </button>
  )
}
