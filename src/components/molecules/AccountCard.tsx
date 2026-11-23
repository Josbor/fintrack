import { WalletIcon } from '../atoms/Icons'
import { accountTypeLabel, formatMoney, type Account } from '../../lib/accounts'

type AccountCardProps = {
  account: Account
}

export function AccountCard({ account }: AccountCardProps) {
  const isNegative = account.balance < 0

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md">
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
    </article>
  )
}
