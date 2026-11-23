import { useState, type FormEvent } from 'react'
import { Button } from '../atoms/Button'
import { FormAlert } from '../molecules/FormAlert'
import { FormField } from '../molecules/FormField'
import { CategoryField } from '../molecules/CategoryField'
import { ReceiptField } from '../molecules/ReceiptField'
import { formatMoney, accountTypeLabel, type Account } from '../../lib/accounts'
import type { Category, CategoryKind } from '../../lib/categories'
import { removeReceipt, type ReceiptDraft } from '../../lib/receipts'
import {
  updateTransaction,
  type Transaction,
  type TransactionType,
} from '../../lib/transactions'

type EditTransactionFormProps = {
  transaction: Transaction
  accounts: Account[]
  categories: Category[]
  onCategoryCreated: (category: Category) => void
  onSaved: () => void
  onCancel: () => void
}

const TYPE_LABELS: Record<TransactionType, string> = {
  income: 'Ingreso',
  expense: 'Gasto',
  transfer: 'Transferencia',
  opening: 'Saldo inicial',
}

function dateOnly(isoDate: string) {
  return new Date(isoDate).toLocaleDateString('en-CA')
}

export function EditTransactionForm({
  transaction,
  accounts,
  categories,
  onCategoryCreated,
  onSaved,
  onCancel,
}: EditTransactionFormProps) {
  const account = accounts.find((item) => item.id === transaction.accountId)
  const currency = account?.currency ?? 'USD'
  const canHaveCategory = transaction.type === 'income' || transaction.type === 'expense'
  const categoryKind: CategoryKind = transaction.type === 'income' ? 'income' : 'expense'

  const originalReceiptPath = transaction.receiptPath
  const [description, setDescription] = useState(transaction.description)
  const [occurredOn, setOccurredOn] = useState(() => dateOnly(transaction.occurredAt))
  const [categoryId, setCategoryId] = useState(transaction.categoryId ?? '')
  const [payee, setPayee] = useState(transaction.payee ?? '')
  const [notes, setNotes] = useState(transaction.notes ?? '')
  const [receiptPath, setReceiptPath] = useState<string | null>(originalReceiptPath)
  const [receiptName, setReceiptName] = useState<string | null>(
    originalReceiptPath ? 'Factura adjunta' : null,
  )

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleAttached(attachment: {
    path: string
    name: string
    draft: ReceiptDraft | null
  }) {
    const previous = receiptPath
    setReceiptPath(attachment.path)
    setReceiptName(attachment.name)
    if (previous && previous !== originalReceiptPath) {
      await removeReceipt(previous).catch(() => undefined)
    }
  }

  function handleRemoveReceipt() {
    setReceiptPath(null)
    setReceiptName(null)
  }

  async function discardNewReceipt() {
    if (receiptPath && receiptPath !== originalReceiptPath) {
      await removeReceipt(receiptPath).catch(() => undefined)
    }
  }

  async function handleCancel() {
    await discardNewReceipt()
    onCancel()
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextErrors: Record<string, string> = {}
    if (!description.trim()) nextErrors.description = 'Escribe una descripción.'
    if (!occurredOn) nextErrors.occurredOn = 'Selecciona una fecha.'

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setFormError(null)
    setIsSubmitting(true)

    try {
      await updateTransaction(transaction.id, {
        description,
        payee,
        notes,
        occurredOn,
        categoryId: canHaveCategory && categories.some((item) => item.id === categoryId)
          ? categoryId
          : null,
        receiptPath,
      })

      if (originalReceiptPath && originalReceiptPath !== receiptPath) {
        await removeReceipt(originalReceiptPath).catch(() => undefined)
      }

      onSaved()
    } catch {
      setFormError('No pudimos guardar los cambios. Inténtalo de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
    >
      <div>
        <h2 className="font-display text-lg font-bold text-slate-900">Editar movimiento</h2>
        <p className="mt-1 text-xs text-slate-500">
          {TYPE_LABELS[transaction.type]} · {account?.name ?? 'Cuenta'} ·{' '}
          {accountTypeLabel(account?.type ?? 'checking')} ·{' '}
          {formatMoney(transaction.amount, currency)}
        </p>
        <p className="mt-1 text-xs text-slate-400">
          El monto, el tipo y la cuenta no se pueden cambiar para mantener el saldo trazable.
        </p>
      </div>

      <ReceiptField
        receiptName={receiptName}
        currency={currency}
        onAttached={handleAttached}
        onRemove={handleRemoveReceipt}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label="Descripción"
          required
          error={errors.description}
          inputProps={{
            value: description,
            maxLength: 120,
            onChange: (event) => setDescription(event.target.value),
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

        {canHaveCategory && (
          <CategoryField
            kind={categoryKind}
            categories={categories}
            value={categoryId}
            onChange={setCategoryId}
            onCategoryCreated={onCategoryCreated}
          />
        )}

        <FormField
          label="Comercio o persona"
          inputProps={{
            value: payee,
            maxLength: 80,
            placeholder: 'Opcional',
            onChange: (event) => setPayee(event.target.value),
          }}
        />

        <div className={canHaveCategory ? 'sm:col-span-2' : ''}>
          <FormField
            label="Notas"
            inputProps={{
              value: notes,
              maxLength: 500,
              placeholder: 'Detalles adicionales, opcional',
              onChange: (event) => setNotes(event.target.value),
            }}
          />
        </div>
      </div>

      {formError && <FormAlert tone="error">{formError}</FormAlert>}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="ghost" onClick={handleCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          Guardar cambios
        </Button>
      </div>
    </form>
  )
}
