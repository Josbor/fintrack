import type { ReactNode } from 'react'
import { Button } from '../atoms/Button'

type SocialButtonProps = {
  icon: ReactNode
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
}

export function SocialButton({ icon, children, onClick, disabled = false }: SocialButtonProps) {
  return (
    <Button
      type="button"
      variant="social"
      fullWidth
      onClick={onClick}
      disabled={disabled}
      leadingIcon={icon}
      className="text-sm"
    >
      {children}
    </Button>
  )
}
