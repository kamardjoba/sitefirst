import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useCartStore } from '../store/cart'
import { FaTheaterMasks } from 'react-icons/fa'
import { useAuth } from '../store/auth'
import AuthModal from './AuthModal'

export default function Header() {
  const count = useCartStore((s) => s.items.length)
  const { token, user, me, logout } = useAuth()
  const [open, setOpen] = useState(false)

  useEffect(()=>{ if(token && !user) me() }, [token])

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
          <NavLink to="/actors" className={({isActive})=> (isActive ? "text-white" : "text-neutral-300 hover:text-white")}>Актёры</NavLink>

          {!user ? (
            <button className="btn" onClick={()=>setOpen(true)}>Войти</button>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/profile" className="text-neutral-200 hover:text-white">{user.email}</Link>
              <button className="btn" onClick={logout}>Выйти</button>
            </div>
          )}

          <Link to="/cart" className="relative text-neutral-300 hover:text-white">
            Корзина{count ? ` (${count})` : ''}
          </Link>
        </nav>
      </div>
      {open && <AuthModal onClose={()=>setOpen(false)} />}
    </header>
  )
}