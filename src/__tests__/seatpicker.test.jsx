import { render, screen, fireEvent } from '@testing-library/react'
import SeatPicker from '../components/SeatPicker'

const venue = { rows:2, cols:2, zones:[] }
const seats = [
  { row:1, seat:1, status:'available', price:100 },
  { row:1, seat:2, status:'available', price:100 },
  { row:2, seat:1, status:'available', price:100 },
  { row:2, seat:2, status:'available', price:100 },
]

test('selecting seats updates sum outside component (smoke)', ()=>{
  let selected = []
  const onToggle = (seat)=> { 
    const key = (s)=>`${s.row}-${s.col}`
    selected = selected.some(s=>key(s)===key(seat)) ? selected.filter(s=>key(s)!==key(seat)) : [...selected, seat]
  }
  render(<SeatPicker venue={venue} seats={seats} selected={selected} onToggle={onToggle}/>)
  const btn = screen.getByLabelText(/Ряд 1, место 1/i)
  fireEvent.click(btn)
  expect(btn).toBeEnabled()
})
