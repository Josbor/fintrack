import { useId, type InputHTMLAttributes, type ReactNode } from 'react'
import { AlertCircleIcon } from '../atoms/Icons'
import { Input } from '../atoms/Input'
import { Label } from '../atoms/Label'

type FormFieldProps = {
  label: string
  error?: string
  hint?: string
  leadingIcon?: ReactNode
  trailing?: ReactNode
  inputProps?: InputHTMLAttributes<HTMLInputElement>
  required?: boolean
}

export function FormField({
  label,
  error,
  hint,
  leadingIcon,
  trailing,
  inputProps,
  required = false,
}: FormFieldProps) {
  const id = useId()
  const messageId = `${id}-message`
  const hasMessage = Boolean(error || hint)

  return (
    <div className="space-y-2">
      <Label htmlFor={id} required={required}>
        {label}
      </Label>
      <Input
        id={id}
        leadingIcon={leadingIcon}
        trailing={trailing}
        hasError={Boolean(error)}
        aria-invalid={error ? true : undefined}
        aria-describedby={hasMessage ? messageId : undefined}
        required={required}
        {...inputProps}
      />
      {hasMessage && (
        <p
          id={messageId}
          className={
            error
              ? 'flex items-start gap-1.5 text-xs font-medium text-rose-600'
              : 'text-xs text-slate-400'
          }
        >
          {error && <AlertCircleIcon className="mt-px size-3.5 shrink-0" />}
          <span>{error ?? hint}</span>
        </p>
      )}
    </div>
  )
}
