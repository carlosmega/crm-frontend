/**
 * Activity Service - Backend Implementation
 *
 * Implementación del servicio de activities usando Django REST API
 * Endpoints: /api/activities/
 */

import apiClient from '@/core/api/client'
import type {
  Activity,
  CreateActivityDto,
  UpdateActivityDto,
  CompleteActivityDto,
  ActivityBackendResponse,
} from '@/core/contracts/entities/activity'
import type {
  UnlinkedEmail,
  MatchSuggestionsResponse,
  LinkEmailDto,
} from '@/core/contracts/entities/email'
import { ActivityStateCode, ActivityTypeCode } from '@/core/contracts/enums'

/**
 * Activity Service Backend
 *
 * Django devuelve los datos directamente (sin wrapper {success, data})
 *
 * Soporta todos los tipos: Email, PhoneCall, Task, Appointment, Meeting
 * Regarding polimórfico (Lead, Opportunity, Account, Contact)
 */
class ActivityServiceBackend {
  private readonly basePath = '/activities'

  /**
   * Obtener todas las actividades
   *
   * @param filters - Filtros opcionales
   * @returns Lista de actividades
   */
  async getAll(filters?: {
    statecode?: ActivityStateCode
    activitytypecode?: ActivityTypeCode
    regardingobjectid?: string
    ownerid?: string
  }): Promise<Activity[]> {
    const response = await apiClient.get<Activity[]>(
      this.basePath,
      { params: filters }
    )
    return response.data
  }

  /**
   * Obtener actividad por ID
   *
   * @param id - ID de la actividad
   * @returns Actividad o null si no existe
   */
  async getById(id: string): Promise<Activity | null> {
    try {
      const response = await apiClient.get<ActivityBackendResponse>(
        `${this.basePath}/${id}`
      )

      // El backend devuelve una estructura anidada con activity, email, phonecall, task, appointment
      // Extraer solo el objeto activity
      return response.data.activity
    } catch (error: any) {
      if (error.error?.code === 'NOT_FOUND') {
        return null
      }
      throw error
    }
  }

  /**
   * Obtener actividades por tipo
   *
   * @param typecode - Tipo de actividad (Email, PhoneCall, Task, etc.)
   * @returns Actividades del tipo especificado
   */
  async getByType(typecode: ActivityTypeCode): Promise<Activity[]> {
    return this.getAll({ activitytypecode: typecode })
  }

  /**
   * Obtener actividades por estado
   *
   * @param statecode - Estado (Open, Completed, Canceled)
   * @returns Actividades en el estado especificado
   */
  async getByState(statecode: ActivityStateCode): Promise<Activity[]> {
    return this.getAll({ statecode })
  }

  /**
   * 🔥 CRÍTICO: Obtener actividades por objeto relacionado (Timeline)
   *
   * Retorna todas las actividades relacionadas a un Lead, Opportunity, Account, o Contact
   * Ordenadas cronológicamente (más recientes primero)
   *
   * @param regardingId - ID del objeto relacionado
   * @param regardingType - Tipo de objeto (lead, opportunity, account, contact)
   * @returns Actividades relacionadas ordenadas por fecha
   */
  async getByRegarding(
    regardingId: string,
    regardingType?: string
  ): Promise<Activity[]> {
    const response = await apiClient.get<Activity[]>(
      this.basePath,
      {
        params: {
          regardingobjectid: regardingId,
          regardingobjectidtype: regardingType,
        },
      }
    )

    // Ordenar por fecha (más recientes primero)
    const activities = response.data
    return activities.sort((a, b) => {
      const dateA = a.actualstart || a.scheduledstart || a.createdon
      const dateB = b.actualstart || b.scheduledstart || b.createdon
      return new Date(dateB).getTime() - new Date(dateA).getTime()
    })
  }

  /**
   * Obtener actividades por propietario
   *
   * @param ownerId - ID del propietario
   * @returns Actividades del propietario
   */
  async getByOwner(ownerId: string): Promise<Activity[]> {
    return this.getAll({ ownerid: ownerId })
  }

