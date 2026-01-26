import { Page, Locator, expect } from '@playwright/test'

/**
 * Page Object for Order management
 * Handles Order lifecycle: Active → Submitted → Fulfilled
 */
export class OrdersPage {
  readonly page: Page

  // Navigation
  readonly ordersNavLink: Locator

  // Order Detail
  readonly orderTitle: Locator
  readonly orderNumber: Locator
  readonly statusBadge: Locator

  // Tabs
  readonly generalTab: Locator
  readonly linesTab: Locator
  readonly activitiesTab: Locator

  // Actions
  readonly fulfillButton: Locator
  readonly generateInvoiceButton: Locator
  readonly cancelButton: Locator
  readonly exportPdfButton: Locator

  // Dialogs
  readonly fulfillDialog: Locator
  readonly confirmButton: Locator

  constructor(page: Page) {
    this.page = page

    // Navigation
    this.ordersNavLink = page.getByRole('link', { name: 'Orders' })

    // Detail elements
    this.orderTitle = page.getByRole('heading', { level: 1 })
    this.orderNumber = page.locator('[data-field="ordernumber"]')
    this.statusBadge = page.locator('[data-status-badge]')

    // Tabs
    this.generalTab = page.getByRole('tab', { name: /general/i })
    this.linesTab = page.getByRole('tab', { name: /lines|products/i })
    this.activitiesTab = page.getByRole('tab', { name: /activities/i })

    // Actions
    this.fulfillButton = page.getByRole('link', { name: /fulfill order/i })
    this.generateInvoiceButton = page.getByRole('button', { name: /generate invoice/i })
    this.cancelButton = page.getByRole('button', { name: /cancel order/i })
    this.exportPdfButton = page.getByRole('button', { name: /export pdf/i })

    // Dialogs
    this.fulfillDialog = page.getByRole('dialog')
    this.confirmButton = page.getByRole('button', { name: /confirm|yes|fulfill/i })
  }

  /**
   * Navigate to orders list
   */
  async goto() {
    await this.page.goto('/orders')
    await this.page.waitForLoadState('domcontentloaded')
  }

  /**
   * Navigate to order detail
   */
  async gotoDetail(orderId: string) {
    await this.page.goto(`/orders/${orderId}`)
    await this.page.waitForLoadState('domcontentloaded')
  }

  /**
   * Get order ID from current URL
   */
  async getOrderIdFromUrl(): Promise<string> {
    const url = this.page.url()
    const match = url.match(/\/orders\/([\w-]+)/)
    if (!match) {
      throw new Error(`Could not extract order ID from URL: ${url}`)
    }
    return match[1]
  }

  /**
   * Verify we're on an order detail page
   */
  async expectOnDetailPage() {
    await expect(this.page).toHaveURL(/\/orders\/[\w-]+/)
  }

  /**
   * Navigate to fulfill order page
   */
  async goToFulfill() {
    await this.fulfillButton.click()
    await this.page.waitForURL(/\/orders\/[\w-]+\/fulfill/, { timeout: 10000 })
  }

  /**
   * Complete the fulfill order process
   */
  async fulfillOrder() {
    // Click fulfill button to go to fulfill page
    await this.fulfillButton.click()
    await this.page.waitForURL(/\/orders\/[\w-]+\/fulfill/, { timeout: 10000 })

    // Find and click the confirm fulfill button
    const confirmFulfillBtn = this.page.getByRole('button', { name: /fulfill order|confirm/i })
    await expect(confirmFulfillBtn).toBeVisible({ timeout: 5000 })
    await confirmFulfillBtn.click()

    // Wait for navigation back to order detail
    await this.page.waitForURL(/\/orders\/[\w-]+$/, { timeout: 15000 })
  }

  /**
   * Generate invoice from fulfilled order
   */
  async generateInvoice() {
    await expect(this.generateInvoiceButton).toBeVisible({ timeout: 5000 })
    await this.generateInvoiceButton.click()

    // Wait for navigation to invoice
    await this.page.waitForURL(/\/invoices\/[\w-]+/, { timeout: 15000 })
  }
}
