import { BrandShowcase } from '../components/organisms/BrandShowcase'
import { RegisterForm } from '../components/organisms/RegisterForm'
import { AuthLayout } from '../components/templates/AuthLayout'
import { usePageTitle } from '../hooks/usePageTitle'

export function RegisterPage() {
  usePageTitle('FinTrack · Crea tu cuenta')

  return (
    <AuthLayout aside={<BrandShowcase />}>
      <RegisterForm />
    </AuthLayout>
  )
}
