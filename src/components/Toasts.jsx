import { useUiStore } from '../store/ui'
export default function Toasts(){
  const toasts = useUiStore((s)=>s.toasts)
  const remove = useUiStore((s)=>s.removeToast)
  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50">
      {toasts.map(t=> (
        <div key={t.id} role="status" className="card px-4 py-3">
          <div className="flex items-start gap-3">
            <div className="font-medium">{t.title}</div>
            <button className="ml-auto text-neutral-400 hover:text-white" onClick={()=>remove(t.id)} aria-label="Закрыть">×</button>
          </div>
          {t.message && <div className="text-sm text-neutral-300 mt-1">{t.message}</div>}
        </div>
      ))}
    </div>
  )
}
