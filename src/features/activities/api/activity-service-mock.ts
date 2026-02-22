import type {
  Activity,
  CreateActivityDto,
  UpdateActivityDto,
  CompleteActivityDto,
} from '@/core/contracts/entities/activity'
import { ActivityStateCode, ActivityTypeCode } from '@/core/contracts/enums'
import { storage } from '@/lib/storage'
import { mockDelay, MOCK_DELAYS } from '@/lib/mock-delay'
import { mockActivities } from '../data/mock-activities'

/**
 * Activity Service - Mock Implementation
 *
 * Servicio base para gestión de Activities
 * Mock implementation con localStorage
 *
 * ✅ Soporta todos los tipos: Email, PhoneCall, Task, Appointment
 * ✅ Regarding polimórfico (Lead, Opportunity, Account, Contact)
 * ✅ Timeline chronológico
 */

const STORAGE_KEY = 'crm_activities'

// Helper: Get all activities from storage
function getAllActivities(): Activity[] {
  const stored = storage.get<Activity[]>(STORAGE_KEY)
  if (!stored) {
    // Inicializar con mock data
    storage.set(STORAGE_KEY, mockActivities)
    return mockActivities
  }
  return stored
}

// Helper: Save activities to storage
function saveActivities(activities: Activity[]): void {
  storage.set(STORAGE_KEY, activities)
}

