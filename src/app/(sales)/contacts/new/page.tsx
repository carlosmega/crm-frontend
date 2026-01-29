"use client"

import dynamic from 'next/dynamic'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useContactMutations } from '@/features/contacts/hooks/use-contact-mutations'
import { DetailPageHeader } from '@/components/layout/detail-page-header'
import { MobileDetailHeader } from '@/components/layout/mobile-detail-header'
import type { CreateContactDto } from '@/core/contracts'
import { toastHelpers } from '@/shared/utils/toast-helpers'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Loader2, Save, X } from 'lucide-react'

// Dynamic import for ContactFormTabs
const ContactFormTabs = dynamic(
  () => import('@/features/contacts/components/contact-form-tabs').then(m => ({ default: m.ContactFormTabs })),
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

export default function NewContactPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const { createContact, loading } = useContactMutations()

  // Get accountId from URL query params (if coming from account page)
  const accountId = searchParams.get('accountId')

  const handleSubmit = async (data: CreateContactDto) => {
    try {
      // Obtener ownerid del usuario autenticado
      const ownerid = session?.user?.id

      if (!ownerid) {
        console.error('No authenticated user found')
        toastHelpers.error('Authentication required', 'Please sign in to create a contact')
        return
      }

      // Crear contacto con ownerid del usuario autenticado
      const newContact = await createContact({
        ...data,
        ownerid,
      })

      // Show success notification with contact name
      const fullName = `${data.firstname} ${data.lastname}`.trim()
      toastHelpers.success(
        'Contact created successfully',
        `${fullName} has been added to your contacts`
      )

      // Si viene desde una cuenta, regresar a esa cuenta
      // Si no, ir al detalle del contacto creado
      if (accountId) {
        router.push(`/accounts/${accountId}`)
      } else {
        router.push(`/contacts/${newContact.contactid}`)
      }
    } catch (error) {
      console.error('Error creating contact:', error)
      toastHelpers.error(
        'Failed to create contact',
        error instanceof Error ? error.message : 'Please try again'
      )
    }
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <>
      {/* Mobile Header */}
      <MobileDetailHeader
        backHref="/contacts"
        entityType="NEW CONTACT"
        title="New Contact"
        actions={
          <Button
            size="sm"
            onClick={() => {
              const form = document.getElementById('contact-edit-form') as HTMLFormElement
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
          { label: 'Contacts', href: '/contacts' },
          { label: 'New Contact' },
        ]}
      />

      {/* Content */}
      <div className="flex flex-1 flex-col overflow-y-auto bg-gray-100">
        {/* STICKY HEADER - Info + Actions */}
        <div className="md:sticky md:top-0 z-40 bg-gray-100/98 backdrop-blur-sm">
          {/* Page Header & Actions */}
          <div className="px-4 pt-4 pb-4">
            {/* Desktop Layout: Side by side */}
            <div className="hidden md:flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Create New Contact</h1>
                  <p className="text-muted-foreground mt-1">
                    Add a new contact or decision maker
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={handleCancel} className="border-gray-300 text-gray-700 hover:bg-gray-50">
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    const form = document.getElementById('contact-edit-form') as HTMLFormElement
                    form?.requestSubmit()
                  }}
                  disabled={loading}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-medium"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" />
                  Create Contact
                </Button>
              </div>
            </div>

            {/* Mobile Layout: Title only (buttons in top header) */}
            <div className="md:hidden">
              <h1 className="text-2xl font-bold tracking-tight">Create New Contact</h1>
              <p className="text-muted-foreground mt-1">
                Add a new contact or decision maker
              </p>
            </div>
          </div>

          {/* Tabs Navigation Container (Portal Target) */}
          <div className="px-4">
            <div id="contact-tabs-nav-container" />
          </div>
        </div>

        {/* Main Content - Form with Tabs */}
        <div className="px-4 pb-4 pt-1">
          <ContactFormTabs
            contact={accountId ? { parentcustomerid: accountId } as any : undefined}
            onSubmit={handleSubmit}
            isLoading={loading}
            hideActions
          />
        </div>
      </div>
    </>
  )
}
