import { useId, type InputHTMLAttributes, type ReactNode } from 'react'
import { Checkbox } from '../atoms/Checkbox'
import { AlertCircleIcon } from '../atoms/Icons'

type CheckboxFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: ReactNode
  error?: string
}

export function CheckboxField({ label, error, ...props }: CheckboxFieldProps) {
  const id = useId()
  const errorId = `${id}-error`

  return (
    <div className="space-y-1.5">
      <Checkbox
        id={id}
        label={label}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        {...props}
      />
      {error && (
        <p id={errorId} className="flex items-start gap-1.5 pl-7 text-xs font-medium text-rose-600">
          <AlertCircleIcon className="mt-px size-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  )
}
