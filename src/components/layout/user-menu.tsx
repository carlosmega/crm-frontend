"use client"

import * as React from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import {
  BadgeCheck,
  Bell,
  LogOut,
  Settings,
  ChevronDown,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { getUserRoleDisplayName } from "@/core/contracts/entities"

interface UserMenuProps {
  variant?: "full" | "compact" | "icon"
}

export function UserMenu({ variant = "full" }: UserMenuProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = async () => {
    try {
      await signOut({
        callbackUrl: '/login',
        redirect: true
      })
    } catch (error) {
      console.error('Logout error:', error)
      router.push('/login')
    }
  }

  const handleNavigate = (path: string) => {
    router.push(path)
  }

  const user = session?.user || {
    name: 'Usuario',
    email: 'usuario@crm.com',
    role: null,
  }

  const userInitials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  if (!mounted) {
    return (
      <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "gap-2 px-2",
            variant === "icon" && "px-2",
            variant === "compact" && "px-3",
            variant === "full" && "px-3"
          )}
        >
          <Avatar className="h-8 w-8 rounded-full">
            <AvatarFallback className="rounded-full bg-purple-600 text-white font-medium">
              {userInitials}
            </AvatarFallback>
          </Avatar>

          {variant === "full" && (
            <div className="hidden md:flex flex-col items-start text-left">
              <span className="text-sm font-medium leading-none">{user.name}</span>
              <span className="text-xs text-muted-foreground leading-none mt-0.5">
                {user.email}
              </span>
            </div>
          )}

          {variant === "compact" && (
            <span className="hidden sm:inline-block text-sm font-medium">
              {user.name}
            </span>
          )}

          {variant !== "icon" && (
            <ChevronDown className="hidden sm:block h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-64"
        align="end"
        sideOffset={8}
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
            {user.role && (
              <p className="text-xs leading-none text-muted-foreground mt-1">
                {getUserRoleDisplayName(user.role)}
              </p>
            )}
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => handleNavigate('/settings')}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Configuración</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleNavigate('/profile')}>
            <BadgeCheck className="mr-2 h-4 w-4" />
            <span>Mi Perfil</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleNavigate('/notifications')}>
            <Bell className="mr-2 h-4 w-4" />
            <span>Notificaciones</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleLogout} className="text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Cerrar Sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
