/**
 * CDS Enums - Central Export Point
 *
 * Single Source of Truth para todas las enumeraciones de CDS
 */

// Customer Type (polimórfico)
export { CustomerType } from './customer-type';

// Lead Enums
export { LeadStateCode } from './lead-state';
export { LeadStatusCode } from './lead-status';
export { LeadSourceCode, LeadSourceLabels } from './lead-source';
export { LeadQualityCode } from './lead-quality';
export { BudgetStatusCode, BudgetStatusLabels } from './budget-status';
export { PurchaseTimeframeCode, PurchaseTimeframeLabels, getPurchaseTimeframeLabel } from './purchase-timeframe-code';

// Opportunity Enums
export { OpportunityStateCode } from './opportunity-state';
export { OpportunityStatusCode } from './opportunity-status';
export { SalesStageCode, SALES_STAGE_PROBABILITY } from './sales-stage';

// Quote Enums
export { QuoteStateCode } from './quote-state';
export { QuoteStatusCode } from './quote-status';

// Order Enums
export { OrderStateCode } from './order-state';
export { OrderStatusCode, getOrderStatusLabel, getDefaultStatusCode, getOrderStatusColor } from './order-status-code';
export { PaymentTermsCode, getPaymentTermsLabel, getPaymentTermsDays } from './payment-terms-code';
export { PaymentMethodCode, getPaymentMethodLabel, getPaymentMethodDescription } from './payment-method-code';
export { FreightTermsCode, getFreightTermsLabel, getFreightPaidBy } from './freight-terms-code';
export { ShippingMethodCode, getShippingMethodLabel, getShippingMethodDays, requiresTracking } from './shipping-method-code';
export { PriorityCode, getPriorityLabel, getPriorityColor, requiresAlert } from './priority-code';

// Invoice Enums
export { InvoiceStateCode, getInvoiceStateLabel, getInvoiceStateColor } from './invoice-state';

// Account Enums
export { AccountStateCode } from './account-state';
export { AccountCategoryCode } from './account-category';
export { IndustryCode } from './industry-code';

// Contact Enums
export { ContactStateCode } from './contact-state';

// Activity Enums
export { ActivityStateCode, getActivityStateLabel, getActivityStateColor } from './activity-state';
export { ActivityTypeCode, getActivityTypeLabel, getActivityTypeIcon, getActivityTypeColor } from './activity-type';
