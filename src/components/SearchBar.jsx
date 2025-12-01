export default function SearchBar({ value, onChange, placeholder='Поиск...', onKeyPress }){
  return (
    <input 
      aria-label="Поиск" 
      className="input" 
      type="search" 
      value={value} 
      onChange={(e)=>onChange(e.target.value)} 
      onKeyPress={onKeyPress}
      placeholder={placeholder}
    />
  )
}
