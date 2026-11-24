import { useState, type FormEvent } from 'react'
import { Button } from '../atoms/Button'
import { Label } from '../atoms/Label'
import { Select } from '../atoms/Select'
import { FormAlert } from '../molecules/FormAlert'
import { FormField } from '../molecules/FormField'
import type { Account } from '../../lib/accounts'
import { createTransaction } from '../../lib/transactions'

type TransferFormProps = {
  accounts: Account[]
  onCreated: () => void
  onCancel: () => void
}

function todayIso() {
  return new Date().toLocaleDateString('en-CA')
}

export function TransferForm({ accounts, onCreated, onCancel }: TransferFormProps) {
  const [fromId, setFromId] = useState(accounts[0]?.id ?? '')
  const [toId, setToId] = useState(
    () =>
      accounts.find(
        (account) => account.id !== accounts[0]?.id && account.currency === accounts[0]?.currency,
      )?.id ?? '',
  )
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [occurredOn, setOccurredOn] = useState(todayIso)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const from = accounts.find((account) => account.id === fromId)
  const to = accounts.find((account) => account.id === toId)
  const destinations = accounts.filter(
    (account) => account.id !== fromId && account.currency === from?.currency,
  )

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const parsedAmount = Number(amount.replace(',', '.'))
    const nextErrors: Record<string, string> = {}

    if (!amount.trim() || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      nextErrors.amount = 'Ingresa un monto mayor a 0.'
    }
    if (!fromId || !toId || fromId === toId) {
      nextErrors.toAccount = 'Elige una cuenta destino distinta a la de origen.'
    } else if (from && to && from.currency !== to.currency) {
      nextErrors.toAccount = 'Solo puedes transferir entre cuentas de la misma moneda.'
    }
    if (!occurredOn) nextErrors.occurredOn = 'Selecciona una fecha.'

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setFormError(null)
    setIsSubmitting(true)

    try {
      await createTransaction({
        type: 'transfer',
        amount: parsedAmount,
        description: description.trim() || 'Transferencia',
        payee: '',
        notes: '',
        occurredOn,
        accountId: fromId,
        transferAccountId: toId,
        categoryId: null,
        receiptPath: null,
      })
      onCreated()
    } catch {
      setFormError('No pudimos registrar la transferencia. Inténtalo de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (accounts.length < 2) {
    return (
      <div className="space-y-4">
        <FormAlert tone="info">Necesitas al menos dos cuentas para transferir.</FormAlert>
        <div className="flex justify-end">
          <Button variant="ghost" onClick={onCancel}>
            Cerrar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div data-tour="transfer-fields" className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="transfer-from" required>
            Desde
          </Label>
          <Select
            id="transfer-from"
            data-tour="transfer-from"
            value={fromId}
            onChange={(event) => {
              const nextFrom = event.target.value
              const nextCurrency = accounts.find((account) => account.id === nextFrom)?.currency
              setFromId(nextFrom)
              const toStillValid = accounts.some(
                (account) =>
                  account.id === toId &&
                  account.id !== nextFrom &&
                  account.currency === nextCurrency,
              )
              if (!toStillValid) setToId('')
              setErrors({})
            }}
          >
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name} ({account.currency})
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="transfer-to" required>
            Hacia
          </Label>
          <Select
            id="transfer-to"
            data-tour="transfer-to"
            value={toId}
            hasError={Boolean(errors.toAccount)}
            onChange={(event) => {
              setToId(event.target.value)
              setErrors({})
            }}
          >
            <option value="">Selecciona una cuenta</option>
            {destinations.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name} ({account.currency})
              </option>
            ))}
          </Select>
          {errors.toAccount && <p className="text-xs font-medium text-rose-600">{errors.toAccount}</p>}
          {destinations.length === 0 && from && (
            <p className="text-xs text-slate-400">
              No tienes otra cuenta en {from.currency} para transferir.
            </p>
          )}
        </div>

        <FormField
          label={from ? `Monto (${from.currency})` : 'Monto'}
          required
          error={errors.amount}
          inputProps={{
            value: amount,
            inputMode: 'decimal',
            placeholder: '0.00',
            autoFocus: true,
            onChange: (event) => {
              setAmount(event.target.value)
              setErrors((current) => ({ ...current, amount: '' }))
            },
          }}
        />

        <FormField
          label="Fecha"
          required
          error={errors.occurredOn}
          inputProps={{
            type: 'date',
            value: occurredOn,
            onChange: (event) => setOccurredOn(event.target.value),
          }}
        />

        <div className="sm:col-span-2">
          <FormField
            label="Descripción"
            hint="Si la dejas vacía, se guardará como «Transferencia»."
            inputProps={{
              value: description,
              maxLength: 120,
              placeholder: 'Ej. Pago de tarjeta',
              onChange: (event) => setDescription(event.target.value),
            }}
          />
        </div>
      </div>

      {formError && <FormAlert tone="error">{formError}</FormAlert>}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="ghost" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={isSubmitting} data-tour="transfer-submit">
          Transferir
        </Button>
      </div>
    </form>
  )
}
