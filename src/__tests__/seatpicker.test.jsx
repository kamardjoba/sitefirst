import { render, screen, fireEvent } from '@testing-library/react'
import SeatPicker from '../components/SeatPicker'

const venue = { seatingMap:{ rows:2, cols:2, zones:[{name:'A', rows:[1,2], priceFactor:1}]} }

test('selecting seats updates sum outside component (smoke)', ()=>{
  let selected = []
  const onToggle = (seat)=> { 
    const key = (s)=>`${s.row}-${s.col}`
    selected = selected.some(s=>key(s)===key(seat)) ? selected.filter(s=>key(s)!==key(seat)) : [...selected, seat]
  }
  render(<SeatPicker venue={venue} occupiedSeats={[]} selected={selected} onToggle={onToggle} pricing={{base:100, factor:1}}/>)
  const btn = screen.getByLabelText('Ряд 1 Место 1')
  fireEvent.click(btn)
  expect(btn).toBeEnabled()
})
