import { memo } from 'react'
import Link from 'next/link'
import type { Contact } from '@/core/contracts'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ContactStatusBadge } from './contact-status-badge'
import { Mail, Phone, Smartphone, Briefcase, Building2, Eye, Edit, Trash2 } from 'lucide-react'

interface ContactCardProps {
  contact: Contact
  accountName?: string
  onDelete?: (id: string) => void
}

/**
 * Memoized ContactCard component
 * Performance: Only re-renders if contact, accountName or onDelete change
 */
export const ContactCard = memo(function ContactCard({ contact, accountName, onDelete }: ContactCardProps) {
  // Get initials for avatar
  const getInitials = () => {
    const first = contact.firstname?.charAt(0) || ''
    const last = contact.lastname?.charAt(0) || ''
    return (first + last).toUpperCase() || 'C'
  }

  // Determine if B2B or B2C
  const isB2B = !!contact.parentcustomerid

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="text-sm bg-primary/10 text-primary">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <CardTitle className="text-lg">
                {contact.fullname}
              </CardTitle>
              <CardDescription className="flex items-center gap-2 flex-wrap">
                {contact.jobtitle && (
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-3 w-3" />
                    {contact.jobtitle}
                  </span>
                )}
                {contact.jobtitle && isB2B && accountName && <span>•</span>}
                {isB2B && accountName && (
                  <span className="flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    {accountName}
                  </span>
                )}
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-1">
            <ContactStatusBadge statecode={contact.statecode} />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {!isB2B && (
            <Badge variant="outline" className="text-xs">
              B2C
            </Badge>
          )}
        </div>

        <div className="space-y-2 text-sm">
          {contact.emailaddress1 && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4" />
              <a href={`mailto:${contact.emailaddress1}`} className="hover:underline">
                {contact.emailaddress1}
              </a>
            </div>
          )}

          {contact.telephone1 && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4" />
              <a href={`tel:${contact.telephone1}`} className="hover:underline">
                {contact.telephone1}
              </a>
            </div>
          )}

          {contact.mobilephone && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Smartphone className="h-4 w-4" />
              <a href={`tel:${contact.mobilephone}`} className="hover:underline">
                {contact.mobilephone}
              </a>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button asChild variant="outline" size="sm" className="flex-1">
          <Link href={`/contacts/${contact.contactid}`}>
            <Eye className="mr-2 h-4 w-4" />
            View
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="flex-1">
          <Link href={`/contacts/${contact.contactid}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Link>
        </Button>
        {onDelete && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(contact.contactid)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  )
})
