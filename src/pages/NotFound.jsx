import { Link } from 'react-router-dom'
export default function NotFound(){
  return (
    <section className="space-y-3 text-center py-16">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-neutral-400">Страница не найдена</p>
      <Link to="/" className="btn inline-block bg-gradient-to-r from-brand-600 to-pink-600 hover:from-brand-700 hover:to-pink-700">На главную</Link>
    </section>
  )
}
