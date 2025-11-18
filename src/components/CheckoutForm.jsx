import { useEffect, useState } from 'react'

const defaultState = {
  name: '',
  email: '',
  phone: '',
  payment: 'card',
  agree: false,
}

export default function CheckoutForm({
  initialValues = {},
  onChange,
  onSubmit,
  disabled = false,
}) {
  const [form, setForm] = useState({ ...defaultState, ...initialValues })

  useEffect(() => {
    setForm(prev => ({ ...prev, ...initialValues }))
  }, [initialValues])

  const change = (key, value) => {
    setForm(prev => {
      const next = { ...prev, [key]: value }
      onChange?.(next)
      return next
    })
  }

  const isValidEmail = /.+@.+\..+/.test(form.email)
  const isValidPhone = /^\+?\d[\d\s-]{6,}$/.test(form.phone || '')
  const isValid = Boolean(form.name && isValidEmail && isValidPhone && form.agree)

  const handleSubmit = event => {
    event.preventDefault()
    if (disabled || !isValid) return
    onSubmit?.(form)
  }

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <input
        className="input"
        placeholder="Имя"
        value={form.name}
        onChange={e => change('name', e.target.value)}
        aria-label="Имя"
        disabled={disabled}
      />
      <input
        className="input"
        placeholder="Email"
        type="email"
        value={form.email}
        onChange={e => change('email', e.target.value)}
        aria-label="Email"
        disabled={disabled}
      />
      <input
        className="input"
        placeholder="Телефон"
        value={form.phone}
        onChange={e => change('phone', e.target.value)}
        aria-label="Телефон"
        disabled={disabled}
      />
      <div className="flex gap-4">
        <label className="flex items-center gap-2">
          <input
          type="radio"
          name="pay"
          checked={form.payment === 'card'}
          onChange={() => change('payment', 'card')}
          disabled={disabled}
          />
          Карта
        </label>
        <label className="flex items-center gap-2">
          <input
          type="radio"
          name="pay"
          checked={form.payment === 'sbp'}
          onChange={() => change('payment', 'sbp')}
          disabled={disabled}
          />
          СБП
        </label>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.agree}
          onChange={e => change('agree', e.target.checked)}
          disabled={disabled}
        />
        Согласен с условиями
      </label>
      <button
        className="btn w-full bg-gradient-to-r from-brand-600 to-pink-600 hover:from-brand-700 hover:to-pink-700"
        disabled={disabled || !isValid}
        type="submit"
      >
        Оплатить
      </button>
    </form>
  )
}
