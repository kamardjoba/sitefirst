import { Link, NavLink } from 'react-router-dom'
import { useCartStore } from '../store/cart'
import { FaTheaterMasks } from 'react-icons/fa'

export default function Header() {
  const count = useCartStore((s) => s.items.length)
  return (
    <header className="sticky top-0 z-20 bg-neutral-950/70 backdrop-blur border-b border-neutral-800">
      <div className="container mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-white">
          <span className="inline-flex w-8 h-8 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-pink-500">
            <FaTheaterMasks aria-hidden />
          </span>
          <span>Театр Онлайн</span>
        </Link>
        <nav className="flex items-center gap-4">
          <NavLink to="/" className={({isActive})=>isActive?'text-white font-medium':'text-neutral-300 hover:text-white'}>Главная</NavLink>
          <NavLink to="/actors" className={({isActive})=>isActive?'text-white font-medium':'text-neutral-300 hover:text-white'}>Актёры</NavLink>
          <NavLink to="/shows" className={({isActive})=>isActive?'text-white font-medium':'text-neutral-300 hover:text-white'}>Постановки</NavLink>
          <NavLink to="/cart" className="relative text-neutral-300 hover:text-white">
            Корзина
            <span aria-label="Количество в корзине" className="absolute -top-2 -right-3 text-xs bg-gradient-to-r from-brand-600 to-pink-600 text-white rounded-full px-2 py-0.5">{count}</span>
          </NavLink>
        </nav>
      </div>
    </header>
  )
}
