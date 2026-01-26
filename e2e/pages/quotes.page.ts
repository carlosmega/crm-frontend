import { Page, Locator, expect } from '@playwright/test'

/**
 * Page Object for Quote management
 * Handles Quote lifecycle: Draft → Active → Won/Lost
 */
export class QuotesPage {
  readonly page: Page

  // Navigation
  readonly quotesNavLink: Locator
  readonly newQuoteLink: Locator

  // Quote Detail
  readonly quoteTitle: Locator
  readonly quoteNumber: Locator
  readonly statusBadge: Locator

  // Tabs
  readonly generalTab: Locator
  readonly linesTab: Locator
  readonly activitiesTab: Locator

  // Actions
  readonly editButton: Locator
  readonly activateButton: Locator
  readonly winQuoteButton: Locator
  readonly loseQuoteButton: Locator
  readonly cloneButton: Locator
  readonly deleteButton: Locator

  // Dialogs
  readonly activateDialog: Locator
  readonly winDialog: Locator
  readonly confirmButton: Locator

  constructor(page: Page) {
    this.page = page

    // Navigation
    this.quotesNavLink = page.getByRole('link', { name: 'Quotes' })
    this.newQuoteLink = page.getByRole('link', { name: /new quote/i })

    // Detail elements
    this.quoteTitle = page.getByRole('heading', { level: 1 })
    this.quoteNumber = page.locator('[data-field="quotenumber"]')
    this.statusBadge = page.locator('[data-status-badge]')

    // Tabs
    this.generalTab = page.getByRole('tab', { name: /general/i })
    this.linesTab = page.getByRole('tab', { name: /lines|products/i })
    this.activitiesTab = page.getByRole('tab', { name: /activities/i })

    // Actions
    this.editButton = page.getByRole('link', { name: /edit/i })
    this.activateButton = page.getByRole('button', { name: /activate/i })
    this.winQuoteButton = page.getByRole('button', { name: /win quote/i })
    this.loseQuoteButton = page.getByRole('button', { name: /lose quote/i })
    this.cloneButton = page.getByRole('button', { name: /clone/i })
    this.deleteButton = page.getByRole('button', { name: /delete/i })

    // Dialogs
    this.activateDialog = page.getByRole('dialog')
    this.winDialog = page.getByRole('dialog')
    this.confirmButton = page.getByRole('button', { name: /confirm|yes|activate/i })
  }

  /**
   * Navigate to quotes list
   */
  async goto() {
    await this.page.goto('/quotes')
    await this.page.waitForLoadState('domcontentloaded')
  }

  /**
   * Navigate to quote detail
   */
  async gotoDetail(quoteId: string) {
    await this.page.goto(`/quotes/${quoteId}`)
    await this.page.waitForLoadState('domcontentloaded')
  }

  /**
   * Get quote ID from current URL
   */
  async getQuoteIdFromUrl(): Promise<string> {
    const url = this.page.url()
    const match = url.match(/\/quotes\/([\w-]+)/)
    if (!match) {
      throw new Error(`Could not extract quote ID from URL: ${url}`)
    }
    return match[1]
  }

  /**
   * Verify we're on a quote detail page
   */
  async expectOnDetailPage() {
    await expect(this.page).toHaveURL(/\/quotes\/[\w-]+/)
  }

  /**
   * Activate a draft quote
   */
  async activateQuote() {
    await this.activateButton.click()
    // Wait for dialog and confirm
    await expect(this.activateDialog).toBeVisible({ timeout: 5000 })
    const confirmBtn = this.page.getByRole('button', { name: /activate quote/i })
    await confirmBtn.click()
    // Wait for dialog to close
    await expect(this.activateDialog).not.toBeVisible({ timeout: 10000 })
  }

  /**
   * Win a quote (creates order)
   */
  async winQuote() {
    await this.winQuoteButton.click()
    // Wait for dialog
    await expect(this.winDialog).toBeVisible({ timeout: 5000 })
    const confirmBtn = this.page.getByRole('button', { name: /win quote|create order/i })
    await confirmBtn.click()
    // Wait for navigation to order
    await this.page.waitForURL(/\/orders\/[\w-]+/, { timeout: 15000 })
  }
}
