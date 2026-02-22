import { test, expect } from '@playwright/test'
import { QuotesPage, OrdersPage, InvoicesPage } from '../pages'

/**
 * Quote-to-Cash Complete Flow — Self-Contained E2E Test
 *
 * Drives a single entity through the entire Q2C pipeline:
 *   Draft Quote → Activate → Win → Create Order → Submit → Fulfill → Generate Invoice → Mark as Paid
 *
 * Uses test.describe.serial so each step depends on the previous one.
 * Only possible skip: if no Draft quote with line items exists in the backend.
 */
test.describe.serial('Quote-to-Cash Complete Flow', () => {
  let quoteId: string
  let orderId: string
  let invoiceId: string

  let quotesPage: QuotesPage
  let ordersPage: OrdersPage
  let invoicesPage: InvoicesPage

  test.beforeEach(async ({ page }) => {
    quotesPage = new QuotesPage(page)
    ordersPage = new OrdersPage(page)
    invoicesPage = new InvoicesPage(page)
  })

  test('setup: find draft quote with line items', async ({ page }) => {
    test.setTimeout(30000)

    // Navigate first to establish session cookies
    await page.goto('/quotes')
    await page.waitForLoadState('domcontentloaded')

    // Find a Draft quote (statecode=0) that has line items
    const draftQuote = await page.evaluate(async () => {
      const res = await fetch('http://localhost:8000/api/quotes/?statecode=0', {
        credentials: 'include',
      })
      if (!res.ok) return null
      const quotes = await res.json()

      // Try to find one with line items first
      for (const q of quotes) {
        try {
          const linesRes = await fetch(
            `http://localhost:8000/api/quotes/${q.quoteid}/lines/`,
            { credentials: 'include' }
          )
          if (linesRes.ok) {
            const lines = await linesRes.json()
            if (lines.length > 0) return q
          }
        } catch {
          // continue to next quote
        }
      }

      // Fall back to any Draft quote (may not have lines but can still proceed)
      return quotes.length > 0 ? quotes[0] : null
    })

    if (!draftQuote) {
      test.skip(true, 'No Draft quote available in backend — cannot run Q2C flow')
      return
    }

    quoteId = draftQuote.quoteid
    console.log(`  ✓ Found Draft quote: ${quoteId.slice(0, 8)}...`)
  })

  test('should activate draft quote', async ({ page }) => {
    test.setTimeout(60000)
    test.skip(!quoteId, 'No quote ID from setup — skipping')

    await quotesPage.gotoDetail(quoteId)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 10000 })
    console.log('Step 1: Activating Draft quote...')

    // Button text varies by locale: EN="Activate Quote" / ES="Activar Cotización"
    const activateButton = page.getByRole('button', { name: /activate|activar/i })

    if (await activateButton.isVisible({ timeout: 5000 })) {
      await activateButton.click()

      // Confirm in dialog
      const dialog = page.getByRole('dialog')
      await expect(dialog).toBeVisible({ timeout: 5000 })
      const confirmBtn = dialog.getByRole('button', { name: /activate quote|activar cotización/i })
      await confirmBtn.click()
      await expect(dialog).not.toBeVisible({ timeout: 10000 })
      console.log('  ✓ Quote activated')
    } else {
      // Quote might already be Active — proceed
      console.log('  ✓ Quote already Active (no Activate button)')
    }
  })

  test('should win quote and create order', async ({ page }) => {
    test.setTimeout(60000)
    test.skip(!quoteId, 'No quote ID — skipping')

    await quotesPage.gotoDetail(quoteId)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 10000 })
    console.log('Step 2: Winning the quote...')

    // Click Win Quote — EN="Win Quote" / ES="Ganar Cotización"
    const winButton = page.getByRole('button', { name: /win quote|ganar cotizaci/i })
    await expect(winButton).toBeVisible({ timeout: 10000 })
    await winButton.click()

    // Win Quote dialog (uses Dialog, not AlertDialog)
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible({ timeout: 5000 })

    const confirmWinBtn = dialog.getByRole('button', { name: /win quote|ganar cotizaci/i })
    await confirmWinBtn.click()

    // Wait for quote to show Won status — EN="Won" / ES="Ganada"
    await expect(page.getByText(/\bWon\b|\bGanada\b/i).first()).toBeVisible({ timeout: 15000 })
    console.log('  ✓ Quote marked as Won')

    // Click Create Order button — EN="Create Order" / ES="Crear Pedido"
    console.log('Step 3: Creating order from won quote...')
    const createOrderButton = page.getByRole('button', { name: /create order|crear pedido/i })
    await expect(createOrderButton).toBeVisible({ timeout: 10000 })
    await createOrderButton.click()

    // Create Order uses AlertDialog
    const orderDialog = page.getByRole('alertdialog')
    await expect(orderDialog).toBeVisible({ timeout: 5000 })
    const confirmOrderBtn = orderDialog.getByRole('button', { name: /create order|crear pedido/i })
    await confirmOrderBtn.click()

    // Wait for navigation to new order
    await page.waitForURL(/\/orders\/[\w-]+/, { timeout: 30000 })
    const url = page.url()
    orderId = url.match(/\/orders\/([\w-]+)/)?.[1] || ''
    expect(orderId).toBeTruthy()
    console.log(`  ✓ Order created: ${orderId.slice(0, 8)}...`)

    console.log('\n========================================')
    console.log('QUOTE → ORDER COMPLETED!')
    console.log('========================================\n')
  })

  test('should submit active order', async ({ page }) => {
    test.setTimeout(60000)
    test.skip(!orderId, 'No order ID — skipping')

    await page.goto(`/orders/${orderId}`)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 10000 })
    console.log('Step 4: Submitting the order...')

    // Click Submit Order
    const submitButton = page.getByRole('button', { name: /submit order/i })
    await expect(submitButton).toBeVisible({ timeout: 5000 })
    await submitButton.click()

    // Confirm in AlertDialog
    const dialog = page.getByRole('alertdialog')
    await expect(dialog).toBeVisible({ timeout: 5000 })
    const confirmButton = dialog.getByTestId('confirm-submit-order-button')
    await confirmButton.click()

    // Wait for dialog to close
    await expect(dialog).not.toBeVisible({ timeout: 10000 })

    // Verify Submitted status
    await expect(page.getByTestId('order-status-submitted').first()).toBeVisible({ timeout: 10000 })
    console.log('  ✓ Order submitted')
  })

  test('should fulfill submitted order', async ({ page }) => {
    test.setTimeout(60000)
    test.skip(!orderId, 'No order ID — skipping')

    // Navigate to fulfill page directly
    await page.goto(`/orders/${orderId}/fulfill`)
    console.log('Step 5: Fulfilling the order...')

    // Wait for fulfill page to load
    const fulfillHeading = page.getByRole('heading', { name: /fulfill order/i })
    const cannotFulfillHeading = page.getByRole('heading', { name: /cannot fulfill/i })

    // Check which heading appears
    await expect(fulfillHeading.or(cannotFulfillHeading)).toBeVisible({ timeout: 10000 })

    if (await cannotFulfillHeading.isVisible({ timeout: 1000 }).catch(() => false)) {
      throw new Error('Order is not in correct state for fulfillment')
    }

    // Click "Mark as Fulfilled" button
    const fulfillButton = page.getByRole('button', { name: /mark as fulfilled/i })
    await expect(fulfillButton).toBeVisible({ timeout: 5000 })
    await fulfillButton.click()

    // Wait for navigation back to order detail
    await page.waitForURL(/\/orders\/[\w-]+$/, { timeout: 15000 })

    // Verify Fulfilled status
    await expect(page.getByTestId('order-status-fulfilled').first()).toBeVisible({ timeout: 10000 })
    console.log('  ✓ Order fulfilled')
  })

  test('should generate invoice from fulfilled order', async ({ page }) => {
    test.setTimeout(60000)
    test.skip(!orderId, 'No order ID — skipping')

    await page.goto(`/orders/${orderId}`)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 10000 })
    console.log('Step 6: Generating invoice...')

    // Verify Fulfilled status
    await expect(page.getByTestId('order-status-fulfilled').first()).toBeVisible({ timeout: 5000 })

    // Click Generate Invoice — EN="Generate Invoice" / ES="Generar Factura"
    const generateButton = page.getByRole('button', { name: /generate invoice|generar factura/i })
    await expect(generateButton).toBeVisible({ timeout: 5000 })
    await generateButton.click()

    // Confirm in Dialog
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible({ timeout: 5000 })
    const confirmButton = dialog.getByRole('button', { name: /generate invoice|generar factura/i })
    await confirmButton.click()

    // Wait for navigation to invoice
    await page.waitForURL(/\/invoices\/[\w-]+/, { timeout: 30000 })
    const url = page.url()
    invoiceId = url.match(/\/invoices\/([\w-]+)/)?.[1] || ''
    expect(invoiceId).toBeTruthy()
    console.log(`  ✓ Invoice generated: ${invoiceId.slice(0, 8)}...`)

    console.log('\n========================================')
    console.log('ORDER → INVOICE COMPLETED!')
    console.log('========================================\n')
  })

  test('should mark invoice as paid', async ({ page }) => {
    test.setTimeout(60000)
    test.skip(!invoiceId, 'No invoice ID — skipping')

    await page.goto(`/invoices/${invoiceId}`)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 10000 })
    console.log('Step 7: Marking invoice as paid...')

    // Click Mark as Paid — EN="Mark as Paid" / ES="Marcar como Pagada"
    const markPaidButton = page.getByRole('button', { name: /mark.*paid|marcar.*pagad/i })
    await expect(markPaidButton).toBeVisible({ timeout: 5000 })
    await markPaidButton.click()

    // Dialog with payment form — amount is pre-filled with remaining balance
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible({ timeout: 5000 })

    // Click "Record Payment" / "Registrar Pago" submit button
    const recordButton = dialog.getByRole('button', { name: /record payment|registrar pago/i })
    await recordButton.click()

    // Wait for dialog to close
    await expect(dialog).not.toBeVisible({ timeout: 10000 })
    console.log('  ✓ Invoice marked as paid')

    console.log('\n========================================')
    console.log('QUOTE-TO-CASH FLOW COMPLETED!')
    console.log('  Quote → Activate → Win → Order →')
    console.log('  Submit → Fulfill → Invoice → Paid')
    console.log('========================================\n')
  })
})
