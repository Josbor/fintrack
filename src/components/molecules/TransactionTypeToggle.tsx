import {
  CREATABLE_TRANSACTION_TYPES,
  type CreatableTransactionType,
} from '../../lib/transactions'

type TransactionTypeToggleProps = {
  value: CreatableTransactionType
  onChange: (value: CreatableTransactionType) => void
}

export function TransactionTypeToggle({ value, onChange }: TransactionTypeToggleProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Tipo de movimiento"
      className="grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1"
    >
      {CREATABLE_TRANSACTION_TYPES.map((item) => {
        const isActive = item.value === value

        return (
          <button
            key={item.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(item.value)}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition duration-200 focus-visible:ring-4 focus-visible:ring-brand-500/20 outline-none ${
              isActive
                ? 'bg-white text-brand-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
