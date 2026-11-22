import type { AnchorHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'

type TextLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  href?: string
  to?: string
  subtle?: boolean
  children?: ReactNode
}

export function TextLink({
  subtle = false,
  className = '',
  children,
  to,
  href,
  ...props
}: TextLinkProps) {
  const classes = [
    'rounded-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:ring-offset-2',
    subtle
      ? 'text-slate-400 hover:text-slate-600'
      : 'font-semibold text-brand-700 hover:text-brand-800',
    className,
  ].join(' ')

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    )
  }

  return (
    <a href={href} className={classes} {...props}>
      {children}
    </a>
  )
}
