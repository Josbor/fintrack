import { useState } from 'react'
import { Button } from '../atoms/Button'
import { Spinner } from '../atoms/Spinner'
import { TransferIcon, WalletIcon } from '../atoms/Icons'
import { AccountCard } from '../molecules/AccountCard'
import { FormAlert } from '../molecules/FormAlert'
import { SectionTourButton } from '../molecules/SectionTourButton'
import { Tooltip } from '../molecules/Tooltip'
import { CreateAccountForm } from './CreateAccountForm'
import type { Account } from '../../lib/accounts'

type AccountsPanelProps = {
  accounts: Account[]
  isLoading: boolean
  error: string | null
  selectedAccountId: string | null
  onSelectAccount: (accountId: string | null) => void
  onTransfer: () => void
  onStartTour: () => void
  onChanged: () => void
}

export function AccountsPanel({
  accounts,
  isLoading,
  error,
  selectedAccountId,
  onSelectAccount,
  onTransfer,
  onStartTour,
  onChanged,
}: AccountsPanelProps) {
  const [isCreating, setIsCreating] = useState(false)

  function handleCreated() {
    setIsCreating(false)
    onChanged()
  }

  function handleSelect(accountId: string) {
    onSelectAccount(accountId === selectedAccountId ? null : accountId)
  }

  return (
    <section data-tour="accounts" className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-slate-900">Cuentas</h2>
          <p className="text-xs text-slate-500">Selecciona una cuenta para ver sus movimientos</p>
        </div>
        <div className="flex items-center gap-2">
          <SectionTourButton
            label="Guía de cuentas"
            onClick={onStartTour}
            className="max-sm:hidden"
          />
          {!isCreating && (
            <div data-tour="accounts-actions" className="flex items-center gap-2">
              <Tooltip label="Transferir entre cuentas">
                <Button
                  variant="social"
                  onClick={onTransfer}
                  disabled={accounts.length < 2}
                  aria-label="Transferir entre cuentas"
                  data-tour="transfer"
                  className="size-10 px-0"
                >
                  <TransferIcon className="size-5" />
                </Button>
              </Tooltip>
              <Tooltip label="Nueva cuenta">
                <Button
                  onClick={() => setIsCreating(true)}
                  aria-label="Nueva cuenta"
                  data-tour="new-account"
                  className="size-10 px-0 text-xl"
                >
                  +
                </Button>
              </Tooltip>
            </div>
          )}
        </div>
      </div>

      {isCreating && (
        <CreateAccountForm onCreated={handleCreated} onCancel={() => setIsCreating(false)} />
      )}

      {error && <FormAlert tone="error">{error}</FormAlert>}

      {isLoading ? (
        <div className="flex items-center justify-center gap-3 py-12 text-sm text-slate-500">
          <Spinner className="text-brand-600" />
          Cargando cuentas…
        </div>
      ) : accounts.length === 0 ? (
        !isCreating && (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-12 text-center">
            <span className="grid size-12 place-items-center rounded-xl bg-brand-50 text-brand-700">
              <WalletIcon className="size-6" />
            </span>
            <p className="text-sm font-semibold text-slate-900">Aún no tienes cuentas</p>
            <p className="max-w-xs text-xs text-slate-500">
              Crea tu primera cuenta y define su saldo inicial para empezar a registrar movimientos.
            </p>
          </div>
        )
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              isSelected={account.id === selectedAccountId}
              onSelect={() => handleSelect(account.id)}
            />
          ))}
        </div>
      )}
    </section>
  )
}
