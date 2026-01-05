import type { Contact, CreateContactDto, UpdateContactDto } from '@/core/contracts'
import { ContactStateCode } from '@/core/contracts'
import { storage } from '@/lib/storage'
import { mockContacts } from '../data/mock-contacts'
import { mockDelay, MOCK_DELAYS } from '@/lib/mock-delay'

const STORAGE_KEY = 'contacts'

/**
 * Contact Service (Mock API)
 *
 * Simula llamadas a backend usando localStorage para persistencia
 *
 * ✅ OPTIMIZED: No delays in development for fast DX
 * ⚠️  Este es el servicio MOCK - para desarrollo offline
 */

// Initialize storage with mock data if not exists
function initializeContacts(): Contact[] {
  const stored = storage.get<Contact[]>(STORAGE_KEY)
  if (!stored) {
    storage.set(STORAGE_KEY, mockContacts)
    return mockContacts
  }
  return stored
}

export const contactServiceMock = {
  /**
   * Get all contacts
   */
  async getAll(): Promise<Contact[]> {
    await mockDelay(MOCK_DELAYS.READ)
    return initializeContacts()
  },

  /**
   * Get contacts by account
   */
  async getByAccount(accountId: string): Promise<Contact[]> {
    await mockDelay(MOCK_DELAYS.READ)
    const contacts = initializeContacts()
    return contacts.filter(contact => contact.parentcustomerid === accountId)
  },

  /**
   * Get contact by ID
   */
  async getById(id: string): Promise<Contact | null> {
    await mockDelay(MOCK_DELAYS.READ)
    const contacts = initializeContacts()
    return contacts.find(contact => contact.contactid === id) || null
  },

  /**
   * Search contacts by name or email
   */
  async search(query: string): Promise<Contact[]> {
    await mockDelay(MOCK_DELAYS.SEARCH)

    const contacts = initializeContacts()
    const lowerQuery = query.toLowerCase()

    return contacts.filter(contact =>
      contact.firstname?.toLowerCase().includes(lowerQuery) ||
      contact.lastname?.toLowerCase().includes(lowerQuery) ||
      contact.fullname?.toLowerCase().includes(lowerQuery) ||
      contact.emailaddress1?.toLowerCase().includes(lowerQuery)
    )
  },

  /**
   * Create new contact
   */
  async create(dto: CreateContactDto): Promise<Contact> {
    await mockDelay(MOCK_DELAYS.WRITE)

    const contacts = initializeContacts()
    const now = new Date().toISOString()

    const newContact: Contact = {
      contactid: crypto.randomUUID(),
      statecode: ContactStateCode.Active,
      firstname: dto.firstname,
      lastname: dto.lastname,
      fullname: `${dto.firstname} ${dto.lastname}`,
      parentcustomerid: dto.parentcustomerid,
      jobtitle: dto.jobtitle,
      emailaddress1: dto.emailaddress1,
      telephone1: dto.telephone1,
      mobilephone: dto.mobilephone,
      address1_line1: dto.address1_line1,
      address1_city: dto.address1_city,
      address1_stateorprovince: dto.address1_stateorprovince,
      address1_postalcode: dto.address1_postalcode,
      address1_country: dto.address1_country,
      ownerid: dto.ownerid,
      createdon: now,
      modifiedon: now,
    }

    const updatedContacts = [...contacts, newContact]
    storage.set(STORAGE_KEY, updatedContacts)

    return newContact
  },

  /**
   * Update existing contact
   */
  async update(id: string, dto: UpdateContactDto): Promise<Contact | null> {
    await mockDelay(MOCK_DELAYS.WRITE)

    const contacts = initializeContacts()
    const index = contacts.findIndex(contact => contact.contactid === id)

    if (index === -1) return null

    const updatedContact: Contact = {
      ...contacts[index],
      ...dto,
      fullname: dto.firstname && dto.lastname
        ? `${dto.firstname} ${dto.lastname}`
        : contacts[index].fullname,
      modifiedon: new Date().toISOString(),
    }

    const updatedContacts = [
      ...contacts.slice(0, index),
      updatedContact,
      ...contacts.slice(index + 1),
    ]

    storage.set(STORAGE_KEY, updatedContacts)

    return updatedContact
  },

  /**
   * Delete contact
   */
  async delete(id: string): Promise<boolean> {
    await mockDelay(MOCK_DELAYS.READ)

    const contacts = initializeContacts()
    const filteredContacts = contacts.filter(contact => contact.contactid !== id)

    if (filteredContacts.length === contacts.length) {
      return false // Contact not found
    }

    storage.set(STORAGE_KEY, filteredContacts)
    return true
  },

  /**
   * Deactivate contact
   */
  async deactivate(id: string): Promise<Contact | null> {
    await mockDelay(MOCK_DELAYS.WRITE)

    const contacts = initializeContacts()
    const index = contacts.findIndex(contact => contact.contactid === id)

    if (index === -1) return null

    const deactivatedContact: Contact = {
      ...contacts[index],
      statecode: ContactStateCode.Inactive,
      modifiedon: new Date().toISOString(),
    }

    const updatedContacts = [
      ...contacts.slice(0, index),
      deactivatedContact,
      ...contacts.slice(index + 1),
    ]

    storage.set(STORAGE_KEY, updatedContacts)

    return deactivatedContact
  },
}
