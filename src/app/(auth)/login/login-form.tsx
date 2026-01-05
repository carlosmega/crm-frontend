'use client'

/**
 * Enhanced Login Form Component
 * Enterprise-grade authentication with modern UX, animations, and security features
 */

import { useState, useCallback, useMemo, memo } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  Loader2,
  Mail,
  Lock,
  AlertCircle,
  Eye,
  EyeOff,
  Building2,
  TrendingUp,
  Users,
  BarChart3,
  ChevronDown,
  Shield,
  CheckCircle2,
  Sparkles,
  Zap,
} from 'lucide-react'

// Password strength calculation
const calculatePasswordStrength = (password: string): number => {
  if (!password) return 0
  let strength = 0
  if (password.length >= 6) strength += 25
  if (password.length >= 10) strength += 25
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25
  if (/\d/.test(password)) strength += 15
  if (/[^a-zA-Z\d]/.test(password)) strength += 10
  return Math.min(100, strength)
}

const getPasswordStrengthLabel = (strength: number): string => {
  if (strength === 0) return ''
  if (strength < 40) return 'Débil'
  if (strength < 70) return 'Media'
  return 'Fuerte'
}

const getPasswordStrengthColor = (strength: number): string => {
  if (strength === 0) return 'bg-gray-200'
  if (strength < 40) return 'bg-red-500'
  if (strength < 70) return 'bg-yellow-500'
  return 'bg-green-500'
}

// Form validation schema
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  rememberMe: z.boolean().optional(),
})

type LoginFormData = z.infer<typeof loginSchema>

// Memoized feature card component
const FeatureCard = memo(({ icon: Icon, title, description }: {
  icon: any
  title: string
  description: string
}) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5 }}
    className="flex items-start gap-4"
  >
    <div className="h-12 w-12 rounded-lg bg-primary-foreground/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
      <Icon className="h-6 w-6" />
    </div>
    <div>
      <h3 className="font-semibold text-lg mb-1">{title}</h3>
      <p className="text-sm text-primary-foreground/80">{description}</p>
    </div>
  </motion.div>
))

FeatureCard.displayName = 'FeatureCard'

// Memoized demo credential button
const DemoCredentialButton = memo(({
  role,
  email,
  onClick,
  isLoading
}: {
  role: string
  email: string
  onClick: () => void
  isLoading: boolean
}) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    type="button"
    onClick={onClick}
    className="text-left text-sm p-3 rounded-md hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring border border-border/50"
    disabled={isLoading}
  >
    <span className="font-semibold text-primary">{role}:</span>{' '}
    <span className="text-muted-foreground">{email}</span>
  </motion.button>
))

DemoCredentialButton.displayName = 'DemoCredentialButton'

