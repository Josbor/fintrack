import { TextLink } from '../atoms/TextLink'

export function AuthFooter() {
  return (
    <footer className="mt-auto flex flex-col items-center justify-between gap-3 pt-6 text-xs text-slate-400 sm:flex-row">
      <p>© 2026 FinTrack. Todos los derechos reservados.</p>
      <nav aria-label="Enlaces legales" className="flex items-center gap-5">
        <TextLink href="#" subtle onClick={(event) => event.preventDefault()}>
          Privacidad
        </TextLink>
        <TextLink href="#" subtle onClick={(event) => event.preventDefault()}>
          Términos
        </TextLink>
        <TextLink href="#" subtle onClick={(event) => event.preventDefault()}>
          Soporte
        </TextLink>
      </nav>
    </footer>
  )
}
