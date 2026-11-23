import { WalletIcon } from '../atoms/Icons'
import { accountTypeLabel, formatMoney, type Account } from '../../lib/accounts'

type AccountCardProps = {
  account: Account
  isSelected: boolean
  onSelect: () => void
}

export function AccountCard({ account, isSelected, onSelect }: AccountCardProps) {
  const isNegative = account.balance < 0

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isSelected}
      className={`flex flex-col gap-4 rounded-2xl border bg-white p-5 text-left shadow-sm transition hover:shadow-md focus-visible:ring-4 focus-visible:ring-brand-500/20 outline-none ${
        isSelected
          ? 'border-brand-500 ring-4 ring-brand-500/10'
          : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
          <WalletIcon className="size-5" />
        </span>
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-slate-900">{account.name}</h3>
          <p className="text-xs text-slate-500">{accountTypeLabel(account.type)}</p>
        </div>
      </div>

      <p
        className={`font-display text-2xl font-extrabold tracking-tight ${
          isNegative ? 'text-rose-600' : 'text-slate-900'
        }`}
      >
        {formatMoney(account.balance, account.currency)}
      </p>
    </button>
  )
}
