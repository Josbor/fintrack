export function translateAuthError(message: string) {
  const normalized = message.toLowerCase()

  if (normalized.includes('invalid login credentials')) {
    return 'Correo o contraseña incorrectos.'
  }

  if (normalized.includes('email not confirmed')) {
    return 'Confirma tu correo electrónico antes de iniciar sesión.'
  }

  if (normalized.includes('user already registered')) {
    return 'Ya existe una cuenta con este correo electrónico.'
  }

  if (
    normalized.includes('password should be at least') ||
    normalized.includes('password is too short')
  ) {
    return 'La contraseña es demasiado corta.'
  }

  if (
    normalized.includes('email_address_invalid') ||
    normalized.includes('unable to validate email') ||
    normalized.includes('invalid email') ||
    (normalized.includes('email') && normalized.includes('invalid'))
  ) {
    return 'Ingresa un correo electrónico válido.'
  }

  if (normalized.includes('rate limit') || normalized.includes('too many requests')) {
    return 'Demasiados intentos. Espera un momento e inténtalo de nuevo.'
  }

  if (normalized.includes('signup is disabled')) {
    return 'El registro está deshabilitado temporalmente.'
  }

  if (normalized.includes('network') || normalized.includes('fetch')) {
    return 'No pudimos conectar con el servidor. Revisa tu conexión.'
  }

  return 'Ocurrió un error inesperado. Inténtalo de nuevo.'
}