  /**
   * Obtener actividades próximas (programadas en el futuro)
   *
   * @param ownerId - ID del propietario (opcional)
   * @returns Actividades próximas ordenadas por fecha
   */
  async getUpcoming(ownerId?: string): Promise<Activity[]> {
    const response = await apiClient.get<Activity[]>(
      this.basePath,
      {
        params: {
          upcoming: true,
          ownerid: ownerId,
        },
      }
    )

    // Ordenar por fecha de inicio
    const activities = response.data
    return activities.sort((a, b) => {
      const dateA = a.scheduledstart || ''
      const dateB = b.scheduledstart || ''
      return dateA.localeCompare(dateB)
    })
  }

  /**
   * Obtener actividades vencidas
   *
   * @param ownerId - ID del propietario (opcional)
   * @returns Actividades vencidas ordenadas por fecha
   */
  async getOverdue(ownerId?: string): Promise<Activity[]> {
    const response = await apiClient.get<Activity[]>(
      this.basePath,
      {
        params: {
          overdue: true,
          ownerid: ownerId,
        },
      }
    )

    // Ordenar por fecha de fin
    const activities = response.data
    return activities.sort((a, b) => {
      const dateA = a.scheduledend || ''
      const dateB = b.scheduledend || ''
      return dateA.localeCompare(dateB)
    })
  }

  /**
   * Crear nueva actividad
   *
   * @param dto - Datos de la actividad
   * @returns Actividad creada con ID asignado
   */
  async create(dto: CreateActivityDto): Promise<Activity> {
    const response = await apiClient.post<ActivityBackendResponse>(
      this.basePath,
      dto
    )

    // Extraer el objeto activity de la respuesta anidada
    return response.data.activity
  }

  /**
   * Actualizar actividad existente
   *
   * Solo se puede editar si está en estado Open
   *
   * @param id - ID de la actividad
   * @param dto - Campos a actualizar
   * @returns Actividad actualizada o null si no existe
   */
  async update(id: string, dto: UpdateActivityDto): Promise<Activity | null> {
    try {
      const response = await apiClient.patch<ActivityBackendResponse>(
        `${this.basePath}/${id}`,
        dto
      )

      // Extraer el objeto activity de la respuesta anidada
      return response.data.activity
    } catch (error: any) {
      if (error.error?.code === 'NOT_FOUND') {
        return null
      }
      throw error
    }
  }

  /**
   * Completar actividad
   *
   * Cambia el estado a Completed y registra fechas de finalización
   *
   * @param id - ID de la actividad
   * @param dto - Datos de finalización
   * @returns Actividad completada
   */
  async complete(id: string, dto: CompleteActivityDto): Promise<Activity | null> {
    try {
      const response = await apiClient.post<ActivityBackendResponse>(
        `${this.basePath}/${id}/complete`,
        {
          actual_start: dto.actualstart,
          actual_end: dto.actualend,
          actual_duration_minutes: dto.actualdurationminutes,
        }
      )

      // Extraer el objeto activity de la respuesta anidada
      return response.data.activity
    } catch (error: any) {
      if (error.error?.code === 'NOT_FOUND') {
        return null
      }
      throw error
    }
  }

  /**
   * Cancelar actividad
   *
   * Cambia el estado a Canceled
   *
   * @param id - ID de la actividad
   * @returns Actividad cancelada
   */
  async cancel(id: string): Promise<Activity | null> {
    try {
      const response = await apiClient.post<ActivityBackendResponse>(
        `${this.basePath}/${id}/cancel`
      )

      // Extraer el objeto activity de la respuesta anidada
      return response.data.activity
    } catch (error: any) {
      if (error.error?.code === 'NOT_FOUND') {
        return null
      }
      throw error
    }
  }

