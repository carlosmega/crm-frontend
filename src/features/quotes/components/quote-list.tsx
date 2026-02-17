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
import { useTranslation } from '@/shared/hooks/use-translation'

interface QuoteListProps {
  quotes: Quote[]
  emptyMessage?: string
}

type SortOption = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'

/**
 * Quote List Component (Optimizado)
 *
 * Lista de quotes con filtros y búsqueda
 * ✅ Memoización de computaciones pesadas
 * ✅ Callbacks memoizados
 */
export function QuoteList({ quotes, emptyMessage }: QuoteListProps) {
  const { t } = useTranslation('quotes')
  const [searchQuery, setSearchQuery] = useState('')
  const [stateFilter, setStateFilter] = useState<'all' | QuoteStateCode>('all')
  const [sortBy, setSortBy] = useState<SortOption>('date-desc')

  // Build filter/sort options inside component to use translations
  const stateFilterOptions = useMemo(() => [
    { value: 'all', label: t('list.allStates') },
    { value: QuoteStateCode.Draft.toString(), label: getQuoteStateLabel(QuoteStateCode.Draft) },
    { value: QuoteStateCode.Active.toString(), label: getQuoteStateLabel(QuoteStateCode.Active) },
    { value: QuoteStateCode.Won.toString(), label: getQuoteStateLabel(QuoteStateCode.Won) },
    { value: QuoteStateCode.Closed.toString(), label: getQuoteStateLabel(QuoteStateCode.Closed) },
  ], [t])

  const sortOptions = useMemo(() => [
    { value: 'date-desc', label: t('list.newestFirst') },
    { value: 'date-asc', label: t('list.oldestFirst') },
    { value: 'amount-desc', label: t('list.highestAmount') },
    { value: 'amount-asc', label: t('list.lowestAmount') },
  ], [t])

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
            placeholder={t('list.searchPlaceholder')}
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
            <SelectValue placeholder={t('list.filterByState')} />
          </SelectTrigger>
          <SelectContent>
            {stateFilterOptions.map((option) => (
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
            <SelectValue placeholder={t('list.sortBy')} />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
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
          {filteredQuotes.length} {filteredQuotes.length === 1 ? t('list.quote') : t('list.quotes')}
          {searchQuery && ` ${t('list.matching')} "${searchQuery}"`}
          {stateFilter !== 'all' &&
            ` ${t('list.inState', { state: getQuoteStateLabel(Number(stateFilter) as QuoteStateCode) })}`}
        </p>

        {(searchQuery || stateFilter !== 'all') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
          >
            {t('list.clearFilters')}
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
              ? t('list.noQuotesFound')
              : t('list.noQuotesYet')
          }
          description={
            emptyMessage ||
            (searchQuery || stateFilter !== 'all'
              ? t('list.noQuotesDescription')
              : t('list.firstQuoteDescription'))
          }
          action={
            quotes.length > 0 && (searchQuery || stateFilter !== 'all')
              ? undefined
              : { href: '/quotes/new', label: t('buttons.createQuote') }
          }
        />
      )}
    </div>
  )
}
