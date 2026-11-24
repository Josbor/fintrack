import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { Modal } from '../components/molecules/Modal'
import { TotalBalanceCard } from '../components/molecules/TotalBalanceCard'
import { AccountsPanel } from '../components/organisms/AccountsPanel'
import { CategoriesPanel } from '../components/organisms/CategoriesPanel'
import { PreferencesPanel } from '../components/organisms/PreferencesPanel'
import { SettingsMenu, type SettingsSection } from '../components/organisms/SettingsMenu'
import { TourOverlay } from '../components/organisms/TourOverlay'
import { TransactionsPanel } from '../components/organisms/TransactionsPanel'
import { TransferForm } from '../components/organisms/TransferForm'
import { DashboardLayout } from '../components/templates/DashboardLayout'
import { useAccounts } from '../hooks/useAccounts'
import { useCategories } from '../hooks/useCategories'
import { usePageTitle } from '../hooks/usePageTitle'
import { useTransactions } from '../hooks/useTransactions'
import type { Category } from '../lib/categories'
import {
  ACCOUNTS_TOUR,
  MOVEMENT_FORM_TOUR,
  MOVEMENTS_TOUR,
  CATEGORIES_TOUR,
  SCANNER_TOUR,
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
  const [settingsSection, setSettingsSection] = useState<SettingsSection | null>(null)
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

  function handleCategoryCreated(category: Category) {
    setCategories((current) =>
      [...current, category].sort((a, b) => a.name.localeCompare(b.name)),
    )
  }

  function handleCategoryDeleted(categoryId: string) {
    setCategories((current) => current.filter((category) => category.id !== categoryId))
  }

  return (
    <DashboardLayout
      onSignOut={handleSignOut}
      isSigningOut={isSigningOut}
      headerActions={<SettingsMenu onSelect={setSettingsSection} />}
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
        isLoadingCategories={isLoadingCategories}
        error={transactionsData.error}
        selectedAccountId={selectedAccountId}
        selectedAccountName={selectedAccount?.name ?? null}
        onClearAccount={() => setSelectedAccountId(null)}
        onStartTour={() => setActiveTour(MOVEMENTS_TOUR)}
        onStartFormTour={() => setActiveTour(MOVEMENT_FORM_TOUR)}
        onOpenSettings={() => setSettingsSection('categories')}
        onCategoryCreated={handleCategoryCreated}
        onChanged={refreshData}
      />

      <Modal
        open={settingsSection === 'scanner'}
        title="Lector de facturas"
        onClose={() => setSettingsSection(null)}
        onGuide={() => setActiveTour(SCANNER_TOUR)}
        guideLabel="Guía del lector de facturas"
      >
        <PreferencesPanel />
      </Modal>

      <Modal
        open={settingsSection === 'categories'}
        title="Categorías"
        size="lg"
        onClose={() => setSettingsSection(null)}
        onGuide={() => setActiveTour(CATEGORIES_TOUR)}
        guideLabel="Guía de categorías"
      >
        <CategoriesPanel
          categories={categories}
          onCategoryCreated={handleCategoryCreated}
          onCategoryDeleted={handleCategoryDeleted}
        />
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
