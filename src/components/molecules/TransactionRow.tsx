import { Button } from '../atoms/Button'
import { EyeIcon, PencilIcon, TrashIcon } from '../atoms/Icons'
import { formatMoney } from '../../lib/accounts'
import type { Transaction } from '../../lib/transactions'
import { Tooltip } from './Tooltip'

type TransactionRowProps = {
  transaction: Transaction
  accountName: string
  currency: string
  categoryName: string | null
  transferAccountName: string | null
  onPreview: () => void
  onEdit: () => void
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
  onPreview,
  onEdit,
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
      className={`flex flex-col gap-3 px-4 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4 sm:gap-y-2 sm:px-5 ${
        isEditing ? 'bg-brand-50/50' : ''
      }`}
    >
      <div className="flex min-w-0 items-center gap-3 sm:contents">
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
      </div>

      <div className="flex shrink-0 items-center justify-end gap-0.5">
        <Tooltip label="Vista previa">
          <Button
            variant="ghost"
            onClick={onPreview}
            aria-label={`Vista previa de ${description}`}
            className="size-9 px-0"
          >
            <EyeIcon className="size-4.5" />
          </Button>
        </Tooltip>
        <Tooltip label="Editar">
          <Button
            variant="ghost"
            onClick={onEdit}
            disabled={isEditing}
            aria-label={`Editar ${description}`}
            className="size-9 px-0"
          >
            <PencilIcon className="size-4.5" />
          </Button>
        </Tooltip>
        <Tooltip label="Eliminar">
          <Button
            variant="ghost"
            onClick={onDelete}
            isLoading={isDeleting}
            aria-label={`Eliminar ${description}`}
            className="size-9 px-0"
          >
            <TrashIcon className="size-4.5" />
          </Button>
        </Tooltip>
      </div>
    </li>
  )
}
