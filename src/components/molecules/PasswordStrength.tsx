import { AlertCircleIcon } from '../atoms/Icons'

type PasswordStrengthProps = {
  password: string
}

const levels = [
  { label: 'Muy débil', bar: 'bg-rose-500', text: 'text-rose-600' },
  { label: 'Débil', bar: 'bg-rose-400', text: 'text-rose-600' },
  { label: 'Aceptable', bar: 'bg-amber-400', text: 'text-amber-600' },
  { label: 'Buena', bar: 'bg-brand-400', text: 'text-brand-700' },
  { label: 'Excelente', bar: 'bg-brand-600', text: 'text-brand-700' },
]

function scorePassword(password: string) {
  let score = 0
  if (password.length >= 8) score += 1
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1
  if (/\d/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password)) score += 1
  return score
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password) {
    return (
      <p className="flex items-start gap-1.5 text-xs text-slate-400">
        <AlertCircleIcon className="mt-px size-3.5 shrink-0" />
        Mínimo 8 caracteres, con una letra y un número.
      </p>
    )
  }

  const score = scorePassword(password)
  const level = levels[score]

  return (
    <div className="space-y-1.5" aria-live="polite">
      <div className="flex gap-1.5" aria-hidden="true">
        {levels.slice(1).map((_, index) => (
          <span
            key={index}
            className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
              index < score ? level.bar : 'bg-slate-200'
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-slate-400">
        Seguridad de la contraseña:{' '}
        <span className={`font-semibold ${level.text}`}>{level.label}</span>
      </p>
    </div>
  )
}
