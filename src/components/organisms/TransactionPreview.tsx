import { useState, type ReactNode } from 'react'
import { Button } from '../atoms/Button'
import { ReceiptIcon } from '../atoms/Icons'
import { FormAlert } from '../molecules/FormAlert'
import { Modal } from '../molecules/Modal'
import { formatMoney } from '../../lib/accounts'
import { getReceiptUrl } from '../../lib/receipts'
import type { Transaction, TransactionType } from '../../lib/transactions'

type TransactionPreviewProps = {
  transaction: Transaction
  accountName: string
  currency: string
  categoryName: string | null
  transferAccountName: string | null
  onClose: () => void
}

const typeLabels: Record<TransactionType, string> = {
  income: 'Ingreso',
  expense: 'Gasto',
  transfer: 'Transferencia',
  opening: 'Saldo inicial',
}

const dateFormatter = new Intl.DateTimeFormat('es', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
})

const amountClasses: Record<TransactionType, string> = {
  income: 'text-brand-700',
  expense: 'text-rose-600',
  transfer: 'text-slate-900',
  opening: 'text-slate-900',
}

function Detail({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-6 py-3">
      <dt className="shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </dt>
      <dd className="max-w-[62%] text-right text-sm font-medium text-slate-800">{value}</dd>
    </div>
  )
}

export function TransactionPreview({
  transaction,
  accountName,
  currency,
  categoryName,
  transferAccountName,
  onClose,
}: TransactionPreviewProps) {
  const [isOpeningReceipt, setIsOpeningReceipt] = useState(false)
  const [receiptError, setReceiptError] = useState<string | null>(null)

  const { type, amount, description, payee, notes } = transaction
  const sign = type === 'income' ? '+' : type === 'expense' ? '−' : ''

  async function handleViewReceipt() {
    if (!transaction.receiptPath) return

    setReceiptError(null)
    setIsOpeningReceipt(true)

    try {
      const url = await getReceiptUrl(transaction.receiptPath)
      window.open(url, '_blank', 'noopener')
    } catch {
      setReceiptError('No pudimos abrir la factura. Inténtalo de nuevo.')
    } finally {
      setIsOpeningReceipt(false)
    }
  }

  return (
    <Modal open title="Vista previa del movimiento" onClose={onClose}>
      <div className="space-y-5">
        <div className="rounded-2xl bg-slate-50 px-5 py-4">
          <span className="inline-flex rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500 ring-1 ring-inset ring-slate-200">
            {typeLabels[type]}
          </span>
          <p
            className={`mt-2 font-display text-2xl font-bold tabular-nums ${amountClasses[type]}`}
          >
            {sign}
            {formatMoney(amount, currency)}
          </p>
          <p className="mt-1 text-sm font-medium text-slate-700">{description}</p>
        </div>

        <dl className="divide-y divide-slate-100">
          <Detail label="Fecha" value={dateFormatter.format(new Date(transaction.occurredAt))} />
          <Detail label="Cuenta" value={accountName} />
          {type === 'transfer' && transferAccountName && (
            <Detail label="Cuenta destino" value={transferAccountName} />
          )}
          {categoryName && (
            <Detail
              label="Categoría"
              value={
                <span
                  className={`inline-flex max-w-full items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
                    type === 'income'
                      ? 'bg-brand-50 text-brand-700 ring-brand-200'
                      : 'bg-rose-50 text-rose-700 ring-rose-200'
                  }`}
                >
                  <span className="truncate">{categoryName}</span>
                </span>
              }
            />
          )}
          {payee && <Detail label="Comercio" value={payee} />}
          {notes && <Detail label="Notas" value={notes} />}
        </dl>

        {transaction.receiptPath && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-700">
                <ReceiptIcon className="size-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900">Factura adjunta</p>
                <p className="text-xs text-slate-500">Se abre en una pestaña nueva.</p>
              </div>
            </div>
            <Button
              variant="social"
              onClick={handleViewReceipt}
              isLoading={isOpeningReceipt}
              className="shrink-0 px-3 py-2 text-xs"
            >
              Ver factura
            </Button>
          </div>
        )}

        {receiptError && <FormAlert tone="error">{receiptError}</FormAlert>}
      </div>
    </Modal>
  )
}
