import { render, screen } from '@testing-library/react'
import Header from '../components/Header'
import { useCartStore } from '../store/cart'
import { act } from 'react'

test('cart count reflects items length', ()=>{
  render(<Header/>)
  expect(screen.getByText(/Корзина/i).nextSibling).toHaveTextContent('0')
  act(()=> useCartStore.getState().add({showId:1, sessionId:1, seat:{row:1,col:1}, price:100}))
  expect(screen.getByText(/Корзина/i).nextSibling).toHaveTextContent('1')
})
