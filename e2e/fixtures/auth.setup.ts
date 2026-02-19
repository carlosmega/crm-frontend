/**
 * Authentication setup for E2E tests.
 *
 * The login form performs dual authentication:
 * 1. fetch() to Django /api/auth/login (sets Django sessionid cookie on :8000)
 * 2. NextAuth signIn() (sets NextAuth JWT cookie on :3000)
 *
 * Both happen automatically when the user submits the login form.
 * We save the full browser state (all cookies for all origins) so tests
 * have both Django + NextAuth sessions available.
 */
import { test as setup, expect } from '@playwright/test'

const authFile = 'e2e/.auth/user.json'

setup('authenticate', async ({ page }) => {
  // Go to login page
  await page.goto('/login')
  await page.waitForLoadState('domcontentloaded')

  // Fill credentials (admin user from dummy data)
  await page.getByLabel('Email').fill('admin@crm.com')
  await page.locator('#password').fill('admin123')

  // Submit login form — this triggers both Django auth + NextAuth auth
  await page.getByRole('button', { name: /Iniciar Sesión/i }).click()

  // Wait for redirect to dashboard (login success)
  await page.waitForURL('**/dashboard**', { timeout: 30000 })
  await expect(page).toHaveURL(/dashboard/)

  // Verify we can reach the Django API (session cookie is valid)
  const apiCheck = await page.evaluate(async () => {
    const res = await fetch('http://localhost:8000/api/auth/me', {
      credentials: 'include',
    })
    return { status: res.status, ok: res.ok }
  })
  console.log(`  Django API check: ${apiCheck.status} (ok: ${apiCheck.ok})`)

  // Save authenticated state (cookies for both :3000 and :8000)
  await page.context().storageState({ path: authFile })
})
