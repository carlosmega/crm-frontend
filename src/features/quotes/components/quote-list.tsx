'use client'

import { useState, useMemo, useCallback } from 'react'
import { QuoteCard } from './quote-card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Quote } from '../types'
import { QuoteStateCode } from '@/core/contracts/enums'
import {
  filterQuotesByState,
  filterQuotesByQuery,
  sortQuotesByDate,
  sortQuotesByAmount,
  getQuoteStateLabel,
} from '../utils/quote-helpers'
import { Search, SlidersHorizontal, FileText } from 'lucide-react'
import { EmptyState } from '@/shared/components/empty-state'

interface QuoteListProps {
  quotes: Quote[]
  emptyMessage?: string
}

type SortOption = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'

// ✅ OPTIMIZACIÓN: Constantes fuera del componente (no se recrean en cada render)
const STATE_FILTER_OPTIONS = [
  { value: 'all', label: 'All States' },
  { value: QuoteStateCode.Draft.toString(), label: getQuoteStateLabel(QuoteStateCode.Draft) },
  { value: QuoteStateCode.Active.toString(), label: getQuoteStateLabel(QuoteStateCode.Active) },
  { value: QuoteStateCode.Won.toString(), label: getQuoteStateLabel(QuoteStateCode.Won) },
  { value: QuoteStateCode.Closed.toString(), label: getQuoteStateLabel(QuoteStateCode.Closed) },
] as const

const SORT_OPTIONS = [
  { value: 'date-desc', label: 'Newest First' },
  { value: 'date-asc', label: 'Oldest First' },
  { value: 'amount-desc', label: 'Highest Amount' },
  { value: 'amount-asc', label: 'Lowest Amount' },
] as const

/**
 * Quote List Component (Optimizado)
 *
 * Lista de quotes con filtros y búsqueda
 * ✅ Memoización de computaciones pesadas
 * ✅ Callbacks memoizados
 * ✅ Constantes module-level
 */
export function QuoteList({ quotes, emptyMessage }: QuoteListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [stateFilter, setStateFilter] = useState<'all' | QuoteStateCode>('all')
  const [sortBy, setSortBy] = useState<SortOption>('date-desc')

  // ✅ OPTIMIZACIÓN: Memoizar filtrado y sorting (se ejecuta solo cuando cambian dependencies)
  const filteredQuotes = useMemo(() => {
    let result = quotes

    // Filter by state
    if (stateFilter !== 'all') {
      result = filterQuotesByState(result, [stateFilter])
    }

    // Filter by search query
    if (searchQuery.trim()) {
      result = filterQuotesByQuery(result, searchQuery)
    }

    // Sort
    switch (sortBy) {
      case 'date-desc':
        result = sortQuotesByDate(result, 'createdon', 'desc')
        break
      case 'date-asc':
        result = sortQuotesByDate(result, 'createdon', 'asc')
        break
      case 'amount-desc':
        result = sortQuotesByAmount(result, 'desc')
        break
      case 'amount-asc':
        result = sortQuotesByAmount(result, 'asc')
        break
    }

    return result
  }, [quotes, stateFilter, searchQuery, sortBy])

  // ✅ OPTIMIZACIÓN: Memoizar handler para evitar re-renders de children
  const handleClearFilters = useCallback(() => {
    setSearchQuery('')
    setStateFilter('all')
  }, [])

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search quotes by name or number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* State Filter */}
        <Select
          value={stateFilter.toString()}
          onValueChange={(value) =>
            setStateFilter(value as 'all' | QuoteStateCode)
          }
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by state" />
          </SelectTrigger>
          <SelectContent>
            {STATE_FILTER_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select
          value={sortBy}
          onValueChange={(value) => setSortBy(value as SortOption)}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredQuotes.length} {filteredQuotes.length === 1 ? 'quote' : 'quotes'}
          {searchQuery && ` matching "${searchQuery}"`}
          {stateFilter !== 'all' &&
            ` in ${getQuoteStateLabel(Number(stateFilter) as QuoteStateCode)} state`}
        </p>

        {(searchQuery || stateFilter !== 'all') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Quote Cards Grid */}
      {filteredQuotes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredQuotes.map((quote) => (
            <QuoteCard key={quote.quoteid} quote={quote} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FileText}
          title={
            searchQuery || stateFilter !== 'all'
              ? 'No quotes found'
              : 'No quotes yet'
          }
          description={
            emptyMessage ||
            (searchQuery || stateFilter !== 'all'
              ? 'Try adjusting your search or filters to find what you need'
              : 'Create your first quote to start building proposals for your opportunities')
          }
          action={
            quotes.length > 0 && (searchQuery || stateFilter !== 'all')
              ? undefined
              : { href: '/quotes/new', label: 'Create Quote' }
          }
        />
      )}
    </div>
  )
}