  /**
   * Eliminar actividad (hard delete)
   *
   * @param id - ID de la actividad
   * @returns true si se eliminó
   */
  async delete(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`${this.basePath}/${id}`)
      return true
    } catch (error: any) {
      if (error.error?.code === 'NOT_FOUND') {
        return false
      }
      throw error
    }
  }

  /**
   * Send a document email with optional PDF attachment.
   *
   * Uses multipart/form-data to send text fields + PDF blob.
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
    const formData = new FormData()
    formData.append('to', params.to)
    formData.append('subject', params.subject)
    formData.append('body', params.body)
    formData.append('document_type', params.documentType)
    formData.append('document_id', params.documentId)
    if (params.senderName) formData.append('sender_name', params.senderName)
    if (params.cc) formData.append('cc', params.cc)
    if (params.bcc) formData.append('bcc', params.bcc)
    if (params.pdfBlob) {
      formData.append(
        'pdf_file',
        params.pdfBlob,
        params.pdfFilename || 'document.pdf'
      )
    }

    const response = await apiClient.post<{
      success: boolean
      activityid: string
      message: string
    }>(`${this.basePath}/send-document-email`, formData)

    return response.data
  }

  // ===========================================================================
  // Email Matching Methods
  // ===========================================================================

  /**
   * Get unlinked emails (emails without a regarding object)
   */
  async getUnlinkedEmails(): Promise<UnlinkedEmail[]> {
    const response = await apiClient.get<UnlinkedEmail[]>(
      `${this.basePath}/emails/unlinked`
    )
    return response.data
  }

  /**
   * Get count of unlinked emails (for badge display)
   */
  async getUnlinkedEmailCount(): Promise<number> {
    const response = await apiClient.get<{ count: number }>(
      `${this.basePath}/emails/unlinked/count`
    )
    return response.data.count
  }

  /**
   * Get match suggestions for an email activity
   */
  async getMatchSuggestions(activityId: string): Promise<MatchSuggestionsResponse> {
    const response = await apiClient.get<MatchSuggestionsResponse>(
      `${this.basePath}/emails/match-suggestions/${activityId}`
    )
    return response.data
  }

  /**
   * Manually link an email to a CRM record
   */
  async linkEmail(activityId: string, dto: LinkEmailDto): Promise<Activity> {
    const response = await apiClient.post<Activity>(
      `${this.basePath}/${activityId}/link`,
      dto
    )
    return response.data
  }

  /**
   * Remove the regarding association from an email
   */
  async unlinkEmail(activityId: string): Promise<Activity> {
    const response = await apiClient.post<Activity>(
      `${this.basePath}/${activityId}/unlink`
    )
    return response.data
  }

  // ===========================================================================
  // Microsoft Graph Integration Methods
  // ===========================================================================

  /**
   * Get Microsoft OAuth2 authorization URL for connecting Office 365
   */
  async getGraphConnectUrl(): Promise<{ authorization_url: string }> {
    const response = await apiClient.get<{ authorization_url: string }>(
      '/graph/connect'
    )
    return response.data
  }

  /**
   * Get Microsoft Graph connection status for the current user
   */
  async getGraphConnectionStatus(): Promise<{
    connected: boolean
    microsoft_email: string | null
    connected_on: string | null
    last_sync_on: string | null
    last_sync_count: number
  }> {
    const response = await apiClient.get<{
      connected: boolean
      microsoft_email: string | null
      connected_on: string | null
      last_sync_on: string | null
      last_sync_count: number
    }>('/graph/status')
    return response.data
  }

  /**
   * Trigger on-demand email sync from Microsoft Graph
   */
  async syncGraphEmails(): Promise<{
    success: boolean
    total_fetched: number
    new_emails: number
    duplicates_skipped: number
    matched_emails: number
    unmatched_emails: number
    errors: string[]
  }> {
    const response = await apiClient.post<{
      success: boolean
      total_fetched: number
      new_emails: number
      duplicates_skipped: number
      matched_emails: number
      unmatched_emails: number
      errors: string[]
    }>('/graph/sync')
    return response.data
  }

  /**
   * Disconnect Microsoft account from CRM
   */
  async disconnectGraph(): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post<{ success: boolean; message: string }>(
      '/graph/disconnect'
    )
    return response.data
  }

  /**
   * Obtener estadísticas de actividades
   *
   * @param ownerId - ID del propietario (opcional)
   * @returns Estadísticas
   */
  async getStatistics(ownerId?: string): Promise<{
    total: number
    open: number
    completed: number
    overdue: number
    upcoming: number
  }> {
    const response = await apiClient.get<{
      total_activities: number
      open_count: number
      completed_count: number
      overdue_count: number
      upcoming_count: number
    }>(`${this.basePath}/stats/summary`, {
      params: ownerId ? { ownerid: ownerId } : undefined,
    })

    const stats = response.data

    // Transformar nombres de Django a nuestro formato
    return {
      total: stats.total_activities,
      open: stats.open_count,
      completed: stats.completed_count,
      overdue: stats.overdue_count,
      upcoming: stats.upcoming_count,
    }
  }
}

/**
 * Instancia singleton del servicio de actividades (backend)
 */
export const activityServiceBackend = new ActivityServiceBackend()
