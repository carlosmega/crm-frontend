import Link from 'next/link'
import { Building2, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface ContactAccountLinkProps {
  accountId: string
  accountName?: string
}

/**
 * ContactAccountLink
 *
 * Muestra un link al Account padre (solo para contactos B2B)
 * Si el contacto es B2C (parentcustomerid = null), este componente no debería renderizarse
 */
export function ContactAccountLink({ accountId, accountName }: ContactAccountLinkProps) {
  return (
    <Link
      href={`/accounts/${accountId}`}
      className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
    >
      <Building2 className="h-4 w-4" />
      <span className="font-medium">{accountName || accountId}</span>
      <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
      <Badge variant="outline" className="text-xs">
        B2B
      </Badge>
    </Link>
  )
}
