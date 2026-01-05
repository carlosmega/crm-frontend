import type { Lead, CreateLeadDto, UpdateLeadDto, QualifyLeadDto, QualifyLeadResponse } from '@/core/contracts'
import { LeadStateCode, LeadStatusCode, SalesStageCode, CustomerType, AccountStateCode, ContactStateCode } from '@/core/contracts'
import { MOCK_LEADS } from '../data/mock-leads'
import { storage } from '@/lib/storage'
import { mockDelay, MOCK_DELAYS } from '@/lib/mock-delay'
import { accountService } from '@/features/accounts/api/account-service'
import { contactService } from '@/features/contacts/api/contact-service'
import { opportunityService } from '@/features/opportunities/api/opportunity-service'

const STORAGE_KEY = 'leads';

/**
 * Lead Service (Mock API)
 *
 * ✅ OPTIMIZED: No delays in development for fast DX
 * Simula llamadas a backend usando localStorage para persistencia
 */

// Initialize storage with mock data if empty
function initializeLeads(): Lead[] {
  const stored = storage.get<Lead[]>(STORAGE_KEY);
  if (!stored) {
    storage.set(STORAGE_KEY, MOCK_LEADS);
    return MOCK_LEADS;
  }
  return stored;
}

export const leadServiceMock = {
  /**
   * Get all leads
   */
  async getAll(): Promise<Lead[]> {
    await mockDelay(MOCK_DELAYS.READ);
    return initializeLeads();
  },

  /**
   * Get leads filtered by status
   */
  async getByStatus(statecode: LeadStateCode): Promise<Lead[]> {
    await mockDelay(MOCK_DELAYS.READ);
    const leads = initializeLeads();
    return leads.filter(lead => lead.statecode === statecode);
  },

  /**
   * Get lead by ID
   */
  async getById(id: string): Promise<Lead | null> {
    await mockDelay(MOCK_DELAYS.READ);
    const leads = initializeLeads();
    return leads.find(lead => lead.leadid === id) || null;
  },

  /**
   * Create new lead
   */
  async create(dto: CreateLeadDto): Promise<Lead> {
    await mockDelay(MOCK_DELAYS.WRITE);

    const leads = initializeLeads();
    const now = new Date().toISOString();

    const newLead: Lead = {
      leadid: crypto.randomUUID(),
      statecode: LeadStateCode.Open,
      statuscode: LeadStatusCode.New,
      firstname: dto.firstname,
      lastname: dto.lastname,
      fullname: `${dto.firstname} ${dto.lastname}`,
      jobtitle: dto.jobtitle,
      companyname: dto.companyname,
      emailaddress1: dto.emailaddress1,
      telephone1: dto.telephone1,
      leadsourcecode: dto.leadsourcecode,
      description: dto.description,
      estimatedvalue: dto.estimatedvalue,
      ownerid: dto.ownerid,
      createdon: now,
      modifiedon: now,
    };

    const updatedLeads = [...leads, newLead];
    storage.set(STORAGE_KEY, updatedLeads);

    return newLead;
  },

  /**
   * Update existing lead
   */
  async update(id: string, dto: UpdateLeadDto): Promise<Lead | null> {
    await mockDelay(MOCK_DELAYS.WRITE);

    const leads = initializeLeads();
    const index = leads.findIndex(lead => lead.leadid === id);

    if (index === -1) return null;

    const updatedLead: Lead = {
      ...leads[index],
      ...dto,
      fullname: dto.firstname && dto.lastname
        ? `${dto.firstname} ${dto.lastname}`
        : leads[index].fullname,
      modifiedon: new Date().toISOString(),
    };

    const updatedLeads = [
      ...leads.slice(0, index),
      updatedLead,
      ...leads.slice(index + 1),
    ];

    storage.set(STORAGE_KEY, updatedLeads);

    return updatedLead;
  },

  /**
   * Delete lead
   */
  async delete(id: string): Promise<boolean> {
    await mockDelay(MOCK_DELAYS.WRITE);

    const leads = initializeLeads();
    const filteredLeads = leads.filter(lead => lead.leadid !== id);

    if (filteredLeads.length === leads.length) {
      return false; // Lead not found
    }

    storage.set(STORAGE_KEY, filteredLeads);
    return true;
  },

  /**
   * Qualify lead (comprehensive - creates Account/Contact/Opportunity)
   *
   * Escenarios:
   * 1. B2B - Nuevo cliente: crea Account + Contact + Opportunity
   * 2. B2B - Cliente existente: vincula Account + crea Contact + Opportunity
   * 3. B2C - Sin empresa: crea Contact + Opportunity (sin Account)
   */
  async qualifyWithEntities(id: string, dto: QualifyLeadDto): Promise<QualifyLeadResponse> {
    await mockDelay(MOCK_DELAYS.COMPLEX);

    const leads = initializeLeads();
    const lead = leads.find(lead => lead.leadid === id);

    if (!lead) {
      throw new Error('Lead not found');
    }

    if (lead.statecode !== LeadStateCode.Open) {
      throw new Error('Lead must be in Open state to qualify');
    }

    // STEP 1: Create or link Account (B2B only)
    let accountId: string | undefined;
    let createdAccount: { accountid: string; name: string } | undefined;

    if (dto.createAccount) {
      // Create new Account from lead data
      const newAccount = await accountService.create({
        name: lead.companyname || `${lead.firstname} ${lead.lastname} Company`,
        emailaddress1: lead.emailaddress1,
        telephone1: lead.telephone1,
        websiteurl: lead.websiteurl,
        address1_line1: lead.address1_line1,
        address1_city: lead.address1_city,
        address1_stateorprovince: lead.address1_stateorprovince,
        address1_postalcode: lead.address1_postalcode,
        address1_country: lead.address1_country,
        ownerid: lead.ownerid,
      });
      accountId = newAccount.accountid;
      createdAccount = {
        accountid: newAccount.accountid,
        name: newAccount.name,
      };
    } else if (dto.existingAccountId) {
      // Use existing Account
      accountId = dto.existingAccountId;
    }

    // STEP 2: Create or link Contact (ALWAYS)
    let contactId: string;
    let createdContact: { contactid: string; fullname: string } | undefined;

    if (dto.createContact) {
      // Create new Contact from lead data
      const newContact = await contactService.create({
        firstname: lead.firstname,
        lastname: lead.lastname,
        parentcustomerid: accountId, // Links to Account (B2B) or null (B2C)
        jobtitle: lead.jobtitle,
        emailaddress1: lead.emailaddress1,
        telephone1: lead.telephone1,
        mobilephone: lead.mobilephone,
        address1_line1: lead.address1_line1,
        address1_city: lead.address1_city,
        address1_stateorprovince: lead.address1_stateorprovince,
        address1_postalcode: lead.address1_postalcode,
        address1_country: lead.address1_country,
        ownerid: lead.ownerid,
      });
      contactId = newContact.contactid;
      createdContact = {
        contactid: newContact.contactid,
        fullname: newContact.fullname,
      };
    } else if (dto.existingContactId) {
      // Use existing Contact
      contactId = dto.existingContactId;
    } else {
      throw new Error('Contact must be created or linked');
    }

    // STEP 3: Create Opportunity (ALWAYS)
    // Determine customer type: Account (B2B) or Contact (B2C)
    const customerId = accountId || contactId;
    const customerIdType = accountId ? CustomerType.Account : CustomerType.Contact;

    const newOpportunity = await opportunityService.create({
      name: dto.opportunityName,
      customerid: customerId,
      customeridtype: customerIdType,
      salesstage: SalesStageCode.Develop, // Next stage after qualifying lead
      estimatedvalue: dto.estimatedValue,
      estimatedclosedate: dto.estimatedCloseDate,
      description: dto.description,
      originatingleadid: lead.leadid,
      ownerid: lead.ownerid,
    });

    // STEP 4: Update Lead to Qualified state
    const leadIndex = leads.findIndex(l => l.leadid === id);
    const qualifiedLead: Lead = {
      ...leads[leadIndex],
      statecode: LeadStateCode.Qualified,
      statuscode: LeadStatusCode.Qualified,
      modifiedon: new Date().toISOString(),
    };

    const updatedLeads = [
      ...leads.slice(0, leadIndex),
      qualifiedLead,
      ...leads.slice(leadIndex + 1),
    ];

    storage.set(STORAGE_KEY, updatedLeads);

    // Return complete entities for UI display
    return {
      leadId: lead.leadid,
      accountId,
      contactId,
      opportunityId: newOpportunity.opportunityid,
      // Include full objects for display
      account: createdAccount,
      contact: createdContact,
      opportunity: {
        opportunityid: newOpportunity.opportunityid,
        name: newOpportunity.name,
      },
    };
  },

  /**
   * Qualify lead - Proxy to qualifyWithEntities for backend compatibility
   */
  async qualify(id: string, dto: QualifyLeadDto): Promise<QualifyLeadResponse> {
    return this.qualifyWithEntities(id, dto);
  },

  /**
   * Qualify lead (simple - change to Qualified state only)
   * @deprecated - kept for backward compatibility, not used
   */
  async _qualifySimple(id: string): Promise<Lead | null> {
    await mockDelay(MOCK_DELAYS.WRITE);

    const leads = initializeLeads();
    const index = leads.findIndex(lead => lead.leadid === id);

    if (index === -1) return null;

    const qualifiedLead: Lead = {
      ...leads[index],
      statecode: LeadStateCode.Qualified,
      statuscode: LeadStatusCode.Qualified,
      modifiedon: new Date().toISOString(),
    };

    const updatedLeads = [
      ...leads.slice(0, index),
      qualifiedLead,
      ...leads.slice(index + 1),
    ];

    storage.set(STORAGE_KEY, updatedLeads);

    return qualifiedLead;
  },

  /**
   * Disqualify lead
   */
  async disqualify(id: string): Promise<Lead | null> {
    await mockDelay(MOCK_DELAYS.WRITE);

    const leads = initializeLeads();
    const index = leads.findIndex(lead => lead.leadid === id);

    if (index === -1) return null;

    const disqualifiedLead: Lead = {
      ...leads[index],
      statecode: LeadStateCode.Disqualified,
      statuscode: LeadStatusCode.Disqualified,
      modifiedon: new Date().toISOString(),
    };

    const updatedLeads = [
      ...leads.slice(0, index),
      disqualifiedLead,
      ...leads.slice(index + 1),
    ];

    storage.set(STORAGE_KEY, updatedLeads);

    return disqualifiedLead;
  },

  /**
   * Search leads by text
   */
  async search(query: string): Promise<Lead[]> {
    await mockDelay(MOCK_DELAYS.SEARCH);

    const leads = initializeLeads();
    const lowerQuery = query.toLowerCase();

    return leads.filter(lead =>
      lead.firstname?.toLowerCase().includes(lowerQuery) ||
      lead.lastname?.toLowerCase().includes(lowerQuery) ||
      lead.companyname?.toLowerCase().includes(lowerQuery) ||
      lead.emailaddress1?.toLowerCase().includes(lowerQuery)
    );
  },
};
