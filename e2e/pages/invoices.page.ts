import { Page, Locator, expect } from '@playwright/test'

/**
 * Page Object for Invoice management
 * Handles Invoice lifecycle: Active → Paid/Canceled
 */
export class InvoicesPage {
  readonly page: Page

  // Navigation
  readonly invoicesNavLink: Locator

  // Invoice Detail
  readonly invoiceTitle: Locator
  readonly invoiceNumber: Locator
  readonly statusBadge: Locator

  // Tabs
  readonly generalTab: Locator
  readonly linesTab: Locator
  readonly activitiesTab: Locator

  // Actions
  readonly markPaidButton: Locator
  readonly cancelButton: Locator
  readonly exportPdfButton: Locator

  // Dialogs
  readonly paidDialog: Locator
  readonly confirmButton: Locator

  constructor(page: Page) {
    this.page = page

    // Navigation
    this.invoicesNavLink = page.getByRole('link', { name: 'Invoices' })

    // Detail elements
    this.invoiceTitle = page.getByRole('heading', { level: 1 })
    this.invoiceNumber = page.locator('[data-field="invoicenumber"]')
    this.statusBadge = page.locator('[data-status-badge]')

    // Tabs
    this.generalTab = page.getByRole('tab', { name: /general/i })
    this.linesTab = page.getByRole('tab', { name: /lines|products/i })
    this.activitiesTab = page.getByRole('tab', { name: /activities/i })

    // Actions
    this.markPaidButton = page.getByRole('button', { name: /mark.*paid|paid/i })
    this.cancelButton = page.getByRole('button', { name: /cancel/i })
    this.exportPdfButton = page.getByRole('button', { name: /export pdf/i })

    // Dialogs
    this.paidDialog = page.getByRole('dialog')
    this.confirmButton = page.getByRole('button', { name: /confirm|yes|mark/i })
  }

  /**
   * Navigate to invoices list
   */
  async goto() {
    await this.page.goto('/invoices')
    await this.page.waitForLoadState('domcontentloaded')
  }

  /**
   * Navigate to invoice detail
   */
  async gotoDetail(invoiceId: string) {
    await this.page.goto(`/invoices/${invoiceId}`)
    await this.page.waitForLoadState('domcontentloaded')
  }

  /**
   * Get invoice ID from current URL
   */
  async getInvoiceIdFromUrl(): Promise<string> {
    const url = this.page.url()
    const match = url.match(/\/invoices\/([\w-]+)/)
    if (!match) {
      throw new Error(`Could not extract invoice ID from URL: ${url}`)
    }
    return match[1]
  }

  /**
   * Verify we're on an invoice detail page
   */
  async expectOnDetailPage() {
    await expect(this.page).toHaveURL(/\/invoices\/[\w-]+/)
  }

  /**
   * Mark invoice as paid
   */
  async markAsPaid() {
    await expect(this.markPaidButton).toBeVisible({ timeout: 5000 })
    await this.markPaidButton.click()

    // Wait for dialog and confirm
    await expect(this.paidDialog).toBeVisible({ timeout: 5000 })
    const confirmBtn = this.page.getByRole('button', { name: /confirm|yes|mark.*paid/i })
    await confirmBtn.click()

    // Wait for dialog to close
    await expect(this.paidDialog).not.toBeVisible({ timeout: 10000 })
  }

  /**
   * Verify invoice status
   */
  async expectStatus(status: 'Active' | 'Paid' | 'Canceled') {
    await expect(this.page.getByText(new RegExp(status, 'i'))).toBeVisible()
  }
}
