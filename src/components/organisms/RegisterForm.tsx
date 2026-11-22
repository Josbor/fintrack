import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import {
  AppleIcon,
  ArrowRightIcon,
  GoogleIcon,
  MailIcon,
  SparklesIcon,
  UserIcon,
} from '../atoms/Icons'
import { Button } from '../atoms/Button'
import { Divider } from '../atoms/Divider'
import { TextLink } from '../atoms/TextLink'
import { AuthCard } from '../molecules/AuthCard'
import { CheckboxField } from '../molecules/CheckboxField'
import { FormAlert } from '../molecules/FormAlert'
import { FormField } from '../molecules/FormField'
import { PasswordField } from '../molecules/PasswordField'
import { PasswordStrength } from '../molecules/PasswordStrength'
import { SocialButton } from '../molecules/SocialButton'

type FieldErrors = {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
  terms?: string
}

type SubmitStatus = 'idle' | 'loading' | 'success'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const LETTER_PATTERN = /[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/
const NUMBER_PATTERN = /\d/

function validateName(value: string) {
  const cleanName = value.trim()
  if (!cleanName) return 'Ingresa tu nombre completo.'
  if (cleanName.length < 2) return 'El nombre debe tener al menos 2 caracteres.'
  return undefined
}

function validateEmail(value: string) {
  const cleanEmail = value.trim()
  if (!cleanEmail) return 'Ingresa tu correo electrónico.'
  if (!EMAIL_PATTERN.test(cleanEmail)) return 'Ingresa un correo electrónico válido.'
  return undefined
}

function validatePassword(value: string) {
  if (!value) return 'Crea una contraseña.'
  if (value.length < 8) return 'La contraseña debe tener al menos 8 caracteres.'
  if (!LETTER_PATTERN.test(value)) return 'La contraseña debe incluir al menos una letra.'
  if (!NUMBER_PATTERN.test(value)) return 'La contraseña debe incluir al menos un número.'
  return undefined
}

function validateConfirmPassword(value: string, password: string) {
  if (!value) return 'Confirma tu contraseña.'
  if (value !== password) return 'Las contraseñas no coinciden.'
  return undefined
}

export function RegisterForm() {
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [status, setStatus] = useState<SubmitStatus>('idle')
  const [formError, setFormError] = useState<string | null>(null)
  const [socialNotice, setSocialNotice] = useState<string | null>(null)

  const isBusy = status === 'loading'

  function resetStatus() {
    if (status === 'success') setStatus('idle')
    setFormError(null)
  }

  function handleNameChange(value: string) {
    setName(value)
    setErrors((previous) => (previous.name ? { ...previous, name: undefined } : previous))
    resetStatus()
  }

  function handleEmailChange(value: string) {
    setEmail(value)
    setErrors((previous) => (previous.email ? { ...previous, email: undefined } : previous))
    resetStatus()
  }

  function handlePasswordChange(value: string) {
    setPassword(value)
    setErrors((previous) => {
      const next = { ...previous }
      if (next.password) next.password = undefined
      if (next.confirmPassword && value === confirmPassword) next.confirmPassword = undefined
      return next
    })
    resetStatus()
  }

  function handleConfirmPasswordChange(value: string) {
    setConfirmPassword(value)
    setErrors((previous) =>
      previous.confirmPassword ? { ...previous, confirmPassword: undefined } : previous,
    )
    resetStatus()
  }

  function handleTermsChange(checked: boolean) {
    setAcceptedTerms(checked)
    if (checked && errors.terms) {
      setErrors((previous) => ({ ...previous, terms: undefined }))
    }
    resetStatus()
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextErrors: FieldErrors = {
      name: validateName(name),
      email: validateEmail(email),
      password: validatePassword(password),
      confirmPassword: validateConfirmPassword(confirmPassword, password),
      terms: acceptedTerms ? undefined : 'Debes aceptar los términos y la política de privacidad.',
    }

    setErrors(nextErrors)

    if (Object.values(nextErrors).some(Boolean)) return

    setStatus('loading')
    setFormError(null)
    setSocialNotice(null)

    const { error, needsConfirmation } = await signUp({
      name: name.trim(),
      email: email.trim(),
      password,
    })

    if (error) {
      setFormError(error)
      setStatus('idle')
      return
    }

    if (needsConfirmation) {
      setStatus('success')
      return
    }

    navigate('/app', { replace: true })
  }

  function handleSocialRegister(provider: string) {
    setSocialNotice(
      `El registro con ${provider} estará disponible pronto. Por ahora, usa el formulario.`,
    )
  }

  return (
    <AuthCard size="wide">
      <header>
        <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-700 ring-1 ring-inset ring-brand-600/10">
          <SparklesIcon className="size-3.5" />
          Empieza gratis
        </span>
        <h1 className="mt-4 font-display text-[1.7rem] font-extrabold leading-tight tracking-tight text-slate-900 sm:text-[2rem]">
          Crea tu cuenta
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          Empieza a ordenar tus finanzas en menos de un minuto.
        </p>
      </header>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <SocialButton
          icon={<GoogleIcon className="size-4" />}
          onClick={() => handleSocialRegister('Google')}
          disabled={isBusy}
        >
          Google
        </SocialButton>
        <SocialButton
          icon={<AppleIcon className="size-4" />}
          onClick={() => handleSocialRegister('Apple')}
          disabled={isBusy}
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
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="Nombre completo"
            required
            error={errors.name}
            leadingIcon={<UserIcon className="size-4" />}
            inputProps={{
              type: 'text',
              value: name,
              onChange: (event) => handleNameChange(event.target.value),
              onBlur: () => {
                if (name) setErrors((previous) => ({ ...previous, name: validateName(name) }))
              },
              autoComplete: 'name',
              placeholder: 'Ana Torres',
              disabled: isBusy,
            }}
          />

          <FormField
            label="Correo electrónico"
            required
            error={errors.email}
            leadingIcon={<MailIcon className="size-4" />}
            inputProps={{
              type: 'email',
              value: email,
              onChange: (event) => handleEmailChange(event.target.value),
              onBlur: () => {
                if (email) setErrors((previous) => ({ ...previous, email: validateEmail(email) }))
              },
              autoComplete: 'email',
              inputMode: 'email',
              placeholder: 'tu@correo.com',
              disabled: isBusy,
            }}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <PasswordField
            label="Contraseña"
            value={password}
            onChange={handlePasswordChange}
            onBlur={() => {
              if (password) {
                setErrors((previous) => ({ ...previous, password: validatePassword(password) }))
              }
            }}
            error={errors.password}
            autoComplete="new-password"
            disabled={isBusy}
          />

          <PasswordField
            label="Confirmar contraseña"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            onBlur={() => {
              if (confirmPassword) {
                setErrors((previous) => ({
                  ...previous,
                  confirmPassword: validateConfirmPassword(confirmPassword, password),
                }))
              }
            }}
            error={errors.confirmPassword}
            autoComplete="new-password"
            disabled={isBusy}
          />
        </div>

        <PasswordStrength password={password} />

        <CheckboxField
          name="terms"
          checked={acceptedTerms}
          onChange={(event) => handleTermsChange(event.target.checked)}
          disabled={isBusy}
          error={errors.terms}
          label={
            <span>
              Acepto los{' '}
              <TextLink
                href="#"
                onClick={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                }}
              >
                términos
              </TextLink>{' '}
              y la{' '}
              <TextLink
                href="#"
                onClick={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                }}
              >
                política de privacidad
              </TextLink>
              .
            </span>
          }
        />

        {formError && <FormAlert tone="error">{formError}</FormAlert>}

        <Button
          type="submit"
          size="lg"
          fullWidth
          isLoading={isBusy}
          trailingIcon={<ArrowRightIcon className="size-4" />}
        >
          {isBusy ? 'Creando cuenta…' : 'Crear mi cuenta'}
        </Button>

        {status === 'success' && (
          <FormAlert tone="success">
            Te enviamos un correo a <strong>{email.trim()}</strong> para confirmar tu cuenta.
            Revisa tu bandeja de entrada y luego{' '}
            <TextLink to="/" className="text-brand-800 underline underline-offset-2">
              inicia sesión
            </TextLink>
            .
          </FormAlert>
        )}
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        ¿Ya tienes cuenta? <TextLink to="/">Inicia sesión</TextLink>
      </p>
    </AuthCard>
  )
}
