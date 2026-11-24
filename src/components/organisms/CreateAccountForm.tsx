import { useState, type FormEvent } from 'react'
import { Button } from '../atoms/Button'
import { Label } from '../atoms/Label'
import { Select } from '../atoms/Select'
import { FormAlert } from '../molecules/FormAlert'
import { FormField } from '../molecules/FormField'
import { Modal } from '../molecules/Modal'
import {
  ACCOUNT_TYPES,
  CURRENCIES,
  createAccount,
  type AccountType,
} from '../../lib/accounts'

type CreateAccountFormProps = {
  onCreated: () => void
  onCancel: () => void
}

export function CreateAccountForm({ onCreated, onCancel }: CreateAccountFormProps) {
  const [name, setName] = useState('')
  const [type, setType] = useState<AccountType>('checking')
  const [currency, setCurrency] = useState<string>('USD')
  const [initialBalance, setInitialBalance] = useState('0')
  const [nameError, setNameError] = useState<string | null>(null)
  const [balanceError, setBalanceError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedName = name.trim()
    const parsedBalance = Number(initialBalance.replace(',', '.'))

    setNameError(trimmedName ? null : 'Escribe un nombre para la cuenta.')
    setBalanceError(
      initialBalance.trim() === '' || Number.isNaN(parsedBalance)
        ? 'Ingresa un saldo válido (puede ser negativo).'
        : null,
    )

    if (!trimmedName || Number.isNaN(parsedBalance)) return

    setFormError(null)
    setIsSubmitting(true)

    try {
      await createAccount({
        name: trimmedName,
        type,
        currency,
        initialBalance: parsedBalance,
      })
      onCreated()
    } catch {
      setFormError('No pudimos crear la cuenta. Revisa los datos e inténtalo de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal open title="Nueva cuenta" size="lg" onClose={onCancel}>
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div>
        <p className="text-xs text-slate-500">
          El saldo inicial queda registrado como un movimiento de apertura.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label="Nombre"
          required
          error={nameError ?? undefined}
          inputProps={{
            value: name,
            onChange: (event) => setName(event.target.value),
            placeholder: 'Ej. Cuenta de ahorro',
            maxLength: 60,
            autoFocus: true,
          }}
        />

        <FormField
          label="Saldo inicial"
          required
          error={balanceError ?? undefined}
          hint="Puede ser negativo si ya debes dinero."
          inputProps={{
            value: initialBalance,
            onChange: (event) => setInitialBalance(event.target.value),
            inputMode: 'decimal',
            placeholder: '0.00',
          }}
        />

        <div className="space-y-2">
          <Label htmlFor="account-type" required>
            Tipo
          </Label>
          <Select
            id="account-type"
            value={type}
            onChange={(event) => setType(event.target.value as AccountType)}
          >
            {ACCOUNT_TYPES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="account-currency" required>
            Moneda
          </Label>
          <Select
            id="account-currency"
            value={currency}
            onChange={(event) => setCurrency(event.target.value)}
          >
            {CURRENCIES.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {formError && <FormAlert tone="error">{formError}</FormAlert>}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="ghost" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          Crear cuenta
        </Button>
      </div>
    </form>
    </Modal>
  )
}
