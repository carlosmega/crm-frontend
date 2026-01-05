'use client'

import { useQuotes } from '../hooks/use-quotes'
import { QuoteList } from './quote-list'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus, FileText } from 'lucide-react'

/**
 * Quotes Content
 *
 * Client Component que maneja la lista de quotes con React Query
 */
export function QuotesContent() {
  const { data: quotes, error } = useQuotes()

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Error loading quotes: {error.message}</p>
      </div>
    )
  }

  if (!quotes || quotes.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No quotes yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first quote to get started
          </p>
          <Button asChild>
            <Link href="/quotes/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Quote
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return <QuoteList quotes={quotes} />
}
