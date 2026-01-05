"use client"

import { use } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useAccount } from '@/features/accounts/hooks/use-accounts'
import { useAccountMutations } from '@/features/accounts/hooks/use-account-mutations'
import { AccountInfoHeader } from '@/features/accounts/components/account-info-header'
import type { UpdateAccountDto } from '@/core/contracts'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import {
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Loader2, ArrowLeft, Save } from 'lucide-react'

// Dynamic import for AccountFormTabs
const AccountFormTabs = dynamic(
  () => import('@/features/accounts/components/account-form-tabs').then(m => ({ default: m.AccountFormTabs })),
  {
    loading: () => (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-[500px] w-full" />
      </div>
    ),
    ssr: false
  }
)

export default function EditAccountPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { account, loading } = useAccount(resolvedParams.id)
  const { updateAccount, loading: mutating } = useAccountMutations()

  const handleSubmit = async (data: UpdateAccountDto) => {
    try {
      await updateAccount(resolvedParams.id, data)
      router.push(`/accounts/${resolvedParams.id}`)
    } catch (error) {
      console.error('Error updating account:', error)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  if (loading) {
    return (
      <>
        <div className="flex h-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </>
    )
  }

  if (!account) {
    return (
      <>
        <div className="flex h-full flex-col items-center justify-center gap-4">
          <p className="text-lg font-semibold text-muted-foreground">Account not found</p>
        </div>
      </>
    )
  }

  return (
    <>
      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-50 bg-white border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleCancel}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">
                EDIT ACCOUNT
              </p>
              <h1 className="text-sm font-semibold text-gray-900 truncate max-w-[200px]">
                {account.name}
              </h1>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => {
              const form = document.getElementById('account-edit-form') as HTMLFormElement
              form?.requestSubmit()
            }}
            disabled={mutating}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {mutating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          </Button>
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
                <BreadcrumbLink href={`/accounts/${account.accountid}`}>
                  {account.name}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Edit</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      {/* Content - Fondo gris igual que opportunities/leads */}
      <div className="flex flex-1 flex-col overflow-y-auto bg-gray-100">
        {/* STICKY SECTION - Account Info + Tabs */}
        <div className="md:sticky top-0 z-40 bg-gray-100/98 backdrop-blur-sm">
          {/* Account Info Header & Actions - Desktop only */}
          <div className="hidden md:block px-4 pt-4 pb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <AccountInfoHeader account={account} className="border-0 p-0" />
              </div>
              <div className="flex gap-2 pt-1">
                <Button variant="outline" onClick={handleCancel} className="border-gray-300 text-gray-700 hover:bg-gray-50">
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    const form = document.getElementById('account-edit-form') as HTMLFormElement
                    form?.requestSubmit()
                  }}
                  disabled={mutating}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-medium"
                >
                  {mutating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile - Just Info Header, buttons in top header */}
          <div className="md:hidden px-4 pt-4 pb-2">
            <AccountInfoHeader account={account} className="border-0 p-0" />
          </div>

          {/* Tabs Navigation */}
          <div className="px-4">
            <div id="account-tabs-nav-container" />
          </div>
        </div>

        {/* SCROLLABLE CONTENT - Form with Tabs */}
        <div className="px-4 pb-4 pt-1">
          <AccountFormTabs
            account={account}
            onSubmit={handleSubmit}
            isLoading={mutating}
          />
        </div>
      </div>
    </>
  )
}
