import { Page, Locator, expect } from '@playwright/test'

/**
 * Page Object for Lead management
 * Covers: List, Create, View, Edit, Qualify
 */
export class LeadsPage {
  readonly page: Page

  // Navigation
  readonly newLeadLink: Locator
  readonly leadsNavLink: Locator

  // Lead Form - Basic Info (General tab)
  readonly firstNameInput: Locator
  readonly lastNameInput: Locator
  readonly companyInput: Locator
  readonly jobTitleInput: Locator
  readonly emailInput: Locator
  readonly phoneInput: Locator
  readonly mobileInput: Locator
  readonly websiteInput: Locator

  // Lead Form - Qualification tab
  readonly estimatedValueInput: Locator
  readonly leadSourceSelect: Locator
  readonly leadQualitySelect: Locator

  // Form Actions
  readonly createLeadButton: Locator
  readonly updateLeadButton: Locator
  readonly saveButton: Locator
  readonly cancelButton: Locator

  // Lead Detail Actions
  readonly qualifyButton: Locator
  readonly editButton: Locator
  readonly deleteButton: Locator

  // Tabs
  readonly generalTab: Locator
  readonly qualificationTab: Locator
  readonly addressTab: Locator
  readonly notesTab: Locator

  constructor(page: Page) {
    this.page = page

    // Navigation
    this.newLeadLink = page.getByRole('link', { name: 'Nuevo Lead' })
    this.leadsNavLink = page.getByRole('link', { name: 'Leads' })

    // Lead Form - Basic Info (using exact label text)
    this.firstNameInput = page.getByLabel(/First Name/i)
    this.lastNameInput = page.getByLabel(/Last Name/i)
    this.companyInput = page.getByLabel(/^Company$/i)
    this.jobTitleInput = page.getByLabel(/Job Title/i)
    this.emailInput = page.getByLabel(/^Email$/i)
    this.phoneInput = page.getByLabel(/^Phone$/i)
    this.mobileInput = page.getByLabel(/^Mobile$/i)
    this.websiteInput = page.getByLabel(/^Website$/i)

    // Qualification fields
    this.estimatedValueInput = page.getByLabel(/Estimated Value/i)
    this.leadSourceSelect = page.getByLabel(/Lead Source/i)
    this.leadQualitySelect = page.getByLabel(/Lead Quality/i)

    // Actions
    this.createLeadButton = page.getByRole('button', { name: /create lead/i })
    this.updateLeadButton = page.getByRole('button', { name: /update lead/i })
    this.saveButton = page.getByRole('button', { name: /save/i })
    this.cancelButton = page.getByRole('button', { name: /cancel/i })
    this.qualifyButton = page.getByRole('button', { name: 'Qualify Lead' })
    this.editButton = page.getByRole('link', { name: /edit/i })
    this.deleteButton = page.getByRole('button', { name: /delete/i })

    // Tabs
    this.generalTab = page.getByRole('tab', { name: /general/i })
    this.qualificationTab = page.getByRole('tab', { name: /qualification/i })
    this.addressTab = page.getByRole('tab', { name: /address/i })
    this.notesTab = page.getByRole('tab', { name: /notes/i })
  }

  /**
   * Navigate to leads list
   */
  async goto() {
    await this.page.goto('/leads')
    await this.page.waitForLoadState('domcontentloaded')
  }

  /**
   * Navigate to new lead form
   */
  async gotoNew() {
    await this.page.goto('/leads/new')
    await this.page.waitForLoadState('domcontentloaded')
    // Wait for form to be ready
    await expect(this.firstNameInput).toBeVisible({ timeout: 10000 })
  }

  /**
   * Navigate to lead detail page
   */
  async gotoDetail(leadId: string) {
    await this.page.goto(`/leads/${leadId}`)
    await this.page.waitForLoadState('domcontentloaded')
  }

  /**
   * Navigate to lead edit page
   */
  async gotoEdit(leadId: string) {
    await this.page.goto(`/leads/${leadId}/edit`)
    await this.page.waitForLoadState('domcontentloaded')
  }

  /**
   * Fill basic lead information (General tab)
   */
  async fillBasicInfo(data: {
    firstName: string
    lastName: string
    company?: string
    jobTitle?: string
    email?: string
    phone?: string
  }) {
    // Ensure we're on General tab
    if (await this.generalTab.isVisible()) {
      await this.generalTab.click()
      await this.page.waitForTimeout(200)
    }

    await this.firstNameInput.fill(data.firstName)
    await this.lastNameInput.fill(data.lastName)

    if (data.company) {
      await this.companyInput.fill(data.company)
    }
    if (data.jobTitle) {
      await this.jobTitleInput.fill(data.jobTitle)
    }
    if (data.email) {
      await this.emailInput.fill(data.email)
    }
    if (data.phone) {
      await this.phoneInput.fill(data.phone)
    }
  }

  /**
   * Create a new lead with basic data
   */
  async createLead(data: {
    firstName: string
    lastName: string
    company?: string
    jobTitle?: string
    email?: string
    phone?: string
  }) {
    await this.gotoNew()

    // Fill basic info
    await this.fillBasicInfo(data)

    // Submit
    await this.createLeadButton.click()

    // Wait for navigation to lead detail
    await this.page.waitForURL(/\/leads\/[\w-]+/, { timeout: 15000 })
  }

  /**
   * Get lead ID from current URL
   */
  async getLeadIdFromUrl(): Promise<string> {
    const url = this.page.url()
    const match = url.match(/\/leads\/([\w-]+)/)
    if (!match) {
      throw new Error(`Could not extract lead ID from URL: ${url}`)
    }
    return match[1]
  }

  /**
   * Click qualify button to open qualification dialog
   */
  async openQualifyDialog() {
    await this.qualifyButton.click()
    // Wait for dialog to appear
    await this.page.waitForSelector('[role="dialog"]', { timeout: 10000 })
  }

  /**
   * Verify lead was created successfully
   */
  async expectLeadCreated(firstName: string, lastName: string) {
    await expect(this.page).toHaveURL(/\/leads\/\d+/)
    await expect(this.page.getByRole('heading').first()).toBeVisible()
  }

  /**
   * Check if qualify button is visible
   */
  async isQualifyButtonVisible(): Promise<boolean> {
    return await this.qualifyButton.isVisible()
  }
}
