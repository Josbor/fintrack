import { BrandShowcase } from '../components/organisms/BrandShowcase'
import { LoginForm } from '../components/organisms/LoginForm'
import { AuthLayout } from '../components/templates/AuthLayout'
import { usePageTitle } from '../hooks/usePageTitle'

export function LoginPage() {
  usePageTitle('FinTrack · Inicia sesión')

  return (
    <AuthLayout aside={<BrandShowcase />}>
      <LoginForm />
    </AuthLayout>
  )
}