export function LoginForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showDemoCredentials, setShowDemoCredentials] = useState(false)
  const [loginAttempts, setLoginAttempts] = useState(0)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      rememberMe: false,
    },
  })

  const email = watch('email')
  const password = watch('password')
  const rememberMe = watch('rememberMe')

  // Calculate password strength
  const passwordStrength = useMemo(() => calculatePasswordStrength(password), [password])

  const onSubmit = useCallback(async (data: LoginFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      // ✅ PASO 1: Autenticar con Django PRIMERO (desde el navegador)
      // Esto guarda las cookies de sesión de Django en el navegador
      const djangoResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // ✅ CRÍTICO: Guardar cookies de Django
        body: JSON.stringify({
          emailaddress1: data.email,
          password: data.password,
        }),
      })

      if (!djangoResponse.ok) {
        setLoginAttempts(prev => prev + 1)
        setError('Email o contraseña incorrectos. Por favor, verifica tus credenciales e intenta nuevamente.')
        return
      }

      const djangoData = await djangoResponse.json()

      if (!djangoData.success) {
        setLoginAttempts(prev => prev + 1)
        setError('Email o contraseña incorrectos. Por favor, verifica tus credenciales e intenta nuevamente.')
        return
      }

      // ✅ PASO 2: Autenticar con NextAuth (crea sesión JWT)
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        setLoginAttempts(prev => prev + 1)
        setError('Error al crear sesión. Por favor, intenta nuevamente.')
      } else if (result?.ok) {
        // Success animation before redirect
        await new Promise(resolve => setTimeout(resolve, 500))
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err) {
      setLoginAttempts(prev => prev + 1)
      setError('Ocurrió un error inesperado. Por favor, intenta nuevamente.')
    } finally {
      setIsLoading(false)
    }
  }, [router])

  const handleDemoMode = useCallback(() => {
    router.push('/dashboard?demo=true')
  }, [router])

  const fillDemoCredentials = useCallback((role: 'admin' | 'manager' | 'sales') => {
    const credentials = {
      admin: { email: 'admin@crm.com', password: 'admin123' },
      manager: { email: 'manager@crm.com', password: 'manager123' },
      sales: { email: 'sales@crm.com', password: 'sales123' },
    }
    setValue('email', credentials[role].email, { shouldValidate: true })
    setValue('password', credentials[role].password, { shouldValidate: true })
    setShowDemoCredentials(false)
  }, [setValue])

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev)
  }, [])

  // Rate limiting indicator
  const isRateLimited = loginAttempts >= 5
  const attemptsLeft = Math.max(0, 5 - loginAttempts)

  return (
    <div className="w-full min-h-screen grid lg:grid-cols-2 relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/20 pointer-events-none" />

      {/* Left Panel - Branding & Features */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-primary via-primary/95 to-primary/90 text-primary-foreground relative overflow-hidden"
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-10">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute top-1/4 -left-20 w-96 h-96 bg-primary-foreground rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [0, -90, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute bottom-1/4 -right-20 w-96 h-96 bg-primary-foreground rounded-full blur-3xl"
          />
        </div>

        <div className="space-y-2 relative z-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3"
          >
            <div className="h-12 w-12 rounded-xl bg-primary-foreground/10 backdrop-blur-sm flex items-center justify-center">
              <Building2 className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">CRM Sales</h1>
              <div className="flex items-center gap-2">
                <p className="text-sm text-primary-foreground/80">Enterprise Edition</p>
                <Badge variant="secondary" className="text-xs">
                  <Sparkles className="h-3 w-3 mr-1" />
                  v2.0
                </Badge>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="space-y-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-4xl font-bold leading-tight mb-4">
              Gestiona tu pipeline de ventas
              <br />
              <span className="text-primary-foreground/90">de manera inteligente</span>
            </h2>
            <p className="text-lg text-primary-foreground/90 flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Sistema CRM profesional basado en Microsoft Dynamics 365 Sales
            </p>
          </motion.div>

          <div className="space-y-6">
            <FeatureCard
              icon={TrendingUp}
              title="Pipeline Completo"
              description="Gestiona Leads, Opportunities, Quotes y Orders en un solo lugar"
            />
            <FeatureCard
              icon={Users}
              title="Gestión de Clientes"
              description="Administra Accounts y Contacts con información completa"
            />
            <FeatureCard
              icon={BarChart3}
              title="Analytics Avanzado"
              description="Dashboards y reportes para tomar mejores decisiones"
            />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center gap-2 text-sm text-primary-foreground/70 relative z-10"
        >
          <Shield className="h-4 w-4" />
          <span>Conexión segura mediante HTTPS y encriptación end-to-end</span>
        </motion.div>
      </motion.div>

      {/* Right Panel - Login Form */}
      <div className="flex items-center justify-center p-8 bg-background relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="border-border/40 shadow-2xl backdrop-blur-sm bg-card/95">
            <CardHeader className="space-y-3 pb-6">
              {/* Mobile Logo */}
              <div className="lg:hidden flex items-center gap-2 justify-center mb-2">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div className="text-left">
                  <h1 className="text-xl font-bold">CRM Sales</h1>
                  <p className="text-xs text-muted-foreground">Enterprise Edition</p>
                </div>
              </div>

              <div className="space-y-1">
                <CardTitle className="text-2xl font-bold tracking-tight">
                  Iniciar Sesión
                </CardTitle>
                <CardDescription>
                  Ingresa tus credenciales para acceder al sistema
                </CardDescription>
              </div>

              {/* Rate limiting warning */}
              <AnimatePresence>
                {loginAttempts > 0 && attemptsLeft <= 3 && attemptsLeft > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <Alert variant="default" className="border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20">
                      <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
                      <AlertDescription className="text-yellow-700 dark:text-yellow-400">
                        {attemptsLeft} {attemptsLeft === 1 ? 'intento restante' : 'intentos restantes'}
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                )}
                {isRateLimited && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                  >
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Demasiados intentos fallidos. Contacta al administrador.
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardHeader>

            <form onSubmit={handleSubmit(onSubmit)}>
              <CardContent className="space-y-5">
                <AnimatePresence mode="wait">
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                    Email
                    {email && !errors.email && (
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                    )}
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu-email@empresa.com"
                      className={`pl-10 h-11 transition-all ${
                        errors.email
                          ? 'border-destructive focus-visible:ring-destructive'
                          : email && !errors.email
                          ? 'border-green-500 focus-visible:ring-green-500'
                          : ''
                      }`}
                      autoComplete="email"
                      {...register('email')}
                      disabled={isLoading || isRateLimited}
                      aria-invalid={errors.email ? 'true' : 'false'}
                      aria-describedby={errors.email ? 'email-error' : undefined}
                    />
                  </div>
                  <AnimatePresence mode="wait">
                    {errors.email && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        id="email-error"
                        className="text-sm text-destructive"
                        role="alert"
                      >
                        {errors.email.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                      Contraseña
                      {password && passwordStrength >= 70 && (
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                      )}
                    </Label>
                    <button
                      type="button"
                      className="text-sm text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm transition-colors"
                      disabled={isLoading}
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className={`pl-10 pr-10 h-11 transition-all ${
                        errors.password
                          ? 'border-destructive focus-visible:ring-destructive'
                          : password && passwordStrength >= 70
                          ? 'border-green-500 focus-visible:ring-green-500'
                          : ''
                      }`}
                      autoComplete="current-password"
                      {...register('password')}
                      disabled={isLoading || isRateLimited}
                      aria-invalid={errors.password ? 'true' : 'false'}
                      aria-describedby={errors.password ? 'password-error password-strength' : undefined}
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm transition-colors"
                      disabled={isLoading}
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {/* Password strength indicator */}
                  <AnimatePresence mode="wait">
                    {password && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        id="password-strength"
                        className="space-y-1"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Seguridad:</span>
                          <span className={`font-medium ${
                            passwordStrength < 40 ? 'text-red-500' :
                            passwordStrength < 70 ? 'text-yellow-500' :
                            'text-green-500'
                          }`}>
                            {getPasswordStrengthLabel(passwordStrength)}
                          </span>
                        </div>
                        <Progress
                          value={passwordStrength}
                          className="h-1.5"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence mode="wait">
                    {errors.password && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        id="password-error"
                        className="text-sm text-destructive"
                        role="alert"
                      >
                        {errors.password.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Remember Me */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rememberMe"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setValue('rememberMe', checked as boolean)}
                    disabled={isLoading || isRateLimited}
                  />
                  <label
                    htmlFor="rememberMe"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Mantener sesión iniciada
                  </label>
                </div>

                {/* Demo Credentials Collapsible */}
                <Collapsible
                  open={showDemoCredentials}
                  onOpenChange={setShowDemoCredentials}
                  className="border border-border/50 rounded-lg overflow-hidden"
                >
                  <CollapsibleTrigger className="flex w-full items-center justify-between p-3 hover:bg-muted/50 transition-colors">
                    <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Usuarios de prueba
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                        showDemoCredentials ? 'rotate-180' : ''
                      }`}
                    />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-3 pb-3 pt-1 space-y-2">
                    <p className="text-xs text-muted-foreground mb-2">
                      Haz clic en un perfil para autocompletar las credenciales:
                    </p>
                    <div className="grid gap-2">
                      <DemoCredentialButton
                        role="Admin"
                        email="admin@crm.com"
                        onClick={() => fillDemoCredentials('admin')}
                        isLoading={isLoading}
                      />
                      <DemoCredentialButton
                        role="Manager"
                        email="manager@crm.com"
                        onClick={() => fillDemoCredentials('manager')}
                        isLoading={isLoading}
                      />
                      <DemoCredentialButton
                        role="Sales"
                        email="sales@crm.com"
                        onClick={() => fillDemoCredentials('sales')}
                        isLoading={isLoading}
                      />
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </CardContent>

              <CardFooter className="flex flex-col space-y-3 pt-2">
                <Button
                  type="submit"
                  className="w-full h-11 font-medium relative overflow-hidden group"
                  disabled={isLoading || isRateLimited || !isValid}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Iniciando sesión...
                    </>
                  ) : (
                    <>
                      <span className="relative z-10">Iniciar Sesión</span>
                      <motion.div
                        className="absolute inset-0 bg-primary/20"
                        initial={{ x: '-100%' }}
                        whileHover={{ x: '100%' }}
                        transition={{ duration: 0.5 }}
                      />
                    </>
                  )}
                </Button>

                <div className="relative w-full">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">o</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-11 group"
                  onClick={handleDemoMode}
                  disabled={isLoading}
                >
                  <Sparkles className="mr-2 h-4 w-4 group-hover:text-primary transition-colors" />
                  Explorar Demo sin autenticación
                </Button>

                <p className="text-xs text-center text-muted-foreground pt-2">
                  Basado en Microsoft Dynamics 365 Sales
                </p>
              </CardFooter>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
