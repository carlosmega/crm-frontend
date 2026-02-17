"use client"

import { useRouter } from 'next/navigation'
import { useAccountMutations } from '@/features/accounts/hooks/use-account-mutations'
import { AccountFormTabs } from '@/features/accounts/components/account-form-tabs'
import { DetailPageHeader } from '@/components/layout/detail-page-header'
import { MobileDetailHeader } from '@/components/layout/mobile-detail-header'
import type { CreateAccountDto } from '@/core/contracts'
import { Button } from '@/components/ui/button'
import { Loader2, Save, X } from 'lucide-react'

export default function NewAccountPage() {
  const router = useRouter()
  const { createAccount, loading } = useAccountMutations()

  const handleSubmit = async (data: CreateAccountDto) => {
    try {
      const newAccount = await createAccount(data)
      // Redirigir al detalle del registro creado
      router.push(`/accounts/${newAccount.accountid}`)
    } catch (error) {
      console.error('Error creating account:', error)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <>
      {/* Mobile Header */}
      <MobileDetailHeader
        backHref="/accounts"
        entityType="NEW ACCOUNT"
        title="New Account"
        actions={
          <Button
            size="sm"
            onClick={() => {
              const form = document.getElementById('account-edit-form') as HTMLFormElement
              form?.requestSubmit()
            }}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          </Button>
        }
      />

      {/* Desktop Header */}
      <DetailPageHeader
        breadcrumbs={[
          { label: 'Sales', href: '/dashboard' },
          { label: 'Accounts', href: '/accounts' },
          { label: 'New Account' },
        ]}
      />

      {/* Content */}
      <div className="flex flex-1 flex-col overflow-y-auto bg-gray-100 dark:bg-gray-900">
        {/* STICKY HEADER - Info + Actions */}
        <div className="md:sticky md:top-0 z-40 bg-gray-100/98 dark:bg-gray-900/98 backdrop-blur-sm">
          {/* Page Header & Actions */}
          <div className="px-4 pt-4 pb-4">
            {/* Desktop Layout: Side by side */}
            <div className="hidden md:flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Create New Account</h1>
                  <p className="text-muted-foreground mt-1">
                    Add a new business account or organization
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={handleCancel} className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    const form = document.getElementById('account-edit-form') as HTMLFormElement
                    form?.requestSubmit()
                  }}
                  disabled={loading}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-medium"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" />
                  Create Account
                </Button>
              </div>
            </div>

            {/* Mobile Layout: Title only (buttons in top header) */}
            <div className="md:hidden">
              <h1 className="text-2xl font-bold tracking-tight">Create New Account</h1>
              <p className="text-muted-foreground mt-1">
                Add a new business account or organization
              </p>
            </div>
          </div>

          {/* Tabs Navigation Container (Portal Target) */}
          <div className="px-4">
            <div id="account-tabs-nav-container" />
          </div>
        </div>

        {/* Main Content - Form with Tabs */}
        <div className="px-4 pb-4 pt-1">
          <AccountFormTabs
            onSubmit={handleSubmit}
            isLoading={loading}
          />
        </div>
      </div>
    </>
  )
}