export const activityServiceMock = {
  /**
   * Get all activities
   */
  async getAll(): Promise<Activity[]> {
    await mockDelay(MOCK_DELAYS.READ)
    return getAllActivities()
  },

  /**
   * Get activity by ID
   */
  async getById(id: string): Promise<Activity | null> {
    await mockDelay(MOCK_DELAYS.READ)
    const activities = getAllActivities()
    return activities.find((a) => a.activityid === id) || null
  },

  /**
   * Get activities by type
   */
  async getByType(typecode: ActivityTypeCode): Promise<Activity[]> {
    await mockDelay(MOCK_DELAYS.READ)
    const activities = getAllActivities()
    return activities.filter((a) => a.activitytypecode === typecode)
  },

  /**
   * Get activities by state
   */
  async getByState(statecode: ActivityStateCode): Promise<Activity[]> {
    await mockDelay(MOCK_DELAYS.READ)
    const activities = getAllActivities()
    return activities.filter((a) => a.statecode === statecode)
  },

  /**
   * 🔥 CRÍTICO: Get activities by regarding object (Timeline)
   *
   * Retorna todas las actividades relacionadas a un Lead, Opportunity, Account, o Contact
   */
  async getByRegarding(
    regardingId: string,
    regardingType?: string
  ): Promise<Activity[]> {
    await mockDelay(MOCK_DELAYS.READ)
    const activities = getAllActivities()

    let filtered = activities.filter((a) => a.regardingobjectid === regardingId)

    if (regardingType) {
      filtered = filtered.filter((a) => a.regardingobjectidtype === regardingType)
    }

    // Ordenar por fecha (más recientes primero)
    return filtered.sort((a, b) => {
      const dateA = a.actualstart || a.scheduledstart || a.createdon
      const dateB = b.actualstart || b.scheduledstart || b.createdon
      return new Date(dateB).getTime() - new Date(dateA).getTime()
    })
  },

  /**
   * Get activities by owner
   */
  async getByOwner(ownerId: string): Promise<Activity[]> {
    await mockDelay(MOCK_DELAYS.READ)
    const activities = getAllActivities()
    return activities.filter((a) => a.ownerid === ownerId)
  },

  /**
   * Get upcoming activities (scheduled in future)
   */
  async getUpcoming(ownerId?: string): Promise<Activity[]> {
    await mockDelay(MOCK_DELAYS.READ)
    const activities = getAllActivities()
    const now = new Date().toISOString()

    let upcoming = activities.filter(
      (a) =>
        a.statecode === ActivityStateCode.Open &&
        a.scheduledstart &&
        a.scheduledstart > now
    )

    if (ownerId) {
      upcoming = upcoming.filter((a) => a.ownerid === ownerId)
    }

    return upcoming.sort((a, b) => {
      const dateA = a.scheduledstart || ''
      const dateB = b.scheduledstart || ''
      return dateA.localeCompare(dateB)
    })
  },

  /**
   * Get overdue activities
   */
  async getOverdue(ownerId?: string): Promise<Activity[]> {
    await mockDelay(MOCK_DELAYS.READ)
    const activities = getAllActivities()
    const now = new Date().toISOString()

    let overdue = activities.filter(
      (a) =>
        a.statecode === ActivityStateCode.Open &&
        a.scheduledend &&
        a.scheduledend < now
    )

    if (ownerId) {
      overdue = overdue.filter((a) => a.ownerid === ownerId)
    }

    return overdue.sort((a, b) => {
      const dateA = a.scheduledend || ''
      const dateB = b.scheduledend || ''
      return dateA.localeCompare(dateB)
    })
  },

  /**
   * Create activity
   */
  async create(dto: CreateActivityDto): Promise<Activity> {
    await mockDelay(MOCK_DELAYS.WRITE)

    const newActivity: Activity = {
      activityid: `activity-${Date.now()}`,
      activitytypecode: dto.activitytypecode,
      statecode: ActivityStateCode.Open,
      subject: dto.subject,
      description: dto.description,
      regardingobjectid: dto.regardingobjectid,
      regardingobjectidtype: dto.regardingobjectidtype,
      scheduledstart: dto.scheduledstart,
      scheduledend: dto.scheduledend,
      prioritycode: dto.prioritycode,
      ownerid: dto.ownerid,
      createdon: new Date().toISOString(),
      modifiedon: new Date().toISOString(),
      createdby: dto.ownerid,
    }

    const activities = getAllActivities()
    activities.push(newActivity)
    saveActivities(activities)

    return newActivity
  },

  /**
   * Update activity
   */
  async update(id: string, dto: UpdateActivityDto): Promise<Activity | null> {
    await mockDelay(MOCK_DELAYS.WRITE)

    const activities = getAllActivities()
    const index = activities.findIndex((a) => a.activityid === id)

    if (index === -1) {
      return null
    }

    activities[index] = {
      ...activities[index],
      ...dto,
      modifiedon: new Date().toISOString(),
    }

    saveActivities(activities)
    return activities[index]
  },

  /**
   * Complete activity
   */
  async complete(id: string, dto: CompleteActivityDto): Promise<Activity | null> {
    await mockDelay(MOCK_DELAYS.WRITE)

    const activities = getAllActivities()
    const index = activities.findIndex((a) => a.activityid === id)

    if (index === -1) {
      return null
    }

    activities[index] = {
      ...activities[index],
      statecode: ActivityStateCode.Completed,
      actualstart: dto.actualstart || activities[index].scheduledstart,
      actualend: dto.actualend,
      actualdurationminutes: dto.actualdurationminutes,
      modifiedon: new Date().toISOString(),
    }

    saveActivities(activities)
    return activities[index]
  },

  /**
   * Cancel activity
   */
  async cancel(id: string): Promise<Activity | null> {
    await mockDelay(MOCK_DELAYS.WRITE)

    const activities = getAllActivities()
    const index = activities.findIndex((a) => a.activityid === id)

    if (index === -1) {
      return null
    }

    activities[index] = {
      ...activities[index],
      statecode: ActivityStateCode.Canceled,
      modifiedon: new Date().toISOString(),
    }

    saveActivities(activities)
    return activities[index]
  },

  /**
   * Delete activity
   */
  async delete(id: string): Promise<boolean> {
    await mockDelay(MOCK_DELAYS.WRITE)

    const activities = getAllActivities()
    const filtered = activities.filter((a) => a.activityid !== id)

    if (filtered.length === activities.length) {
      return false
    }

    saveActivities(filtered)
    return true
  },

  /**
   * Send document email (mock stub)
   */
  async sendDocumentEmail(params: {
    to: string
    subject: string
    body: string
    documentType: string
    documentId: string
    senderName?: string
    cc?: string
    bcc?: string
    pdfBlob?: Blob
    pdfFilename?: string
  }): Promise<{ success: boolean; activityid: string; message: string }> {
    await mockDelay(MOCK_DELAYS.WRITE)
    return {
      success: true,
      activityid: `activity-${Date.now()}`,
      message: 'Email sent successfully (mock)',
    }
  },

  // ===========================================================================
  // Email Matching Stubs
  // ===========================================================================

  async getUnlinkedEmails() {
    await mockDelay(MOCK_DELAYS.READ)
    return []
  },

  async getUnlinkedEmailCount() {
    await mockDelay(MOCK_DELAYS.READ)
    return 0
  },

  async getMatchSuggestions(_activityId: string) {
    await mockDelay(MOCK_DELAYS.READ)
    return {
      activityid: _activityId,
      matched: false,
      suggestion: undefined,
      matched_contacts: [],
      matched_accounts: [],
      candidate_opportunities: [],
    }
  },

  async linkEmail(_activityId: string, _dto: { regardingobjectid: string; regardingobjectidtype: string }) {
    await mockDelay(MOCK_DELAYS.WRITE)
    const activities = getAllActivities()
    const activity = activities.find((a) => a.activityid === _activityId)
    if (activity) {
      activity.regardingobjectid = _dto.regardingobjectid
      activity.regardingobjectidtype = _dto.regardingobjectidtype
      saveActivities(activities)
      return activity
    }
    return null
  },

  async unlinkEmail(_activityId: string) {
    await mockDelay(MOCK_DELAYS.WRITE)
    const activities = getAllActivities()
    const activity = activities.find((a) => a.activityid === _activityId)
    if (activity) {
      activity.regardingobjectid = undefined
      activity.regardingobjectidtype = undefined
      saveActivities(activities)
      return activity
    }
    return null
  },

  // ===========================================================================
  // Microsoft Graph Integration Stubs
  // ===========================================================================

  async getGraphConnectUrl() {
    await mockDelay(MOCK_DELAYS.READ)
    return { authorization_url: 'https://login.microsoftonline.com/mock/oauth2/authorize' }
  },

  async getGraphConnectionStatus() {
    await mockDelay(MOCK_DELAYS.READ)
    return {
      connected: false,
      microsoft_email: null,
      connected_on: null,
      last_sync_on: null,
      last_sync_count: 0,
    }
  },

  async syncGraphEmails() {
    await mockDelay(MOCK_DELAYS.WRITE)
    return {
      success: true,
      total_fetched: 0,
      new_emails: 0,
      duplicates_skipped: 0,
      matched_emails: 0,
      unmatched_emails: 0,
      errors: [],
    }
  },

  async disconnectGraph() {
    await mockDelay(MOCK_DELAYS.WRITE)
    return { success: true, message: 'Disconnected (mock)' }
  },

  /**
   * Get activity statistics
   */
  async getStatistics(ownerId?: string): Promise<{
    total: number
    open: number
    completed: number
    overdue: number
    upcoming: number
  }> {
    await mockDelay(MOCK_DELAYS.READ)

    const activities = getAllActivities()
    const now = new Date().toISOString()

    let filtered = ownerId
      ? activities.filter((a) => a.ownerid === ownerId)
      : activities

    const open = filtered.filter((a) => a.statecode === ActivityStateCode.Open)
    const completed = filtered.filter(
      (a) => a.statecode === ActivityStateCode.Completed
    )
    const overdue = open.filter((a) => a.scheduledend && a.scheduledend < now)
    const upcoming = open.filter(
      (a) => a.scheduledstart && a.scheduledstart > now
    )

    return {
      total: filtered.length,
      open: open.length,
      completed: completed.length,
      overdue: overdue.length,
      upcoming: upcoming.length,
    }
  },
}
