import { Link } from 'react-router-dom'

export default function Home(){
  return (
    <section className="space-y-8">
      <div className="bg-gradient-to-br from-brand-600 to-pink-600 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Добро пожаловать!</h1>
        <p className="text-white/90 max-w-2xl">
          Здесь будет главный экран с любым промо-контентом, акциями, баннерами и т.д.
        </p>
        <div className="mt-6">
          <Link to="/actors" className="btn bg-black/20 hover:bg-black/30 border-white/40">
            Перейти к артистам
          </Link>
        </div>
      </div>

      {/* Место под будущие секции главной страницы */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="font-semibold mb-1">Секция 1</div>
          <div className="text-sm text-neutral-400">Описание будущего блока</div>
        </div>
        <div className="card p-4">
          <div className="font-semibold mb-1">Секция 2</div>
          <div className="text-sm text-neutral-400">Описание будущего блока</div>
        </div>
        <div className="card p-4">
          <div className="font-semibold mb-1">Секция 3</div>
          <div className="text-sm text-neutral-400">Описание будущего блока</div>
        </div>
      </div>
    </section>
  )
}