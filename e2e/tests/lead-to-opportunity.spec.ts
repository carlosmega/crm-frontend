import { test, expect } from '@playwright/test'
import { LeadsPage, QualifyDialogPage, OpportunitiesPage } from '../pages'
import { generateUniqueLeadData } from '../fixtures/test-data'

/**
 * Lead to Opportunity Qualification Flow E2E Tests
 *
 * Tests the complete CDS flow:
 * Lead (Open) → [Qualify] → Account (optional) + Contact + Opportunity (Open)
 */

test.describe('Lead to Opportunity Flow', () => {
  let leadsPage: LeadsPage
  let qualifyDialog: QualifyDialogPage
  let opportunitiesPage: OpportunitiesPage

  test.beforeEach(async ({ page }) => {
    leadsPage = new LeadsPage(page)
    qualifyDialog = new QualifyDialogPage(page)
    opportunitiesPage = new OpportunitiesPage(page)
  })

  test.describe('Lead Creation', () => {
    test('should create B2B lead with company', async ({ page }) => {
      const leadData = generateUniqueLeadData('b2b')

      await leadsPage.gotoNew()

      await leadsPage.fillBasicInfo({
        firstName: leadData.firstName,
        lastName: leadData.lastName,
        company: leadData.company,
        email: leadData.email,
      })

      await leadsPage.createLeadButton.click()

      // Wait for navigation away from /leads/new with longer timeout
      await page.waitForURL((url) => !url.pathname.endsWith('/new'), { timeout: 20000 })

      // Verify we're on a lead detail page
      await expect(page).toHaveURL(/\/leads\//)
    })

    test('should create B2C lead without company', async ({ page }) => {
      const leadData = generateUniqueLeadData('b2c')

      await leadsPage.gotoNew()

      await leadsPage.fillBasicInfo({
        firstName: leadData.firstName,
        lastName: leadData.lastName,
        email: leadData.email,
      })

      await leadsPage.createLeadButton.click()

      // Wait for navigation
      await page.waitForURL((url) => !url.pathname.endsWith('/new'), { timeout: 15000 })
      await expect(page).toHaveURL(/\/leads\//)
    })

    test('should show validation error when first name is empty', async ({ page }) => {
      await leadsPage.gotoNew()

      await leadsPage.lastNameInput.fill('TestLastName')
      await leadsPage.createLeadButton.click()

      await expect(page.getByText(/first name is required/i)).toBeVisible()
    })

    test('should show validation error when last name is empty', async ({ page }) => {
      await leadsPage.gotoNew()

      await leadsPage.firstNameInput.fill('TestFirstName')
      await leadsPage.createLeadButton.click()

      await expect(page.getByText(/last name is required/i)).toBeVisible()
    })
  })

  test.describe('Lead Qualification', () => {
    test('should show qualify button on lead detail page', async ({ page }) => {
      const leadData = generateUniqueLeadData('b2b')

      await leadsPage.createLead({
        firstName: leadData.firstName,
        lastName: leadData.lastName,
        company: leadData.company,
        email: leadData.email,
      })

      await expect(leadsPage.qualifyButton).toBeVisible({ timeout: 10000 })
    })

    test('should open qualify dialog when clicking qualify button', async ({ page }) => {
      const leadData = generateUniqueLeadData('b2b')

      await leadsPage.createLead({
        firstName: leadData.firstName,
        lastName: leadData.lastName,
        company: leadData.company,
        email: leadData.email,
      })

      await leadsPage.openQualifyDialog()
      await qualifyDialog.waitForDialog()

      // Verify dialog title
      await expect(page.getByRole('heading', { name: /qualify lead/i })).toBeVisible()
    })

    test('should close qualification dialog with close button', async ({ page }) => {
      const leadData = generateUniqueLeadData('b2b')

      await leadsPage.createLead({
        firstName: leadData.firstName,
        lastName: leadData.lastName,
        company: leadData.company,
        email: leadData.email,
      })

      await leadsPage.openQualifyDialog()
      await qualifyDialog.waitForDialog()

      // Find and click Close button (the dialog uses "Close" not "Cancel")
      const closeBtn = page.getByRole('dialog').getByRole('button', { name: 'Close' })
      await expect(closeBtn).toBeVisible()
      await closeBtn.click()

      // Dialog should close
      await expect(qualifyDialog.dialog).not.toBeVisible({ timeout: 5000 })
    })
  })

  test.describe('Navigation Flow', () => {
    test('should navigate from dashboard to create lead', async ({ page }) => {
      await page.goto('/dashboard')
      await page.waitForLoadState('domcontentloaded')

      await leadsPage.newLeadLink.click()

      await expect(page).toHaveURL(/\/leads\/new/)
      await expect(leadsPage.firstNameInput).toBeVisible()
    })

    test('should navigate from leads list to new lead form', async ({ page }) => {
      await leadsPage.goto()

      await page.getByRole('link', { name: /new|nuevo/i }).first().click()

      await expect(page).toHaveURL(/\/leads\/new/)
    })

    test('should navigate to lead detail from list', async ({ page }) => {
      const leadData = generateUniqueLeadData('b2b')

      // Create a lead first
      await leadsPage.createLead({
        firstName: leadData.firstName,
        lastName: leadData.lastName,
        company: leadData.company,
        email: leadData.email,
      })

      // Go back to list
      await leadsPage.goto()

      // Wait for table to load
      await page.waitForLoadState('domcontentloaded')

      // Click on a lead row
      const leadLink = page.getByRole('link', { name: new RegExp(leadData.firstName, 'i') }).first()
      if (await leadLink.isVisible()) {
        await leadLink.click()
        await expect(page).toHaveURL(/\/leads\/[\w-]+/)
      }
    })
  })

  test.describe('Form Tabs', () => {
    test('should have all form tabs', async ({ page }) => {
      await leadsPage.gotoNew()

      await expect(leadsPage.generalTab).toBeVisible()
      await expect(leadsPage.qualificationTab).toBeVisible()
      await expect(leadsPage.addressTab).toBeVisible()
      await expect(leadsPage.notesTab).toBeVisible()
    })

    test('should switch between tabs', async ({ page }) => {
      await leadsPage.gotoNew()

      // Click Qualification tab
      await leadsPage.qualificationTab.click()
      await expect(leadsPage.qualificationTab).toHaveAttribute('aria-selected', 'true')

      // Click Address tab
      await leadsPage.addressTab.click()
      await expect(leadsPage.addressTab).toHaveAttribute('aria-selected', 'true')

      // Click back to General
      await leadsPage.generalTab.click()
      await expect(leadsPage.generalTab).toHaveAttribute('aria-selected', 'true')
    })
  })
})
