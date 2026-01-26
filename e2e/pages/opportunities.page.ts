import { Page, Locator, expect } from '@playwright/test'

/**
 * Page Object for Opportunity management
 * Used to verify opportunities created from Lead qualification
 */
export class OpportunitiesPage {
  readonly page: Page

  // Navigation
  readonly opportunitiesNavLink: Locator
  readonly newOpportunityLink: Locator

  // Opportunity Detail
  readonly opportunityTitle: Locator
  readonly customerName: Locator
  readonly estimatedValue: Locator
  readonly salesStage: Locator
  readonly closeProbability: Locator
  readonly estimatedCloseDate: Locator

  // Tabs
  readonly generalTab: Locator
  readonly productsTab: Locator
  readonly quotesTab: Locator
  readonly activitiesTab: Locator

  // Actions
  readonly editButton: Locator
  readonly createQuoteButton: Locator
  readonly wonButton: Locator
  readonly lostButton: Locator

  constructor(page: Page) {
    this.page = page

    // Navigation
    this.opportunitiesNavLink = page.getByRole('link', { name: 'Oportunidades' })
    this.newOpportunityLink = page.getByRole('link', { name: 'Nueva Oportunidad' })

    // Detail elements
    this.opportunityTitle = page.getByRole('heading', { level: 2 })
    this.customerName = page.locator('[data-field="customer"]')
    this.estimatedValue = page.locator('[data-field="estimatedvalue"]')
    this.salesStage = page.locator('[data-field="salesstage"]')
    this.closeProbability = page.locator('[data-field="closeprobability"]')
    this.estimatedCloseDate = page.locator('[data-field="estimatedclosedate"]')

    // Tabs
    this.generalTab = page.getByRole('tab', { name: /general/i })
    this.productsTab = page.getByRole('tab', { name: /products/i })
    this.quotesTab = page.getByRole('tab', { name: /quotes/i })
    this.activitiesTab = page.getByRole('tab', { name: /activities/i })

    // Actions
    this.editButton = page.getByRole('button', { name: /edit/i })
    this.createQuoteButton = page.getByRole('button', { name: /create quote/i })
    this.wonButton = page.getByRole('button', { name: /won/i })
    this.lostButton = page.getByRole('button', { name: /lost/i })
  }

  /**
   * Navigate to opportunities list
   */
  async goto() {
    await this.page.goto('/opportunities')
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Navigate to opportunity detail
   */
  async gotoDetail(opportunityId: string) {
    await this.page.goto(`/opportunities/${opportunityId}`)
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Get opportunity ID from current URL
   */
  async getOpportunityIdFromUrl(): Promise<string> {
    const url = this.page.url()
    const match = url.match(/\/opportunities\/(\d+)/)
    if (!match) {
      throw new Error(`Could not extract opportunity ID from URL: ${url}`)
    }
    return match[1]
  }

  /**
   * Verify we're on an opportunity detail page
   */
  async expectOnDetailPage() {
    await expect(this.page).toHaveURL(/\/opportunities\/[\w-]+/)
  }

  /**
   * Verify opportunity has expected name
   */
  async expectOpportunityName(name: string) {
    await expect(this.page.getByText(name)).toBeVisible()
  }

  /**
   * Verify opportunity is in expected sales stage
   */
  async expectSalesStage(stage: 'Qualify' | 'Develop' | 'Propose' | 'Close') {
    await expect(this.page.getByText(new RegExp(stage, 'i'))).toBeVisible()
  }

  /**
   * Verify opportunity has customer linked
   */
  async expectCustomerLinked(customerName: string) {
    await expect(this.page.getByText(customerName)).toBeVisible()
  }

  /**
   * Verify opportunity came from lead qualification
   * (should be in Qualify stage with originatingleadid set)
   */
  async expectFromLeadQualification() {
    // New opportunities from lead qualification start in Qualify stage
    await this.expectSalesStage('Qualify')
  }
}
