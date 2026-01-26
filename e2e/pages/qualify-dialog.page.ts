import { Page, Locator, expect } from '@playwright/test'

/**
 * Page Object for Lead Qualification Dialog
 * Handles the complete Lead → Opportunity qualification flow
 */
export class QualifyDialogPage {
  readonly page: Page

  // Dialog
  readonly dialog: Locator
  readonly dialogTitle: Locator

  // Account Section (B2B only)
  readonly createAccountRadio: Locator
  readonly existingAccountRadio: Locator

  // Contact Section
  readonly createContactRadio: Locator
  readonly existingContactRadio: Locator

  // Opportunity Section
  readonly opportunityNameInput: Locator
  readonly estimatedValueInput: Locator
  readonly descriptionTextarea: Locator

  // Actions
  readonly qualifyLeadButton: Locator
  readonly cancelButton: Locator

  // Success Dialog
  readonly viewOpportunityButton: Locator
  readonly doneButton: Locator

  constructor(page: Page) {
    this.page = page

    // Dialog
    this.dialog = page.getByRole('dialog')
    this.dialogTitle = page.getByRole('heading', { name: /qualify lead/i })

    // Account Section - using label text
    this.createAccountRadio = page.getByLabel(/create new account/i)
    this.existingAccountRadio = page.getByLabel(/use existing account/i)

    // Contact Section
    this.createContactRadio = page.getByLabel(/create new contact/i)
    this.existingContactRadio = page.getByLabel(/use existing contact/i)

    // Opportunity Section
    this.opportunityNameInput = page.getByLabel(/opportunity name/i)
    this.estimatedValueInput = page.getByLabel(/estimated value/i)
    this.descriptionTextarea = page.getByLabel(/description/i)

    // Actions
    this.qualifyLeadButton = page.getByRole('button', { name: /qualify lead/i })
    this.cancelButton = page.getByRole('button', { name: 'Close' })

    // Success Dialog
    this.viewOpportunityButton = page.getByRole('button', { name: /view opportunity/i })
    this.doneButton = page.getByRole('button', { name: /done/i })
  }

  /**
   * Wait for dialog to be visible
   */
  async waitForDialog() {
    await expect(this.dialog).toBeVisible({ timeout: 10000 })
  }

  /**
   * Check if this is a B2B qualification (has Account section)
   */
  async isB2B(): Promise<boolean> {
    return await this.page.getByText(/B2B/i).isVisible()
  }

  /**
   * Configure Account creation (B2B only)
   */
  async configureAccount(mode: 'create' | 'existing') {
    if (mode === 'create') {
      await this.createAccountRadio.click()
    } else {
      await this.existingAccountRadio.click()
    }
  }

  /**
   * Configure Contact creation
   */
  async configureContact(mode: 'create' | 'existing') {
    if (mode === 'create') {
      await this.createContactRadio.click()
    } else {
      await this.existingContactRadio.click()
    }
  }

  /**
   * Fill opportunity details
   */
  async fillOpportunityDetails(data: {
    name?: string
    estimatedValue?: number
    description?: string
  }) {
    if (data.name) {
      await this.opportunityNameInput.clear()
      await this.opportunityNameInput.fill(data.name)
    }

    if (data.estimatedValue) {
      await this.estimatedValueInput.clear()
      await this.estimatedValueInput.fill(data.estimatedValue.toString())
    }

    if (data.description) {
      await this.descriptionTextarea.fill(data.description)
    }
  }

  /**
   * Submit qualification
   */
  async submitQualification() {
    await this.qualifyLeadButton.click()
  }

  /**
   * Wait for success dialog
   */
  async waitForSuccess() {
    await expect(this.page.getByText(/qualified successfully/i)).toBeVisible({ timeout: 15000 })
  }

  /**
   * Navigate to created opportunity
   */
  async goToOpportunity() {
    await this.viewOpportunityButton.click()
    await this.page.waitForURL(/\/opportunities\/[\w-]+/)
  }

  /**
   * Close success dialog
   */
  async closeSuccessDialog() {
    await this.doneButton.click()
  }

  /**
   * Complete full qualification flow with defaults
   */
  async qualifyWithDefaults(opportunityOverrides?: {
    name?: string
    estimatedValue?: number
    description?: string
  }) {
    await this.waitForDialog()

    // Fill opportunity if overrides provided
    if (opportunityOverrides) {
      await this.fillOpportunityDetails(opportunityOverrides)
    }

    // Submit
    await this.submitQualification()

    // Wait for success
    await this.waitForSuccess()
  }
}
