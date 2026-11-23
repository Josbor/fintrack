import { useState, type FormEvent } from 'react'
import { Button } from '../atoms/Button'
import { Label } from '../atoms/Label'
import { Select } from '../atoms/Select'
import { FormAlert } from '../molecules/FormAlert'
import { FormField } from '../molecules/FormField'
import { FormSkeleton } from '../molecules/FormSkeleton'
import { TransactionTypeToggle } from '../molecules/TransactionTypeToggle'
import { CategoryField } from '../molecules/CategoryField'
import { ReceiptField } from '../molecules/ReceiptField'
import type { Category, CategoryKind } from '../../lib/categories'
import type { Account } from '../../lib/accounts'
import { removeReceipt, type ReceiptDraft } from '../../lib/receipts'
import {
  createTransaction,
  type CreatableTransactionType,
} from '../../lib/transactions'

type CreateTransactionFormProps = {
  accounts: Account[]
  categories: Category[]
  onCategoryCreated: (category: Category) => void
  onCreated: () => void
  onCancel: () => void
  initialFile?: File | null
}

function todayIso() {
  return new Date().toLocaleDateString('en-CA')
}

export function CreateTransactionForm({
  accounts,
  categories,
  onCategoryCreated,
  onCreated,
  onCancel,
  initialFile = null,
}: CreateTransactionFormProps) {
  const [type, setType] = useState<CreatableTransactionType>('expense')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [occurredOn, setOccurredOn] = useState(todayIso)
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? '')
  const [transferAccountId, setTransferAccountId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [payee, setPayee] = useState('')
  const [notes, setNotes] = useState('')
  const [receiptPath, setReceiptPath] = useState<string | null>(null)
  const [receiptName, setReceiptName] = useState<string | null>(null)
  const [isReadingReceipt, setIsReadingReceipt] = useState(false)

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isTransfer = type === 'transfer'
  const categoryKind: CategoryKind = type === 'income' ? 'income' : 'expense'
  const currency = accounts.find((item) => item.id === accountId)?.currency ?? 'USD'
  const destinationAccounts = accounts.filter((item) => item.id !== accountId)

  function clearError(key: string) {
    setErrors((current) => {
      if (!current[key]) return current
      const next = { ...current }
      delete next[key]
      return next
    })
  }

  async function handleAttached(attachment: {
    path: string
    name: string
    draft: ReceiptDraft | null
  }) {
    const previous = receiptPath
    setReceiptPath(attachment.path)
    setReceiptName(attachment.name)
    if (previous) await removeReceipt(previous).catch(() => undefined)
    if (attachment.draft) applyDraft(attachment.draft)
  }

  function applyDraft(draft: ReceiptDraft) {
    if (draft.amount && !amount.trim()) setAmount(String(draft.amount))
    if (draft.description && !description.trim()) setDescription(draft.description)
    if (draft.merchant && !payee.trim()) setPayee(draft.merchant)
    if (draft.date) setOccurredOn(draft.date)
  }

  async function handleRemoveReceipt() {
    if (receiptPath) await removeReceipt(receiptPath).catch(() => undefined)
    setReceiptPath(null)
    setReceiptName(null)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const parsedAmount = Number(amount.replace(',', '.'))
    const nextErrors: Record<string, string> = {}

    if (!amount.trim() || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      nextErrors.amount = 'Ingresa un monto mayor a 0.'
    }
    if (!description.trim()) {
      nextErrors.description = 'Escribe una descripción.'
    }
    if (!accountId) {
      nextErrors.account = 'Selecciona una cuenta.'
    }
    if (!occurredOn) {
      nextErrors.occurredOn = 'Selecciona una fecha.'
    }
    if (isTransfer && (!transferAccountId || transferAccountId === accountId)) {
      nextErrors.transferAccount = 'Elige una cuenta destino distinta a la de origen.'
    }

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setFormError(null)
    setIsSubmitting(true)

    try {
      await createTransaction({
        type,
        amount: parsedAmount,
        description,
        payee,
        notes,
        occurredOn,
        accountId,
        transferAccountId: isTransfer ? transferAccountId : null,
        categoryId: categories.some((item) => item.id === categoryId) ? categoryId : null,
        receiptPath,
      })
      onCreated()
    } catch {
      setFormError('No pudimos guardar el movimiento. Revisa los datos e inténtalo de nuevo.')
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-lg font-bold text-slate-900">Nuevo movimiento</h2>
          <p className="mt-1 text-xs text-slate-500">Moneda de la cuenta: {currency}</p>
        </div>
        <div className="sm:w-80">
          <TransactionTypeToggle
            value={type}
            onChange={(next) => {
              setType(next)
              setErrors({})
            }}
          />
        </div>
      </div>

      <ReceiptField
        receiptPath={receiptPath}
        receiptName={receiptName}
        currency={currency}
        categoryNames={categories.filter((item) => item.kind === categoryKind).map((item) => item.name)}
        onAttached={handleAttached}
        onDraft={applyDraft}
        onRemove={handleRemoveReceipt}
        initialFile={initialFile}
        onProcessingChange={setIsReadingReceipt}
      />

      {isReadingReceipt ? (
        <FormSkeleton label="Leyendo la factura… los campos se habilitarán al terminar." />
      ) : (
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label="Monto"
          required
          error={errors.amount}
          inputProps={{
            value: amount,
            inputMode: 'decimal',
            placeholder: '0.00',
            autoFocus: true,
            onChange: (event) => {
              setAmount(event.target.value)
              clearError('amount')
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
            onChange: (event) => {
              setOccurredOn(event.target.value)
              clearError('occurredOn')
            },
          }}
        />

        <FormField
          label="Descripción"
          required
          error={errors.description}
          inputProps={{
            value: description,
            maxLength: 120,
            placeholder: isTransfer ? 'Ej. Traspaso a ahorro' : 'Ej. Supermercado',
            onChange: (event) => {
              setDescription(event.target.value)
              clearError('description')
            },
          }}
        />

        <div className="space-y-2">
          <Label htmlFor="transaction-account" required>
            {isTransfer ? 'Cuenta origen' : 'Cuenta'}
          </Label>
          <Select
            id="transaction-account"
            value={accountId}
            hasError={Boolean(errors.account)}
            onChange={(event) => {
              setAccountId(event.target.value)
              if (transferAccountId === event.target.value) setTransferAccountId('')
              clearError('account')
            }}
          >
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </Select>
          {errors.account && <p className="text-xs font-medium text-rose-600">{errors.account}</p>}
        </div>

        {isTransfer ? (
          <div className="space-y-2">
            <Label htmlFor="transaction-transfer-account" required>
              Cuenta destino
            </Label>
            <Select
              id="transaction-transfer-account"
              value={transferAccountId}
              hasError={Boolean(errors.transferAccount)}
              onChange={(event) => {
                setTransferAccountId(event.target.value)
                clearError('transferAccount')
              }}
            >
              <option value="">Selecciona una cuenta</option>
              {destinationAccounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </Select>
            {errors.transferAccount && (
              <p className="text-xs font-medium text-rose-600">{errors.transferAccount}</p>
            )}
          </div>
        ) : (
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

        <FormField
          label="Notas"
          inputProps={{
            value: notes,
            maxLength: 500,
            placeholder: 'Opcional',
            onChange: (event) => setNotes(event.target.value),
          }}
        />
      </div>
      )}

      {formError && <FormAlert tone="error">{formError}</FormAlert>}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          variant="ghost"
          onClick={async () => {
            if (receiptPath) await removeReceipt(receiptPath).catch(() => undefined)
            onCancel()
          }}
          disabled={isSubmitting || isReadingReceipt}
        >
          Cancelar
        </Button>
        <Button type="submit" isLoading={isSubmitting} disabled={isReadingReceipt}>
          Guardar movimiento
        </Button>
      </div>
    </form>
  )
}
