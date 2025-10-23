export default function SeatLegend(){
  return (
    <div className="flex flex-wrap gap-4 text-sm">
      <div className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-green-600 inline-block" aria-hidden></span>Доступно</div>
      <div className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-neutral-600 inline-block" aria-hidden></span>Занято</div>
      <div className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-brand-500 inline-block" aria-hidden></span>Выбрано</div>
      <div className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-red-600 inline-block" aria-hidden></span>Недоступно</div>
    </div>
  )
}
