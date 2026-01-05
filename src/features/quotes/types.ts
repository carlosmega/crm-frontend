/**
 * Quotes Feature Types
 * Re-exports types from core/contracts (Single Source of Truth)
 */

export type {
  Quote,
  CreateQuoteDto,
  UpdateQuoteDto,
  ActivateQuoteDto,
  CloseQuoteDto,
} from '@/core/contracts/entities/quote'

export type {
  QuoteDetail,
  CreateQuoteDetailDto,
  UpdateQuoteDetailDto,
} from '@/core/contracts/entities/quote-detail'

export type {
  QuoteStateCode,
  QuoteStatusCode,
} from '@/core/contracts/enums'
