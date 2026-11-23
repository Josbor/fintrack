import { useRef, useState, type ChangeEvent } from 'react'
import { Button } from '../atoms/Button'
import { Spinner } from '../atoms/Spinner'
import { FormAlert } from '../molecules/FormAlert'
import { TransactionRow } from '../molecules/TransactionRow'
import { CreateTransactionForm } from './CreateTransactionForm'
import { EditTransactionForm } from './EditTransactionForm'
import type { Account } from '../../lib/accounts'
import type { Category } from '../../lib/categories'
import { RECEIPT_ACCEPT, getReceiptUrl, validateReceiptFile } from '../../lib/receipts'
import { deleteTransaction, type Transaction } from '../../lib/transactions'

type TransactionsPanelProps = {
  transactions: Transaction[]
  accounts: Account[]
  categories: Category[]
  isLoading: boolean
  error: string | null
  onCategoryCreated: (category: Category) => void
  onChanged: () => void
}

export function TransactionsPanel({
  transactions,
  accounts,
  categories,
  isLoading,
  error,
  onCategoryCreated,
  onChanged,
}: TransactionsPanelProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [createFile, setCreateFile] = useState<File | null>(null)
  const [createKey, setCreateKey] = useState(0)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const accountsById = new Map(accounts.map((account) => [account.id, account]))
  const categoriesById = new Map(categories.map((category) => [category.id, category]))
  const hasAccounts = accounts.length > 0
  const editingTransaction = transactions.find((item) => item.id === editingId) ?? null

  function startCreating(file: File | null = null) {
    setIsMenuOpen(false)
    setEditingId(null)
    setCreateFile(file)
    setCreateKey((key) => key + 1)
    setIsCreating(true)
  }

  function handleInvoiceChosen(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    const validationError = validateReceiptFile(file)
    if (validationError) {
      setActionError(validationError)
      return
    }

    setActionError(null)
    startCreating(file)
  }

  function startEditing(id: string) {
    setIsCreating(false)
    setEditingId(id)
  }

  function handleSaved() {
    setEditingId(null)
    setIsCreating(false)
    onChanged()
  }

  async function handleViewReceipt(transaction: Transaction) {
    if (!transaction.receiptPath) return

    setActionError(null)

    try {
      const url = await getReceiptUrl(transaction.receiptPath)
      window.open(url, '_blank', 'noopener')
    } catch {
      setActionError('No pudimos abrir la factura. Inténtalo de nuevo.')
    }
  }

  async function handleDelete(transaction: Transaction) {
    const confirmed = window.confirm(
      `¿Eliminar "${transaction.description}"? Dejará de contar en el saldo.`,
    )
    if (!confirmed) return

    setActionError(null)
    setDeletingId(transaction.id)

    try {
      await deleteTransaction(transaction.id)
      if (editingId === transaction.id) setEditingId(null)
      onChanged()
    } catch {
      setActionError('No pudimos eliminar el movimiento. Inténtalo de nuevo.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-slate-900">Movimientos</h2>
          <p className="text-xs text-slate-500">Los 50 más recientes</p>
        </div>
        {!isCreating && (
          <div className="relative">
            <Button
              onClick={() => setIsMenuOpen((open) => !open)}
              disabled={!hasAccounts}
              aria-label="Agregar movimiento"
              aria-expanded={isMenuOpen}
              className="size-10 px-0 text-xl"
            >
              +
            </Button>

            {isMenuOpen && (
              <div className="absolute right-0 z-10 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-card">
                <button
                  type="button"
                  onClick={() => startCreating()}
                  className="block w-full px-4 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Agregar manualmente
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false)
                    fileInputRef.current?.click()
                  }}
                  className="block w-full px-4 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Desde una factura
                </button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept={RECEIPT_ACCEPT}
              onChange={handleInvoiceChosen}
              className="sr-only"
              tabIndex={-1}
              aria-hidden="true"
            />
          </div>
        )}
      </div>

      {!hasAccounts && (
        <FormAlert tone="info">Crea una cuenta antes de registrar movimientos.</FormAlert>
      )}

      {isCreating && hasAccounts && (
        <CreateTransactionForm
          key={createKey}
          accounts={accounts}
          categories={categories}
          onCategoryCreated={onCategoryCreated}
          onCreated={handleSaved}
          onCancel={() => setIsCreating(false)}
          initialFile={createFile}
        />
      )}

      {editingTransaction && (
        <EditTransactionForm
          key={editingTransaction.id}
          transaction={editingTransaction}
          accounts={accounts}
          categories={categories}
          onCategoryCreated={onCategoryCreated}
          onSaved={handleSaved}
          onCancel={() => setEditingId(null)}
        />
      )}

      {error && <FormAlert tone="error">{error}</FormAlert>}
      {actionError && <FormAlert tone="error">{actionError}</FormAlert>}

      {isLoading ? (
        <div className="flex items-center justify-center gap-3 py-12 text-sm text-slate-500">
          <Spinner className="text-brand-600" />
          Cargando movimientos…
        </div>
      ) : transactions.length === 0 ? (
        !isCreating && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-12 text-center">
            <p className="text-sm font-semibold text-slate-900">Sin movimientos todavía</p>
            <p className="mt-1 text-xs text-slate-500">
              Registra tu primer ingreso, gasto o transferencia.
            </p>
          </div>
        )
      ) : (
        <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {transactions.map((transaction) => {
            const account = accountsById.get(transaction.accountId)
            const transferAccount = transaction.transferAccountId
              ? accountsById.get(transaction.transferAccountId)
              : undefined
            const category = transaction.categoryId
              ? categoriesById.get(transaction.categoryId)
              : undefined

            return (
              <TransactionRow
                key={transaction.id}
                transaction={transaction}
                accountName={account?.name ?? 'Cuenta eliminada'}
                currency={account?.currency ?? 'USD'}
                categoryName={category?.name ?? null}
                transferAccountName={transferAccount?.name ?? null}
                isEditing={editingId === transaction.id}
                isDeleting={deletingId === transaction.id}
                onEdit={() => startEditing(transaction.id)}
                onViewReceipt={() => handleViewReceipt(transaction)}
                onDelete={() => handleDelete(transaction)}
              />
            )
          })}
        </ul>
      )}
    </section>
  )
}
