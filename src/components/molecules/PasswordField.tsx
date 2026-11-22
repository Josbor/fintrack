import { useState } from 'react'
import { EyeIcon, EyeOffIcon, LockIcon } from '../atoms/Icons'
import { FormField } from './FormField'

type PasswordFieldProps = {
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  error?: string
  hint?: string
  label?: string
  autoComplete?: string
  disabled?: boolean
}

export function PasswordField({
  value,
  onChange,
  onBlur,
  error,
  hint,
  label = 'Contraseña',
  autoComplete = 'current-password',
  disabled = false,
}: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <FormField
      label={label}
      error={error}
      hint={hint}
      required
      leadingIcon={<LockIcon className="size-4" />}
      trailing={
        <button
          type="button"
          onClick={() => setIsVisible((visible) => !visible)}
          aria-label={isVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          aria-pressed={isVisible}
          disabled={disabled}
          className="-mr-1 grid size-8 shrink-0 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 disabled:cursor-not-allowed"
        >
          {isVisible ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
        </button>
      }
      inputProps={{
        type: isVisible ? 'text' : 'password',
        value,
        onChange: (event) => onChange(event.target.value),
        onBlur,
        autoComplete,
        placeholder: '••••••••••',
        disabled,
      }}
    />
  )
}
