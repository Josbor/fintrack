import { Spinner } from '../atoms/Spinner'

type FormSkeletonProps = {
  label: string
}

export function FormSkeleton({ label }: FormSkeletonProps) {
  return (
    <div role="status" aria-live="polite" className="space-y-4">
      <p className="flex items-center gap-2 text-sm font-medium text-brand-700">
        <Spinner className="text-brand-600" />
        {label}
      </p>

      <div className="grid gap-4 sm:grid-cols-2" aria-hidden="true">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="space-y-2">
            <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
            <div className="h-11 animate-pulse rounded-xl bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  )
}
