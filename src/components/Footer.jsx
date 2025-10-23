export default function Footer() {
  return (
    <footer className="mt-auto border-t border-neutral-800 bg-neutral-950/80">
      <div className="container mx-auto max-w-6xl px-4 py-8 text-sm text-neutral-400 grid gap-4 sm:grid-cols-2">
        <p>© {new Date().getFullYear()} Театр Онлайн</p>
        <nav className="flex gap-6 justify-start sm:justify-end">
          <a href="#" aria-label="Политика" className="hover:text-white">Политика</a>
          <a href="#" aria-label="Связаться" className="hover:text-white">Связаться</a>
          <a href="#" aria-label="Соцсети" className="hover:text-white">Соцсети</a>
        </nav>
      </div>
    </footer>
  )
}
