import type { ReactNode } from 'react'

type FeatureItemProps = {
  icon: ReactNode
  title: string
  description: string
}

export function FeatureItem({ icon, title, description }: FeatureItemProps) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-white/10 text-brand-200 ring-1 ring-inset ring-white/10">
        {icon}
      </span>
      <span>
        <span className="block text-sm font-semibold text-white">{title}</span>
        <span className="mt-0.5 block text-sm leading-relaxed text-brand-100/55">{description}</span>
      </span>
    </li>
  )
}
