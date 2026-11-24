import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

function StrokeIcon({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  )
}

export function UserIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </StrokeIcon>
  )
}

export function TransferIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M4 8h13" />
      <path d="m13 4 4 4-4 4" />
      <path d="M20 16H7" />
      <path d="m11 12-4 4 4 4" />
    </StrokeIcon>
  )
}

export function MailIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="m4.5 7.5 6.6 4.7a1.6 1.6 0 0 0 1.8 0l6.6-4.7" />
    </StrokeIcon>
  )
}

export function LockIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
      <path d="M8 10.5V7.5a4 4 0 1 1 8 0v3" />
      <path d="M12 14.5v2" />
    </StrokeIcon>
  )
}

export function EyeIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.8" />
    </StrokeIcon>
  )
}

export function EyeOffIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M4 4l16 16" />
      <path d="M9.9 5.9A9.6 9.6 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17 17 0 0 1-2.4 3.2" />
      <path d="M6.6 7.9A17.4 17.4 0 0 0 2.5 12S6 18.5 12 18.5a9.8 9.8 0 0 0 3.6-.7" />
      <path d="M10.2 10.3a2.8 2.8 0 0 0 3.6 3.6" />
    </StrokeIcon>
  )
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M4.5 12h15" />
      <path d="m13.5 6 6 6-6 6" />
    </StrokeIcon>
  )
}

export function SettingsIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
    </StrokeIcon>
  )
}

export function LogOutIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
    </StrokeIcon>
  )
}

export function HelpIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.6 9.2a2.5 2.5 0 0 1 4.9.6c0 1.7-2.5 2-2.5 3.7" />
      <path d="M12 17.2h.01" />
    </StrokeIcon>
  )
}

export function CheckIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="m5 12.5 4.5 4.5L19 7" />
    </StrokeIcon>
  )
}

export function AlertCircleIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5v5" />
      <path d="M12 16.2h.01" />
    </StrokeIcon>
  )
}

export function TrendingUpIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="m3.5 17 5.5-5.5 3.5 3.5 8-8" />
      <path d="M15.5 7h5v5" />
    </StrokeIcon>
  )
}

export function WalletIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18a2 2 0 0 1 2 2v1" />
      <rect x="3" y="7.5" width="18" height="12" rx="2.5" />
      <path d="M16 13.5h2.5" />
    </StrokeIcon>
  )
}

export function SparklesIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M12 3.5 13.6 8 18 9.6 13.6 11.2 12 15.7l-1.6-4.5L6 9.6 10.4 8 12 3.5Z" />
      <path d="m18.5 15 .8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2Z" />
    </StrokeIcon>
  )
}

export function GoogleIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="#4285F4"
        d="M21.6 12.23c0-.68-.06-1.36-.19-2.02H12v3.83h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.24c1.9-1.75 2.98-4.33 2.98-7.33Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.96-.9 6.62-2.44l-3.24-2.5c-.9.6-2.05.96-3.38.96-2.6 0-4.8-1.76-5.59-4.12H3.06v2.58A10 10 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.41 13.9a6 6 0 0 1 0-3.8V7.52H3.06a10 10 0 0 0 0 8.96l3.35-2.58Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.98c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.94 5.52l3.35 2.58C7.2 7.74 9.4 5.98 12 5.98Z"
      />
    </svg>
  )
}

