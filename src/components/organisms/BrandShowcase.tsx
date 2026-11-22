import { ChartPieIcon, ShieldCheckIcon, SparklesIcon, WalletIcon } from '../atoms/Icons'
import { Logo } from '../atoms/Logo'
import { BalancePreview } from '../molecules/BalancePreview'
import { FeatureItem } from '../molecules/FeatureItem'
import styles from './BrandShowcase.module.css'

export function BrandShowcase() {
  return (
    <div
      className={`relative flex h-full flex-col overflow-hidden px-10 py-10 xl:px-14 ${styles.panel}`}
    >
      <div className={styles.grid} aria-hidden="true" />
      <div className={styles.glowTop} aria-hidden="true" />
      <div className={styles.glowBottom} aria-hidden="true" />

      <div className="relative z-10">
        <Logo tone="light" />
      </div>

      <div className="relative z-10 mt-12 max-w-md">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-100 ring-1 ring-inset ring-white/15">
          <SparklesIcon className="size-3.5 text-brand-300" />
          Tu dinero, en orden
        </span>
        <h2 className="mt-6 font-display text-[2.15rem] font-extrabold leading-[1.1] tracking-tight text-white xl:text-[2.6rem]">
          Toma el control de tus <span className="text-brand-300">finanzas</span>.
        </h2>
        <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-brand-100/60">
          Visualiza tus gastos, define presupuestos y alcanza tus metas con una vista clara
          de todo tu dinero.
        </p>
      </div>

      <div className={`relative z-10 mt-9 ${styles.float}`}>
        <BalancePreview />
      </div>

      <ul className={`relative z-10 mt-9 space-y-4 ${styles.features}`}>
        <FeatureItem
          icon={<WalletIcon className="size-4" />}
          title="Todas tus cuentas"
          description="Sincroniza bancos y tarjetas en un solo panel."
        />
        <FeatureItem
          icon={<ChartPieIcon className="size-4" />}
          title="Presupuestos inteligentes"
          description="Recibe alertas antes de salirte de tu plan."
        />
      </ul>

      <div className="relative z-10 mt-auto flex items-center gap-2 pt-10 text-[11px] font-medium text-brand-100/40">
        <ShieldCheckIcon className="size-4 text-brand-300/70" />
        Cifrado AES-256 · Tus datos siempre protegidos
      </div>
    </div>
  )
}
