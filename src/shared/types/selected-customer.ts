/**
 * Selected Customer Type
 *
 * Represents a customer (Account or Contact) selected from CustomerSelectorDialog
 * Used across forms that need customer selection (Quote, Opportunity, Order, Invoice)
 */
export interface SelectedCustomer {
  /** Customer ID (accountid or contactid) */
  id: string

  /** Customer type */
  type: 'account' | 'contact'

  /** Customer name */
  name: string

  /** Email address (optional) */
  email?: string

  /** Phone number (optional) */
  phone?: string

  /** City/Location (optional) */
  city?: string

  /** Number of open opportunities for this customer (optional) */
  openOpportunities?: number
}
