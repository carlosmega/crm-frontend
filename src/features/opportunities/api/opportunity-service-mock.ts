import type {
  Opportunity,
  CreateOpportunityDto,
  UpdateOpportunityDto,
  CloseOpportunityDto
} from '@/core/contracts'
import { OpportunityStateCode, SalesStageCode } from '@/core/contracts'
import { mockOpportunities as initialMockOpportunities } from '../data/mock-opportunities'
import { mockDelay, MOCK_DELAYS } from '@/lib/mock-delay'

/**
 * Opportunity Service (Mock)
 *
 * Gestiona las operaciones CRUD para Opportunities
 * Incluye logica de Business Process Flow (Sales Stages)
 *
 * ✅ OPTIMIZED: No delays in development for fast DX
 */

// Mock data storage - initialized with mock data
let mockOpportunities: Opportunity[] = [...initialMockOpportunities]

class OpportunityServiceMock {
  /**
   * Get all opportunities
   */
  async getAll(): Promise<Opportunity[]> {
    await mockDelay(MOCK_DELAYS.READ)
    return mockOpportunities
  }

  /**
   * Get opportunities with optional state filter
   */
  async getOpportunities(statecode?: OpportunityStateCode): Promise<Opportunity[]> {
    await mockDelay(MOCK_DELAYS.READ)
    if (statecode === undefined) {
      return mockOpportunities
    }
    return mockOpportunities.filter(opp => opp.statecode === statecode)
  }

  /**
   * Get opportunity by ID
   */
  async getById(id: string): Promise<Opportunity | null> {
    await mockDelay(MOCK_DELAYS.READ)
    return mockOpportunities.find(opp => opp.opportunityid === id) || null
  }

