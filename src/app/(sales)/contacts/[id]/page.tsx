"use client"

import { use, useEffect } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useRouter, useSearchParams } from 'next/navigation'
import { useContact } from '@/features/contacts/hooks/use-contacts'
import { useContactMutations } from '@/features/contacts/hooks/use-contact-mutations'
import { ContactInfoHeader } from '@/features/contacts/components/contact-info-header'
import { LogActivityButton } from '@/features/activities/components'
import { ContactStateCode } from '@/core/contracts'
import { DetailPageHeader } from '@/components/layout/detail-page-header'
import { MobileDetailHeader } from '@/components/layout/mobile-detail-header'
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
  MoreVertical,
  FileText,
} from 'lucide-react'

// Dynamic import for contact detail tabs
const ContactDetailTabs = dynamic(
  () => import('@/features/contacts/components/contact-detail-tabs').then(mod => ({ default: mod.ContactDetailTabs })),
  { ssr: false }
)

export default function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { contact, loading, refetch } = useContact(resolvedParams.id)
  const { deleteContact, deactivateContact, loading: mutating } = useContactMutations()

  // ✅ Refetch cuando se actualiza el contacto (query param ?updated=timestamp)
  useEffect(() => {
    const updatedParam = searchParams.get('updated')
    if (updatedParam) {
      // ✅ Invalidar caché de Next.js
      router.refresh()

      // Refetch para obtener datos actualizados
      refetch()

      // Limpiar query param de la URL (sin recargar página)
      const url = new URL(window.location.href)
      url.searchParams.delete('updated')
      window.history.replaceState({}, '', url.toString())
    }
  }, [searchParams, refetch, router])

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this contact?')) {
      try {
        await deleteContact(resolvedParams.id)
        router.push('/contacts')
      } catch (error) {
        console.error('Error deleting contact:', error)
      }
    }
  }

  const handleDeactivate = async () => {
    if (confirm('Are you sure you want to deactivate this contact?')) {
      try {
        await deactivateContact(resolvedParams.id)
        // ✅ Refetch para mostrar estado actualizado (sin reload)
        await refetch()
      } catch (error) {
        console.error('Error deactivating contact:', error)
      }
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
    )
  }

  if (!contact) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
          <p className="text-lg font-semibold text-muted-foreground">Contact not found</p>
          <Button asChild>
            <Link href="/contacts">Back to Contacts</Link>
          </Button>
        </div>
    )
  }

  // Mobile actions dropdown
  const mobileActions = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreVertical className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild>
          <Link href={`/contacts/${contact.contactid}/edit`} className="flex items-center cursor-pointer">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <FileText className="mr-2 h-4 w-4" />
          Log Activity
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {contact.statecode === ContactStateCode.Active && (
          <DropdownMenuItem onClick={handleDeactivate} disabled={mutating}>
            <XCircle className="mr-2 h-4 w-4" />
            Deactivate
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDelete} disabled={mutating} className="text-destructive focus:text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <>
      {/* Mobile Header */}
      <MobileDetailHeader
        backHref="/contacts"
        entityType="CONTACTS"
        title={contact.fullname}
        actions={mobileActions}
      />

      {/* Desktop Header */}
      <DetailPageHeader
        breadcrumbs={[
          { label: 'Sales', href: '/dashboard' },
          { label: 'Contacts', href: '/contacts' },
          { label: contact.fullname },
        ]}
      />

      {/* Content - Fondo gris igual que opportunities/leads */}
      <div className="flex flex-1 flex-col overflow-y-auto bg-gray-100">
        {/* STICKY SECTION - Contact Info Header + Actions + Tabs */}
        <div className="md:sticky md:top-0 z-40 bg-gray-100/98 backdrop-blur-sm">
          {/* Contact Info Header & Actions */}
          <div className="px-4 pt-4 pb-4">
            {/* Desktop Layout: Side by side */}
            <div className="hidden md:flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <ContactInfoHeader contact={contact} className="border-0 p-0" />
              </div>
              <div className="flex gap-2">
                <LogActivityButton
                  regardingId={contact.contactid}
                  regardingType="contact"
                  regardingName={contact.fullname}
                  showQuickActions
                />
                {contact.statecode === ContactStateCode.Active ? (
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
                    variant="outline"
                    disabled
                    className="border-gray-300 text-gray-700"
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Activate
                  </Button>
                )}
                <Button asChild variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                  <Link href={`/contacts/${contact.contactid}/edit`}>
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
              <ContactInfoHeader contact={contact} className="border-0 p-0" />
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="px-4">
            <div id="contact-tabs-nav-container" />
          </div>
        </div>

        {/* CONTENIDO SCROLLABLE - Tabs with contact details */}
        <div className="px-4 pb-4 pt-1">
          <ContactDetailTabs contact={contact} />
        </div>
      </div>
    </>
  )
}
