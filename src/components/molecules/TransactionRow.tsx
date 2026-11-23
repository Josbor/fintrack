import { Button } from '../atoms/Button'
import { formatMoney } from '../../lib/accounts'
import type { Transaction } from '../../lib/transactions'

type TransactionRowProps = {
  transaction: Transaction
  accountName: string
  currency: string
  categoryName: string | null
  transferAccountName: string | null
  onEdit: () => void
  onViewReceipt: () => void
  onDelete: () => void
  isDeleting: boolean
  isEditing: boolean
}

const dateFormatter = new Intl.DateTimeFormat('es', { day: '2-digit', month: 'short' })

export function TransactionRow({
  transaction,
  accountName,
  currency,
  categoryName,
  transferAccountName,
  onEdit,
  onViewReceipt,
  onDelete,
  isDeleting,
  isEditing,
}: TransactionRowProps) {
  const { type, amount, description, payee, notes } = transaction
  const isIncome = type === 'income'
  const isExpense = type === 'expense'
  const sign = isIncome ? '+' : isExpense ? '−' : ''
  const amountClass = isIncome
    ? 'text-brand-700'
    : isExpense
      ? 'text-rose-600'
      : 'text-slate-900'

  const meta = [
    accountName,
    type === 'transfer' && transferAccountName ? `→ ${transferAccountName}` : null,
    categoryName,
    payee,
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <li
      className={`flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4 ${
        isEditing ? 'bg-brand-50/50' : ''
      }`}
    >
      <time
        dateTime={transaction.occurredAt}
        className="w-14 shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-400"
      >
        {dateFormatter.format(new Date(transaction.occurredAt))}
      </time>

      <div className="min-w-0 flex-1 basis-40">
        <p className="truncate text-sm font-semibold text-slate-900">{description}</p>
        <p className="truncate text-xs text-slate-500">{meta}</p>
        {notes && <p className="truncate text-xs italic text-slate-400">{notes}</p>}
      </div>

      <p className={`shrink-0 text-sm font-bold tabular-nums ${amountClass}`}>
        {sign}
        {formatMoney(amount, currency)}
      </p>

      <div className="flex shrink-0 items-center">
        {transaction.receiptPath && (
          <Button
            variant="ghost"
            onClick={onViewReceipt}
            aria-label={`Ver factura de ${description}`}
            className="px-2.5 py-1.5 text-xs"
          >
            Factura
          </Button>
        )}
        <Button
          variant="ghost"
          onClick={onEdit}
          disabled={isEditing}
          aria-label={`Editar ${description}`}
          className="px-2.5 py-1.5 text-xs"
        >
          Editar
        </Button>
        <Button
          variant="ghost"
          onClick={onDelete}
          isLoading={isDeleting}
          aria-label={`Eliminar ${description}`}
          className="px-2.5 py-1.5 text-xs"
        >
          Eliminar
        </Button>
      </div>
    </li>
  )
}