  /**
   * Create new opportunity
   */
  async create(dto: CreateOpportunityDto): Promise<Opportunity> {
    await mockDelay(MOCK_DELAYS.WRITE)

    const closeProbability = this.getCloseProbabilityBySalesStage(dto.salesstage)

    const newOpportunity: Opportunity = {
      opportunityid: `opp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      statecode: OpportunityStateCode.Open,
      statuscode: 1, // In_Progress
      name: dto.name,
      description: dto.description,
      customerid: dto.customerid,
      customeridtype: dto.customeridtype,
      salesstage: dto.salesstage,
      closeprobability: closeProbability,
      estimatedvalue: dto.estimatedvalue,
      estimatedclosedate: dto.estimatedclosedate,
      originatingleadid: dto.originatingleadid,
      ownerid: dto.ownerid,
      createdon: new Date().toISOString(),
      modifiedon: new Date().toISOString(),
    }

    mockOpportunities.push(newOpportunity)
    return newOpportunity
  }

  /**
   * Update opportunity
   */
  async update(id: string, dto: UpdateOpportunityDto): Promise<Opportunity> {
    await mockDelay(MOCK_DELAYS.WRITE)

    const index = mockOpportunities.findIndex(opp => opp.opportunityid === id)
    if (index === -1) {
      throw new Error(`Opportunity with id ${id} not found`)
    }

    const updatedOpportunity = {
      ...mockOpportunities[index],
      ...dto,
      modifiedon: new Date().toISOString(),
    }

    // Auto-update closeprobability if salesstage changed
    if (dto.salesstage !== undefined) {
      updatedOpportunity.closeprobability = this.getCloseProbabilityBySalesStage(dto.salesstage)
    }

    mockOpportunities[index] = updatedOpportunity
    return updatedOpportunity
  }

  /**
   * Move opportunity to next sales stage
   */
  async moveToNextStage(id: string): Promise<Opportunity> {
    const opportunity = await this.getById(id)
    if (!opportunity) {
      throw new Error(`Opportunity with id ${id} not found`)
    }

    const nextStage = this.getNextSalesStage(opportunity.salesstage)
    if (nextStage === null) {
      throw new Error('Opportunity is already in final stage')
    }

    return this.update(id, { salesstage: nextStage })
  }

  /**
   * Move opportunity to previous sales stage
   */
  async moveToPreviousStage(id: string): Promise<Opportunity> {
    const opportunity = await this.getById(id)
    if (!opportunity) {
      throw new Error(`Opportunity with id ${id} not found`)
    }

    const previousStage = this.getPreviousSalesStage(opportunity.salesstage)
    if (previousStage === null) {
      throw new Error('Opportunity is already in first stage')
    }

    return this.update(id, { salesstage: previousStage })
  }

  /**
   * Close opportunity as Won (simplified method for Quote win workflow)
   *
   * @param opportunityid - Opportunity ID to close
   * @param data - Actual revenue and close date
   * @returns Closed opportunity
   *
   * ⚠️ Permissive: Logs warning if already closed but doesn't throw error
   */
  async closeAsWon(
    opportunityid: string,
    data: { actualrevenue: number; actualclosedate: string }
  ): Promise<Opportunity> {
    await mockDelay(MOCK_DELAYS.WRITE)

    const index = mockOpportunities.findIndex(opp => opp.opportunityid === opportunityid)
    if (index === -1) {
      throw new Error(`Opportunity with id ${opportunityid} not found`)
    }

    const opportunity = mockOpportunities[index]

    // ⚠️ Permissive validation: warn if already closed
    if (opportunity.statecode !== OpportunityStateCode.Open) {
      console.warn(`[WARN] Opportunity ${opportunityid} is already closed (statecode: ${opportunity.statecode})`)
      return opportunity // Return as-is, don't error
    }

    const closedOpportunity: Opportunity = {
      ...opportunity,
      statecode: OpportunityStateCode.Won,
      statuscode: 3, // Won
      closeprobability: 100,
      actualvalue: data.actualrevenue,
      actualclosedate: data.actualclosedate,
      closestatus: 'Won',
      salesstage: SalesStageCode.Close,
      modifiedon: new Date().toISOString(),
    }

    mockOpportunities[index] = closedOpportunity
    return closedOpportunity
  }

  /**
   * Close opportunity (Win or Lost)
   */
  async close(id: string, dto: CloseOpportunityDto): Promise<Opportunity> {
    await mockDelay(MOCK_DELAYS.WRITE)

    const index = mockOpportunities.findIndex(opp => opp.opportunityid === id)
    if (index === -1) {
      throw new Error(`Opportunity with id ${id} not found`)
    }

    const closedOpportunity: Opportunity = {
      ...mockOpportunities[index],
      statecode: dto.statecode,
      statuscode: dto.statuscode,
      actualvalue: dto.actualvalue,
      actualclosedate: dto.actualclosedate,
      closestatus: dto.closestatus,
      closeprobability: dto.statecode === OpportunityStateCode.Won ? 100 : 0,
      salesstage: SalesStageCode.Close,
      modifiedon: new Date().toISOString(),
    }

    mockOpportunities[index] = closedOpportunity
    return closedOpportunity
  }

  /**
   * Delete opportunity
   */
  async delete(id: string): Promise<void> {
    await mockDelay(MOCK_DELAYS.READ)
    mockOpportunities = mockOpportunities.filter(opp => opp.opportunityid !== id)
  }

  /**
   * Get opportunities by customer (Account or Contact)
   */
  async getByCustomer(customerId: string): Promise<Opportunity[]> {
    await mockDelay(MOCK_DELAYS.READ)
    return mockOpportunities.filter(opp => opp.customerid === customerId)
  }

  /**
   * Get opportunities by originating lead
   */
  async getByLead(leadId: string): Promise<Opportunity[]> {
    await mockDelay(MOCK_DELAYS.READ)
    return mockOpportunities.filter(opp => opp.originatingleadid === leadId)
  }

  /**
   * Get close probability by sales stage
   */
  private getCloseProbabilityBySalesStage(stage: SalesStageCode): number {
    switch (stage) {
      case SalesStageCode.Qualify:
        return 25
      case SalesStageCode.Develop:
        return 50
      case SalesStageCode.Propose:
        return 75
      case SalesStageCode.Close:
        return 100
      default:
        return 0
    }
  }

  /**
   * Get next sales stage
   */
  private getNextSalesStage(currentStage: SalesStageCode): SalesStageCode | null {
    switch (currentStage) {
      case SalesStageCode.Qualify:
        return SalesStageCode.Develop
      case SalesStageCode.Develop:
        return SalesStageCode.Propose
      case SalesStageCode.Propose:
        return SalesStageCode.Close
      case SalesStageCode.Close:
        return null // Final stage
      default:
        return null
    }
  }

  /**
   * Get previous sales stage
   */
  private getPreviousSalesStage(currentStage: SalesStageCode): SalesStageCode | null {
    switch (currentStage) {
      case SalesStageCode.Qualify:
        return null // First stage
      case SalesStageCode.Develop:
        return SalesStageCode.Qualify
      case SalesStageCode.Propose:
        return SalesStageCode.Develop
      case SalesStageCode.Close:
        return SalesStageCode.Propose
      default:
        return null
    }
  }
}

export const opportunityServiceMock = new OpportunityServiceMock()
