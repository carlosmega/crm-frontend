import { test, expect } from '@playwright/test'

test('debug: create lead and capture network errors', async ({ page }) => {
  // Capture console errors
  const consoleErrors: string[] = []
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text())
    }
  })

  // Capture failed network requests
  const failedRequests: string[] = []
  page.on('response', response => {
    if (response.status() >= 400) {
      failedRequests.push(`${response.status()} ${response.url()}`)
    }
  })

  // Capture ALL API requests/responses with bodies
  const apiCalls: string[] = []
  page.on('request', request => {
    if (request.url().includes(':8000')) {
      const body = request.postData()
      apiCalls.push(`>> ${request.method()} ${request.url()}`)
      if (body) apiCalls.push(`   BODY: ${body.substring(0, 500)}`)
    }
  })
  page.on('response', async response => {
    if (response.url().includes(':8000')) {
      let body = ''
      try { body = (await response.text()).substring(0, 500) } catch {}
      apiCalls.push(`<< ${response.status()} ${response.url()}`)
      if (body) apiCalls.push(`   RESP: ${body}`)
    }
  })

  // Navigate to create lead
  await page.goto('/leads/new')
  await page.waitForLoadState('domcontentloaded')

  // Fill form
  const firstName = page.getByTestId('lead-firstname')
  await expect(firstName).toBeVisible({ timeout: 10000 })
  await firstName.fill('Debug-Test')
  await page.getByTestId('lead-lastname').fill('Lead-Create')
  await page.getByTestId('lead-company').fill('Debug Company')
  await page.getByTestId('lead-email').fill('debug@test.com')

  console.log('\n--- Before submit ---')
  console.log('API calls so far:', apiCalls)

  // Click Create Lead
  await page.getByTestId('create-lead-button').click()

  // Wait a bit for the API call to complete
  await page.waitForTimeout(5000)

  console.log('\n--- After submit ---')
  console.log('API calls:', apiCalls)
  console.log('Failed requests:', failedRequests)
  console.log('Console errors:', consoleErrors)

  // Check if page navigated
  const currentUrl = page.url()
  console.log('Current URL:', currentUrl)

  // Check for any error toasts or alerts
  const errorAlert = page.locator('[role="alert"]')
  if (await errorAlert.count() > 0) {
    const alertText = await errorAlert.first().textContent()
    console.log('Alert text:', alertText)
  }
})
