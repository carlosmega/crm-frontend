"use client"

import type { Contact } from '@/core/contracts'
import { ContactStateCode } from '@/core/contracts'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Briefcase, Mail, Phone, Smartphone, Building2, User } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ContactInfoHeaderProps {
  contact: Contact
  accountName?: string
  className?: string
}

/**
 * ContactInfoHeader
 *
 * Header component similar to Dynamics 365 que muestra información clave del contacto:
 * - Nombre completo
 * - Tipo (Contacto)
 * - Estado (Active/Inactive)
 * - Cargo
 * - Empresa (si B2B)
 * - Email y teléfonos
 * - Propietario
 */
export function ContactInfoHeader({ contact, accountName, className }: ContactInfoHeaderProps) {
  // Determine state badge variant and label
  const getStateBadge = () => {
    const stateCode = Number(contact.statecode)

    switch (stateCode) {
      case ContactStateCode.Active:
        return { variant: 'default' as const, label: 'Active', color: 'bg-green-500' }
      case ContactStateCode.Inactive:
        return { variant: 'secondary' as const, label: 'Inactive', color: 'bg-gray-500' }
      default:
        return { variant: 'secondary' as const, label: 'Unknown', color: 'bg-gray-500' }
    }
  }

  const stateBadge = getStateBadge()

  // Get initials for avatar
  const getInitials = () => {
    const first = contact.firstname?.charAt(0) || ''
    const last = contact.lastname?.charAt(0) || ''
    return (first + last).toUpperCase() || 'C'
  }

  // Determine if B2B or B2C
  const isB2B = !!contact.parentcustomerid

  return (
    <div className={cn("border-b py-4", className)}>
      <div className="space-y-3">
        {/* Row 1: Avatar + Name + Type Badges */}
        <div className="flex items-center gap-3 flex-wrap">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="text-lg bg-primary/10 text-primary">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-foreground">
              {contact.fullname}
            </h1>
            <Badge variant="secondary" className="text-xs font-normal">
              Contacto
            </Badge>
            <Badge variant="outline" className="text-xs font-normal">
              Contact
            </Badge>
          </div>
        </div>

        {/* Row 2: Job Title, Company, State */}
        <div className="flex items-center gap-4 flex-wrap text-sm">
          {/* Job Title */}
          {contact.jobtitle && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Briefcase className="w-3.5 h-3.5" />
              <span className="font-medium">{contact.jobtitle}</span>
            </div>
          )}

          {/* Company (B2B) */}
          {isB2B && accountName && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Building2 className="w-3.5 h-3.5" />
              <span className="font-medium">{accountName}</span>
            </div>
          )}

          {/* B2C Badge */}
          {!isB2B && (
            <Badge variant="outline" className="text-xs">
              B2C
            </Badge>
          )}

          {/* State Badge */}
          <Badge
            variant={stateBadge.variant}
            className={cn("text-xs", stateBadge.color, "text-white")}
          >
            {stateBadge.label}
          </Badge>
        </div>

        {/* Row 3: Contact Info */}
        <div className="flex items-center gap-4 flex-wrap text-sm text-muted-foreground">
          {/* Email */}
          {contact.emailaddress1 && (
            <div className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              <a
                href={`mailto:${contact.emailaddress1}`}
                className="font-medium hover:text-primary transition-colors"
              >
                {contact.emailaddress1}
              </a>
            </div>
          )}

          {/* Phone */}
          {contact.telephone1 && (
            <div className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" />
              <a
                href={`tel:${contact.telephone1}`}
                className="font-medium hover:text-primary transition-colors"
              >
                {contact.telephone1}
              </a>
            </div>
          )}

          {/* Mobile */}
          {contact.mobilephone && (
            <div className="flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5" />
              <a
                href={`tel:${contact.mobilephone}`}
                className="font-medium hover:text-primary transition-colors"
              >
                {contact.mobilephone}
              </a>
            </div>
          )}
        </div>

        {/* Row 4: Owner */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="w-3.5 h-3.5" />
          <span className="font-medium">Propietario:</span>
          <div className="flex items-center gap-2">
            <Avatar className="h-5 w-5">
              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                {contact.ownerid?.substring(0, 2).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <span>{contact.ownerid || 'Unassigned'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
