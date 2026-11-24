import { formatMoney, type Account } from '../../lib/accounts'

type TotalBalanceCardProps = {
  accounts: Account[]
}

export function TotalBalanceCard({ accounts }: TotalBalanceCardProps) {
  const totals = accounts.reduce<Record<string, number>>((acc, account) => {
    acc[account.currency] = (acc[account.currency] ?? 0) + account.balance
    return acc
  }, {})

  const entries = Object.entries(totals)

  return (
    <section data-tour="total-balance" className="rounded-2xl bg-brand-950 p-6 text-white shadow-glow sm:p-7">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-300">
        Saldo total
      </p>

      {entries.length === 0 ? (
        <p className="mt-3 font-display text-3xl font-extrabold tracking-tight">—</p>
      ) : (
        <div className="mt-3 flex flex-wrap gap-x-8 gap-y-2">
          {entries.map(([currency, amount]) => (
            <p key={currency} className="font-display text-3xl font-extrabold tracking-tight">
              {formatMoney(amount, currency)}
            </p>
          ))}
        </div>
      )}

      <p className="mt-2 text-xs text-brand-200/80">
        {accounts.length === 1 ? '1 cuenta activa' : `${accounts.length} cuentas activas`}
      </p>
    </section>
  )
}
