/**
 * Opportunity Feature Types
 *
 * Re-exports core contracts and defines UI-specific types
 */

// Core contracts (Single Source of Truth)
export type {
  Opportunity,
  CreateOpportunityDto,
  UpdateOpportunityDto,
  CloseOpportunityDto,
} from '@/core/contracts'

export {
  OpportunityStateCode,
  OpportunityStatusCode,
  SalesStageCode,
  SALES_STAGE_PROBABILITY,
  CustomerType,
  BudgetStatusCode,
  BudgetStatusLabels,
} from '@/core/contracts'
