import { useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import {
  AppleIcon,
  ArrowRightIcon,
  GoogleIcon,
  MailIcon,
  SparklesIcon,
} from '../atoms/Icons'
import { Button } from '../atoms/Button'
import { Checkbox } from '../atoms/Checkbox'
import { Divider } from '../atoms/Divider'
import { TextLink } from '../atoms/TextLink'
import { AuthCard } from '../molecules/AuthCard'
import { FormAlert } from '../molecules/FormAlert'
import { FormField } from '../molecules/FormField'
import { PasswordField } from '../molecules/PasswordField'
import { SocialButton } from '../molecules/SocialButton'

type FieldErrors = {
  email?: string
  password?: string
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function LoginForm() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [socialNotice, setSocialNotice] = useState<string | null>(null)

  const redirectTo = (location.state as { from?: string } | null)?.from ?? '/app'

  function validate(): FieldErrors {
    const nextErrors: FieldErrors = {}
    const cleanEmail = email.trim()

    if (!cleanEmail) {
      nextErrors.email = 'Ingresa tu correo electrónico.'
    } else if (!EMAIL_PATTERN.test(cleanEmail)) {
      nextErrors.email = 'Ingresa un correo electrónico válido.'
    }

    if (!password) {
      nextErrors.password = 'Ingresa tu contraseña.'
    } else if (password.length < 8) {
      nextErrors.password = 'La contraseña debe tener al menos 8 caracteres.'
    }

    return nextErrors
  }

  function handleEmailChange(value: string) {
    setEmail(value)
    setErrors((previous) => (previous.email ? { ...previous, email: undefined } : previous))
    setFormError(null)
  }

  function handlePasswordChange(value: string) {
    setPassword(value)
    setErrors((previous) =>
      previous.password ? { ...previous, password: undefined } : previous,
    )
    setFormError(null)
  }

  function handleEmailBlur() {
    if (!email.trim()) return
    setErrors((previous) => ({
      ...previous,
      email: EMAIL_PATTERN.test(email.trim())
        ? undefined
        : 'Ingresa un correo electrónico válido.',
    }))
  }

  function handlePasswordBlur() {
    if (!password) return
    setErrors((previous) => ({
      ...previous,
      password:
        password.length >= 8 ? undefined : 'La contraseña debe tener al menos 8 caracteres.',
    }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextErrors = validate()
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) return

    setIsLoading(true)
    setFormError(null)
    setSocialNotice(null)

    const { error } = await signIn(email.trim(), password)

    if (error) {
      setFormError(error)
      setIsLoading(false)
      return
    }

    navigate(redirectTo, { replace: true })
  }

  function handleSocialLogin(provider: string) {
    setSocialNotice(
      `El acceso con ${provider} estará disponible pronto. Por ahora, usa tu correo.`,
    )
  }

  return (
    <AuthCard>
      <div>
        <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-700 ring-1 ring-inset ring-brand-600/10">
          <SparklesIcon className="size-3.5" />
          Bienvenido de nuevo
        </span>
        <h1 className="mt-5 font-display text-[1.7rem] font-extrabold leading-tight tracking-tight text-slate-900 sm:text-[2rem]">
          Inicia sesión en tu cuenta
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          Gestiona tus cuentas, presupuestos y metas desde un solo lugar.
        </p>
      </div>

      <div className="mt-7 grid grid-cols-2 gap-3">
        <SocialButton
          icon={<GoogleIcon className="size-4" />}
          onClick={() => handleSocialLogin('Google')}
          disabled={isLoading}
        >
          Google
        </SocialButton>
        <SocialButton
          icon={<AppleIcon className="size-4" />}
          onClick={() => handleSocialLogin('Apple')}
          disabled={isLoading}
        >
          Apple
        </SocialButton>
      </div>

      {socialNotice && (
        <div className="mt-3">
          <FormAlert tone="info">{socialNotice}</FormAlert>
        </div>
      )}

      <Divider label="o con tu correo" className="my-6" />

      <form noValidate onSubmit={handleSubmit} className="space-y-4">
        <FormField
          label="Correo electrónico"
          required
          error={errors.email}
          leadingIcon={<MailIcon className="size-4" />}
          inputProps={{
            type: 'email',
            value: email,
            onChange: (event) => handleEmailChange(event.target.value),
            onBlur: handleEmailBlur,
            autoComplete: 'email',
            inputMode: 'email',
            placeholder: 'tu@correo.com',
            disabled: isLoading,
          }}
        />

        <PasswordField
          value={password}
          onChange={handlePasswordChange}
          onBlur={handlePasswordBlur}
          error={errors.password}
          disabled={isLoading}
        />

        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
          <Checkbox
            name="remember"
            label="Recordarme"
            checked={remember}
            onChange={(event) => setRemember(event.target.checked)}
            disabled={isLoading}
          />
          <TextLink
            href="#"
            className="text-sm"
            onClick={(event) => event.preventDefault()}
          >
            ¿Olvidaste tu contraseña?
          </TextLink>
        </div>

        {formError && <FormAlert tone="error">{formError}</FormAlert>}

        <Button
          type="submit"
          size="lg"
          fullWidth
          isLoading={isLoading}
          trailingIcon={<ArrowRightIcon className="size-4" />}
        >
          {isLoading ? 'Verificando…' : 'Iniciar sesión'}
        </Button>
      </form>

      <p className="mt-7 text-center text-sm text-slate-500">
        ¿Aún no tienes cuenta? <TextLink to="/registro">Crea una gratis</TextLink>
      </p>
    </AuthCard>
  )
}
