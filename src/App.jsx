import React, { Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Container from './components/Container'
import ErrorBoundary from './components/ErrorBoundary'
import Toasts from './components/Toasts'
import { useBootstrapData } from './hooks/useBootstrapData'

const Home = React.lazy(() => import('./pages/Home'))
const Actors = React.lazy(() => import('./pages/Actors'))
const ActorProfile = React.lazy(() => import('./pages/ActorProfile'))
const Shows = React.lazy(() => import('./pages/Shows'))
const ShowDetails = React.lazy(() => import('./pages/ShowDetails'))
const SeatSelect = React.lazy(() => import('./pages/SeatSelect'))
const Cart = React.lazy(() => import('./pages/Cart'))
const Checkout = React.lazy(() => import('./pages/Checkout'))
const Success = React.lazy(() => import('./pages/Success'))
const NotFound = React.lazy(() => import('./pages/NotFound'))
const AdminActors = React.lazy(() => import('./pages/AdminActors'))

export default function App() {
  useBootstrapData()
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <ErrorBoundary>
        <Suspense fallback={<div className="p-8">Загрузка...</div>}>
          <Container>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/actors" element={<Actors />} />
              <Route path="/actors/:id" element={<ActorProfile />} />
              <Route path="/shows" element={<Shows />} />
              <Route path="/admin" element={<AdminActors/>} />
              <Route path="/shows/:id" element={<ShowDetails />} />
              <Route path="/shows/:id/sessions/:sessionId/seats" element={<SeatSelect />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/success" element={<Success />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Container>
        </Suspense>
      </ErrorBoundary>
      <Footer />
      <Toasts />
    </div>
  )
}
