"use client"

import { use } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useAccount } from '@/features/accounts/hooks/use-accounts'
import { useAccountMutations } from '@/features/accounts/hooks/use-account-mutations'
import { AccountInfoHeader } from '@/features/accounts/components/account-info-header'
import { DetailPageHeader } from '@/components/layout/detail-page-header'
import { MobileDetailHeader } from '@/components/layout/mobile-detail-header'
import type { UpdateAccountDto } from '@/core/contracts'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Loader2, Save } from 'lucide-react'

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
      <MobileDetailHeader
        backHref={`/accounts/${account.accountid}`}
        entityType="EDIT ACCOUNT"
        title={account.name}
        actions={
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
        }
      />

      {/* Desktop Header */}
      <DetailPageHeader
        breadcrumbs={[
          { label: 'Sales', href: '/dashboard' },
          { label: 'Accounts', href: '/accounts' },
          { label: account.name, href: `/accounts/${account.accountid}` },
          { label: 'Edit' },
        ]}
      />

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
