import { useRef, useState, type ChangeEvent } from 'react'
import { Button } from '../atoms/Button'
import { Spinner } from '../atoms/Spinner'
import { FormAlert } from '../molecules/FormAlert'
import { Modal } from '../molecules/Modal'
import { Tooltip } from '../molecules/Tooltip'
import { SectionTourButton } from '../molecules/SectionTourButton'
import { TransactionRow } from '../molecules/TransactionRow'
import { CreateTransactionForm } from './CreateTransactionForm'
import { EditTransactionForm } from './EditTransactionForm'
import { TransactionPreview } from './TransactionPreview'
import type { Account } from '../../lib/accounts'
import type { Category } from '../../lib/categories'
import { RECEIPT_ACCEPT, validateReceiptFile } from '../../lib/receipts'
import { deleteTransaction, type Transaction } from '../../lib/transactions'

type TransactionsPanelProps = {
  transactions: Transaction[]
  accounts: Account[]
  categories: Category[]
  isLoading: boolean
  error: string | null
  selectedAccountId: string | null
  selectedAccountName: string | null
  onClearAccount: () => void
  onStartTour: () => void
  onStartFormTour: () => void
  onCategoryCreated: (category: Category) => void
  onChanged: () => void
}

export function TransactionsPanel({
  transactions,
  accounts,
  categories,
  isLoading,
  error,
  selectedAccountId,
  selectedAccountName,
  onClearAccount,
  onStartTour,
  onStartFormTour,
  onCategoryCreated,
  onChanged,
}: TransactionsPanelProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [createFile, setCreateFile] = useState<File | null>(null)
  const [createKey, setCreateKey] = useState(0)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [previewId, setPreviewId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const accountsById = new Map(accounts.map((account) => [account.id, account]))
  const categoriesById = new Map(categories.map((category) => [category.id, category]))
  const hasAccounts = accounts.length > 0
  const editingTransaction = transactions.find((item) => item.id === editingId) ?? null
  const previewTransaction = transactions.find((item) => item.id === previewId) ?? null

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
      if (previewId === transaction.id) setPreviewId(null)
      onChanged()
    } catch {
      setActionError('No pudimos eliminar el movimiento. Inténtalo de nuevo.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <section data-tour="movements" className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-slate-900">Movimientos</h2>
          {selectedAccountName ? (
            <p className="flex items-center gap-2 text-xs text-slate-500">
              De <span className="font-semibold text-slate-700">{selectedAccountName}</span>
              <button
                type="button"
                onClick={onClearAccount}
                className="font-semibold text-brand-700 hover:text-brand-800"
              >
                Ver todas
              </button>
            </p>
          ) : (
            <p className="text-xs text-slate-500">Los 50 más recientes de todas tus cuentas</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <SectionTourButton
            label="Guía de movimientos"
            onClick={onStartTour}
            className="max-sm:hidden"
          />
          {!isCreating && (
          <div data-tour="movements-add" className="relative">
            <Tooltip label="Agregar movimiento" disabled={isMenuOpen}>
              <Button
                onClick={() => setIsMenuOpen((open) => !open)}
                disabled={!hasAccounts}
                aria-label="Agregar movimiento"
                aria-expanded={isMenuOpen}
                className="size-10 px-0 text-xl"
              >
                +
              </Button>
            </Tooltip>

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
      </div>

      {!hasAccounts && (
        <FormAlert tone="info">Crea una cuenta antes de registrar movimientos.</FormAlert>
      )}

      <Modal
        open={isCreating && hasAccounts}
        title="Nuevo movimiento"
        size="lg"
        onClose={() => setIsCreating(false)}
        onGuide={onStartFormTour}
        guideLabel="Guía de nuevo movimiento"
      >
        <CreateTransactionForm
          key={`${createKey}-${selectedAccountId ?? 'all'}`}
          accounts={accounts}
          categories={categories}
          onCategoryCreated={onCategoryCreated}
          onCreated={handleSaved}
          onCancel={() => setIsCreating(false)}
          initialFile={createFile}
          lockedAccountId={selectedAccountId}
        />
      </Modal>

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

      {previewTransaction && (
        <TransactionPreview
          transaction={previewTransaction}
          accountName={accountsById.get(previewTransaction.accountId)?.name ?? 'Cuenta eliminada'}
          currency={accountsById.get(previewTransaction.accountId)?.currency ?? 'USD'}
          categoryName={
            previewTransaction.categoryId
              ? (categoriesById.get(previewTransaction.categoryId)?.name ?? null)
              : null
          }
          transferAccountName={
            previewTransaction.transferAccountId
              ? (accountsById.get(previewTransaction.transferAccountId)?.name ?? null)
              : null
          }
          onClose={() => setPreviewId(null)}
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
          <div
            data-tour="movements-list"
            className="rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-12 text-center"
          >
            <p className="text-sm font-semibold text-slate-900">Sin movimientos todavía</p>
            <p className="mt-1 text-xs text-slate-500">
              {selectedAccountName
                ? `${selectedAccountName} aún no tiene movimientos.`
                : 'Registra tu primer ingreso, gasto o transferencia.'}
            </p>
          </div>
        )
      ) : (
        <ul
          data-tour="movements-list"
          className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
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
                onPreview={() => setPreviewId(transaction.id)}
                onEdit={() => startEditing(transaction.id)}
                onDelete={() => handleDelete(transaction)}
              />
            )
          })}
        </ul>
      )}
    </section>
  )
}
