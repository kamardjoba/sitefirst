export default function SearchBar({ value, onChange, placeholder='Поиск...' }){
  return (
    <input aria-label="Поиск" className="input" type="search" value={value} onChange={(e)=>onChange(e.target.value)} placeholder={placeholder}/>
  )
}
