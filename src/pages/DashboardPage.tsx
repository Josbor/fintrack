import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { Button } from '../components/atoms/Button'
import { SettingsIcon } from '../components/atoms/Icons'
import { Modal } from '../components/molecules/Modal'
import { TotalBalanceCard } from '../components/molecules/TotalBalanceCard'
import { AccountsPanel } from '../components/organisms/AccountsPanel'
import { PreferencesPanel } from '../components/organisms/PreferencesPanel'
import { TourOverlay } from '../components/organisms/TourOverlay'
import { TransactionsPanel } from '../components/organisms/TransactionsPanel'
import { TransferForm } from '../components/organisms/TransferForm'
import { DashboardLayout } from '../components/templates/DashboardLayout'
import { useAccounts } from '../hooks/useAccounts'
import { useCategories } from '../hooks/useCategories'
import { usePageTitle } from '../hooks/usePageTitle'
import { useTransactions } from '../hooks/useTransactions'
import {
  ACCOUNTS_TOUR,
  MOVEMENT_FORM_TOUR,
  MOVEMENTS_TOUR,
  SETTINGS_TOUR,
  TRANSFER_TOUR,
} from '../tour/tours'
import type { TourDefinition } from '../tour/types'

export function DashboardPage() {
  usePageTitle('FinTrack · Tu panel')

  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const accountsData = useAccounts()
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null)
  const transactionsData = useTransactions(selectedAccountId)
  const { categories, setCategories, isLoading: isLoadingCategories } = useCategories()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isTransferOpen, setIsTransferOpen] = useState(false)
  const [activeTour, setActiveTour] = useState<TourDefinition | null>(null)

  const selectedAccount =
    accountsData.accounts.find((account) => account.id === selectedAccountId) ?? null

  const fullName = (user?.user_metadata?.full_name as string | undefined)?.trim()
  const firstName = fullName?.split(' ')[0] ?? 'de nuevo'

  function refreshData() {
    accountsData.reload()
    transactionsData.reload()
  }

  async function handleSignOut() {
    setIsSigningOut(true)
    await signOut()
    navigate('/', { replace: true })
  }

  return (
    <DashboardLayout
      onSignOut={handleSignOut}
      isSigningOut={isSigningOut}
      headerActions={
        <Button
          variant="ghost"
          onClick={() => setIsSettingsOpen(true)}
          data-tour="settings"
          aria-label="Configuración"
          className="px-2.5 whitespace-nowrap sm:px-4"
        >
          <SettingsIcon className="size-5 sm:hidden" />
          <span className="hidden sm:inline">Configuración</span>
        </Button>
      }
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">
          Tu panel
        </p>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Hola, {firstName}
        </h1>
      </div>

      <TotalBalanceCard accounts={accountsData.accounts} />

      <AccountsPanel
        accounts={accountsData.accounts}
        isLoading={accountsData.isLoading}
        error={accountsData.error}
        selectedAccountId={selectedAccountId}
        onSelectAccount={setSelectedAccountId}
        onTransfer={() => setIsTransferOpen(true)}
        onStartTour={() => setActiveTour(ACCOUNTS_TOUR)}
        onChanged={refreshData}
      />

      <TransactionsPanel
        transactions={transactionsData.transactions}
        accounts={accountsData.accounts}
        categories={categories}
        isLoading={transactionsData.isLoading || isLoadingCategories}
        error={transactionsData.error}
        selectedAccountId={selectedAccountId}
        selectedAccountName={selectedAccount?.name ?? null}
        onClearAccount={() => setSelectedAccountId(null)}
        onStartTour={() => setActiveTour(MOVEMENTS_TOUR)}
        onStartFormTour={() => setActiveTour(MOVEMENT_FORM_TOUR)}
        onCategoryCreated={(category) =>
          setCategories((current) =>
            [...current, category].sort((a, b) => a.name.localeCompare(b.name)),
          )
        }
        onChanged={refreshData}
      />

      <Modal
        open={isSettingsOpen}
        title="Configuración"
        onClose={() => setIsSettingsOpen(false)}
        onGuide={() => setActiveTour(SETTINGS_TOUR)}
        guideLabel="Guía de configuración"
      >
        <PreferencesPanel />
      </Modal>

      <Modal
        open={isTransferOpen}
        title="Transferir entre cuentas"
        onClose={() => setIsTransferOpen(false)}
        onGuide={() => setActiveTour(TRANSFER_TOUR)}
        guideLabel="Guía de transferencias"
      >
        <TransferForm
          accounts={accountsData.accounts}
          onCreated={() => {
            setIsTransferOpen(false)
            refreshData()
          }}
          onCancel={() => setIsTransferOpen(false)}
        />
      </Modal>

      <TourOverlay tour={activeTour} onClose={() => setActiveTour(null)} />
    </DashboardLayout>
  )
}
