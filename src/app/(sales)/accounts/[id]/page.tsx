"use client"

import { use } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useAccount } from '@/features/accounts/hooks/use-accounts'
import { useAccountMutations } from '@/features/accounts/hooks/use-account-mutations'
import { AccountInfoHeader } from '@/features/accounts/components/account-info-header'
import { LogActivityButton } from '@/features/activities/components'
import { AccountStateCode } from '@/core/contracts'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Edit,
  Trash2,
  XCircle,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  MoreVertical,
  FileText,
} from 'lucide-react'

// Dynamic import for account detail tabs
const AccountDetailTabs = dynamic(
  () => import('@/features/accounts/components/account-detail-tabs').then(mod => ({ default: mod.AccountDetailTabs })),
  { ssr: false }
)

export default function AccountDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { account, loading } = useAccount(resolvedParams.id)
  const { deleteAccount, deactivateAccount, activateAccount, loading: mutating } = useAccountMutations()

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this account?')) {
      try {
        await deleteAccount(resolvedParams.id)
        router.push('/accounts')
      } catch (error) {
        console.error('Error deleting account:', error)
      }
    }
  }

  const handleDeactivate = async () => {
    if (confirm('Are you sure you want to deactivate this account?')) {
      try {
        await deactivateAccount(resolvedParams.id)
        window.location.reload()
      } catch (error) {
        console.error('Error deactivating account:', error)
      }
    }
  }

  const handleActivate = async () => {
    try {
      await activateAccount(resolvedParams.id)
      window.location.reload()
    } catch (error) {
      console.error('Error activating account:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!account) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <p className="text-lg font-semibold text-muted-foreground">Account not found</p>
        <Button asChild>
          <Link href="/accounts">Back to Accounts</Link>
        </Button>
      </div>
    )
  }

  return (
    <>
      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-50 bg-white border-b">
        <div className="flex items-center justify-between px-4 py-3">
          {/* LEFT: Back Button + Title */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              asChild
            >
              <Link href="/accounts">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">
                ACCOUNTS
              </p>
              <h1 className="text-sm font-semibold text-gray-900 truncate">
                {account.name}
              </h1>
            </div>
          </div>

          {/* RIGHT: Hamburger + Actions */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Navigation Menu */}
            <SidebarTrigger className="h-8 w-8" />

            {/* Separator */}
            <div className="h-6 w-px bg-gray-300 mx-1" />

            {/* Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href={`/accounts/${account.accountid}/edit`} className="flex items-center cursor-pointer">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <FileText className="mr-2 h-4 w-4" />
                  Log Activity
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {account.statecode === AccountStateCode.Active ? (
                  <DropdownMenuItem onClick={handleDeactivate} disabled={mutating}>
                    <XCircle className="mr-2 h-4 w-4" />
                    Deactivate
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={handleActivate} disabled={mutating}>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Activate
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDelete} disabled={mutating} className="text-destructive focus:text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Desktop Header */}
      <header className="hidden md:flex sticky top-0 z-50 h-16 shrink-0 items-center gap-2 bg-background border-b transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard">Sales</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbLink href="/accounts">Accounts</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>{account.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      {/* Content - Fondo gris igual que opportunities/leads */}
      <div className="flex flex-1 flex-col overflow-y-auto bg-gray-100">
        {/* STICKY SECTION - Account Info Header + Actions + Tabs */}
        <div className="md:sticky md:top-0 z-40 bg-gray-100/98 backdrop-blur-sm">
          {/* Account Info Header & Actions */}
          <div className="px-4 pt-4 pb-4">
            {/* Desktop Layout: Side by side */}
            <div className="hidden md:flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <AccountInfoHeader account={account} className="border-0 p-0" />
              </div>
              <div className="flex gap-2">
                <LogActivityButton
                  regardingId={account.accountid}
                  regardingType="account"
                  regardingName={account.name}
                  showQuickActions
                />
                {account.statecode === AccountStateCode.Active ? (
                  <Button
                    variant="outline"
                    onClick={handleDeactivate}
                    disabled={mutating}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Deactivate
                  </Button>
                ) : (
                  <Button
                    onClick={handleActivate}
                    disabled={mutating}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-medium"
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Activate
                  </Button>
                )}
                <Button asChild variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                  <Link href={`/accounts/${account.accountid}/edit`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDelete}
                  disabled={mutating}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>

            {/* Mobile Layout: Only Info Header (actions in dropdown menu) */}
            <div className="md:hidden">
              <AccountInfoHeader account={account} className="border-0 p-0" />
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="px-4">
            <div id="account-tabs-nav-container" />
          </div>
        </div>

        {/* CONTENIDO SCROLLABLE - Tabs with account details */}
        <div className="px-4 pb-4 pt-1">
          <AccountDetailTabs account={account} />
        </div>
      </div>
    </>
  )
}
