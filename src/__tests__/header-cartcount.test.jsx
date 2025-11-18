import { render, screen, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Header from '../components/Header'
import { useCartStore } from '../store/cart'

const renderHeader = () =>
  render(
    <MemoryRouter>
      <Header />
    </MemoryRouter>
  )

test('cart count reflects items length', ()=>{
  renderHeader()
  const cartLink = screen.getByRole('link', { name: /Корзина/ })
  expect(cartLink).toHaveTextContent('Корзина')

  act(()=> useCartStore.getState().add({showId:1, sessionId:1, seat:{row:1,col:1}, price:100}))

  expect(cartLink).toHaveTextContent('Корзина (1)')
})
