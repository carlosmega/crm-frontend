"use client"

import { use } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useContact } from '@/features/contacts/hooks/use-contacts'
import { useContactMutations } from '@/features/contacts/hooks/use-contact-mutations'
import { ContactInfoHeader } from '@/features/contacts/components/contact-info-header'
import { DetailPageHeader } from '@/components/layout/detail-page-header'
import { MobileDetailHeader } from '@/components/layout/mobile-detail-header'
import type { UpdateContactDto } from '@/core/contracts'
import { toastHelpers } from '@/shared/utils/toast-helpers'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Loader2, Save } from 'lucide-react'

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

export default function EditContactPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { contact, loading } = useContact(resolvedParams.id)
  const { updateContact, loading: mutating } = useContactMutations()

  const handleSubmit = async (data: UpdateContactDto) => {
    try {
      const updatedContact = await updateContact(resolvedParams.id, data)

      // Show success notification with contact name
      const fullName = updatedContact?.fullname || 'Contact'
      toastHelpers.success(
        'Contact updated successfully',
        `${fullName}'s information has been saved`
      )

      // ✅ Invalidar caché de Next.js para que todas las páginas se actualicen
      router.refresh()

      // ✅ Navegar con el contacto actualizado para actualización inmediata
      router.push(`/contacts/${resolvedParams.id}?updated=${Date.now()}`)
    } catch (error) {
      console.error('Error updating contact:', error)
      toastHelpers.error(
        'Failed to update contact',
        error instanceof Error ? error.message : 'Please try again'
      )
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

  if (!contact) {
    return (
      <>
        <div className="flex h-full flex-col items-center justify-center gap-4">
          <p className="text-lg font-semibold text-muted-foreground">Contact not found</p>
        </div>
      </>
    )
  }

  return (
    <>
      {/* Mobile Header */}
      <MobileDetailHeader
        backHref={`/contacts/${contact.contactid}`}
        entityType="EDIT CONTACT"
        title={contact.fullname}
        actions={
          <Button
            size="sm"
            onClick={() => {
              const form = document.getElementById('contact-edit-form') as HTMLFormElement
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
          { label: 'Contacts', href: '/contacts' },
          { label: contact.fullname, href: `/contacts/${contact.contactid}` },
          { label: 'Edit' },
        ]}
      />

      {/* Content - Fondo gris igual que opportunities/leads */}
      <div className="flex flex-1 flex-col overflow-y-auto bg-gray-100 dark:bg-gray-900">
        {/* STICKY SECTION - Contact Info + Tabs */}
        <div className="md:sticky top-0 z-40 bg-gray-100/98 dark:bg-gray-900/98 backdrop-blur-sm">
          {/* Contact Info Header & Actions - Desktop only */}
          <div className="hidden md:block px-4 pt-4 pb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <ContactInfoHeader contact={contact} className="border-0 p-0" />
              </div>
              <div className="flex gap-2 pt-1">
                <Button variant="outline" onClick={handleCancel} className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    const form = document.getElementById('contact-edit-form') as HTMLFormElement
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
            <ContactInfoHeader contact={contact} className="border-0 p-0" />
          </div>

          {/* Tabs Navigation */}
          <div className="px-4">
            <div id="contact-tabs-nav-container" />
          </div>
        </div>

        {/* SCROLLABLE CONTENT - Form with Tabs */}
        <div className="px-4 pb-4 pt-1">
          <ContactFormTabs
            contact={contact}
            onSubmit={handleSubmit}
            isLoading={mutating}
            hideActions
          />
        </div>
      </div>
    </>
  )
}
