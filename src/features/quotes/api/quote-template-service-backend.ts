/**
 * Quote Template Service - Backend Implementation
 *
 * Implementación del servicio de quote templates usando Django REST API
 * Endpoints: /api/quote-templates/
 *
 * Django endpoints esperados:
 *   GET    /api/quote-templates/              → Lista todos los templates
 *   GET    /api/quote-templates/?shared=true   → Solo templates compartidos
 *   GET    /api/quote-templates/?owner={id}    → Templates por owner
 *   GET    /api/quote-templates/{id}/          → Template por ID
 *   POST   /api/quote-templates/              → Crear template
 *   PATCH  /api/quote-templates/{id}/          → Actualizar template
 *   DELETE /api/quote-templates/{id}/          → Eliminar template
 *   POST   /api/quote-templates/{id}/use/      → Crear Quote desde template (incrementa usage)
 *   POST   /api/quote-templates/from-quote/    → Guardar Quote como template
 */

import apiClient from '@/core/api/client'
import type {
  QuoteTemplate,
  CreateQuoteTemplateDto,
  UpdateQuoteTemplateDto,
  Quote,
  CreateQuoteDto,
} from '@/core/contracts'

class QuoteTemplateServiceBackend {
  private readonly basePath = '/quote-templates'

  /**
   * Get all quote templates
   */
  async getAll(): Promise<QuoteTemplate[]> {
    const response = await apiClient.get<QuoteTemplate[]>(this.basePath)
    return response.data
  }

  /**
   * Get shared templates only (available to all users)
   */
  async getShared(): Promise<QuoteTemplate[]> {
    const response = await apiClient.get<QuoteTemplate[]>(
      this.basePath,
      { params: { shared: true } }
    )
    return response.data
  }

  /**
   * Get templates by owner
   */
  async getByOwner(ownerId: string): Promise<QuoteTemplate[]> {
    const response = await apiClient.get<QuoteTemplate[]>(
      this.basePath,
      { params: { owner: ownerId } }
    )
    return response.data
  }

  /**
   * Get template by ID
   */
  async getById(id: string): Promise<QuoteTemplate | null> {
    try {
      const response = await apiClient.get<QuoteTemplate>(
        `${this.basePath}/${id}`
      )
      return response.data
    } catch (error: any) {
      if (error.error?.code === 'NOT_FOUND') {
        return null
      }
      throw error
    }
  }

  /**
   * Create new template
   */
  async create(dto: CreateQuoteTemplateDto): Promise<QuoteTemplate> {
    const response = await apiClient.post<QuoteTemplate>(
      this.basePath,
      dto
    )
    return response.data
  }

  /**
   * Update existing template
   */
  async update(
    id: string,
    dto: UpdateQuoteTemplateDto
  ): Promise<QuoteTemplate | null> {
    try {
      const response = await apiClient.patch<QuoteTemplate>(
        `${this.basePath}/${id}`,
        dto
      )
      return response.data
    } catch (error: any) {
      if (error.error?.code === 'NOT_FOUND') {
        return null
      }
      throw error
    }
  }

  /**
   * Delete template
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
   * Create Quote from Template
   *
   * Backend crea el Quote + Lines en una transacción atómica
   * y devuelve el DTO para que el frontend siga el flujo normal.
   *
   * Si el backend no soporta este endpoint, el fallback es:
   * 1. GET template por ID (para obtener los datos)
   * 2. El frontend crea quote + lines por separado (flujo actual)
   */
  async createQuoteFromTemplate(
    templateId: string,
    overrides?: {
      name?: string
      description?: string
      customerid?: string
      customeridtype?: 'account' | 'contact'
      opportunityid?: string
      ownerid?: string
    }
  ): Promise<{ quote: CreateQuoteDto; templateLines: any[] }> {
    try {
      // Intenta usar el endpoint dedicado del backend
      const response = await apiClient.post<{
        quote: CreateQuoteDto
        templateLines: any[]
      }>(`${this.basePath}/${templateId}/use`, overrides || {})
      return response.data
    } catch (error: any) {
      // Fallback: obtener template y armar los datos manualmente
      // Esto permite funcionar aunque el backend no tenga el endpoint /use
      if (error.error?.code === 'NOT_FOUND' || error.response?.status === 404) {
        const template = await this.getById(templateId)
        if (!template) throw new Error('Template not found')

        const quoteDto: CreateQuoteDto = {
          name: overrides?.name || template.templatedata.name,
          description: overrides?.description || template.templatedata.description,
          customerid: overrides?.customerid!,
          customeridtype: overrides?.customeridtype!,
          opportunityid: overrides?.opportunityid,
          ownerid: overrides?.ownerid || template.ownerid,
          effectivefrom: template.templatedata.effectivefrom,
          effectiveto: template.templatedata.effectiveto,
        }

        return {
          quote: quoteDto,
          templateLines: template.templatedata.lines,
        }
      }
      throw error
    }
  }

  /**
   * Save Quote as Template
   *
   * Crea un template desde un Quote existente
   */
  async createFromQuote(
    quote: Quote,
    quoteLines: any[],
    templateData: {
      name: string
      description?: string
      category?: any
      isshared?: boolean
    }
  ): Promise<QuoteTemplate> {
    const response = await apiClient.post<QuoteTemplate>(
      `${this.basePath}/from-quote`,
      {
        quoteid: quote.quoteid,
        name: templateData.name,
        description: templateData.description,
        category: templateData.category,
        isshared: templateData.isshared ?? false,
        // Enviar las líneas para que el backend las almacene en templatedata
        lines: quoteLines.map((line) => ({
          productid: line.productid,
          productdescription: line.productdescription,
          quantity: line.quantity,
          priceperunit: line.priceperunit,
          manualdiscountamount: line.manualdiscountamount || 0,
          tax: line.tax || 0,
        })),
      }
    )
    return response.data
  }
}

/**
 * Instancia singleton del servicio de quote templates (backend)
 */
export const quoteTemplateServiceBackend = new QuoteTemplateServiceBackend()
