# FinTrack — Login y Registro con Supabase

Aplicación de finanzas personales con **autenticación real** sobre Supabase: registro, inicio de sesión, sesión persistente, rutas protegidas y cierre de sesión.

## Stack

- **React 19 + TypeScript** con Vite
- **React Router** para la navegación y las rutas protegidas
- **Supabase** (`@supabase/supabase-js`) para autenticación
- **Tailwind CSS v4** (`@tailwindcss/vite`) para el sistema de estilos
- **CSS Modules** para estilos específicos (animaciones, patrón decorativo y autofill)
- **Atomic Design** como estructura de componentes

## Estructura

```text
src/
├── auth/             # AuthContext, AuthProvider, useAuth, ProtectedRoute, GuestRoute
├── components/
│   ├── atoms/        # Button, Input, Checkbox, Label, Logo, Icons, Spinner, Divider, TextLink
│   ├── molecules/    # AuthCard, FormField, PasswordField, PasswordStrength, CheckboxField,
│   │                 # SocialButton, BalancePreview, FeatureItem, FormAlert, FullScreenLoader
│   ├── organisms/    # LoginForm, RegisterForm, BrandShowcase, AuthFooter
│   └── templates/    # AuthLayout
├── hooks/
│   └── usePageTitle.ts
├── lib/
│   ├── supabase.ts   # Cliente de Supabase
│   └── authErrors.ts # Traducción de errores de auth al español
├── pages/
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   └── DashboardPage.tsx
├── App.tsx           # Rutas
├── index.css         # Tailwind + tokens de tema (@theme)
└── main.tsx
```

## Rutas

| Ruta        | Vista                              | Acceso           |
| ----------- | ---------------------------------- | ---------------- |
| `/`         | Inicio de sesión                   | Solo invitados   |
| `/registro` | Creación de cuenta                 | Solo invitados   |
| `/app`      | Panel del usuario                  | Requiere sesión  |
| `*`         | Redirige a `/`                     | —                |

Si hay sesión activa, `/` y `/registro` redirigen a `/app`. Si no hay sesión, `/app` redirige a `/`.

## Configuración de Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. Copia el archivo de ejemplo y rellena tus credenciales:

   ```bash
   cp .env.example .env.local
   ```

   ```bash
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu_anon_key_publica
   ```

3. En **Authentication → Sign In / Providers → Email**, desactiva **Confirm email** mientras desarrollas (vuelve a activarlo en producción).
4. Reinicia el servidor de desarrollo para que Vite lea las variables.

> La `anon key` es pública y puede vivir en el frontend. La `service_role` / secret **nunca** debe usarse en el cliente.

## Base de datos

El esquema vive en `supabase/migrations/` y se aplica con la CLI de Supabase (incluida como dependencia de desarrollo).

```bash
npx supabase login                                  # solo la primera vez
npx supabase link --project-ref tesmbrksetdwtpjbzmbi
npx supabase db push                                # aplica migraciones pendientes
```

Para un cambio nuevo:

```bash
npx supabase migration new nombre_del_cambio
```

Regla: una migración ya aplicada no se edita; se añade otra que ajuste la anterior.

Tablas: `profiles`, `accounts`, `categories` y `transactions`, todas con RLS (`user_id = auth.uid()`).

## Scripts

```bash
npm install
npm run dev      # Servidor de desarrollo
npm run build    # Typecheck + build de producción
npm run lint     # ESLint
```

## Notas

- El registro y el login llaman a **Supabase Auth**; no hay datos simulados.
- La sesión se persiste en el navegador y se refresca automáticamente.
- El registro valida nombre, correo, contraseña (mínimo 8 caracteres, una letra y un número), confirmación y aceptación de términos.
- El medidor de contraseña indica la seguridad en tiempo real.
- Los errores de Supabase se traducen a mensajes claros en español.
- Los accesos sociales (Google/Apple) muestran un aviso de "próximamente".
- Las tablas de datos y sus políticas RLS se definen en `supabase/migrations/` y se aplican con `npx supabase db push`.
- En escritorio el panel de marca queda fijo al alto de la ventana (`100dvh`) y la pantalla no genera scroll. En ventanas bajas se compacta automáticamente (oculta features y footer) para mantener todo visible.
- Los estilos globales y tokens de color/tipografía viven en `src/index.css`; los estilos muy específicos usan CSS Modules junto a cada componente.
