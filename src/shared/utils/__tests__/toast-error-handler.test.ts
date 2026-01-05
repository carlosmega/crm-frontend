import { showErrorToast, handleApiError } from '../toast-error-handler'
import type { ApiErrorResponse } from '@/core/contracts/api/api-response'
import { toast } from 'sonner'

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

describe('Toast Error Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('showErrorToast', () => {
    it('should show error toast with message', () => {
      const error: ApiErrorResponse = {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Error de validación',
          details: null,
        },
      }

      showErrorToast(error)

      expect(toast.error).toHaveBeenCalledWith('Error de validación')
      expect(toast.error).toHaveBeenCalledTimes(1)
    })

    it('should show default message when no message provided', () => {
      const error: ApiErrorResponse = {
        error: {
          code: 'UNKNOWN',
          message: '',
          details: null,
        },
      }

      showErrorToast(error)

      expect(toast.error).toHaveBeenCalledWith('Ha ocurrido un error')
    })

    it('should show field validation errors', () => {
      const error: ApiErrorResponse = {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Datos inválidos',
          details: {
            emailaddress1: ['Email es requerido', 'Email inválido'],
            firstname: ['Nombre es requerido'],
          },
        },
      }

      showErrorToast(error)

      // Main error
      expect(toast.error).toHaveBeenCalledWith('Datos inválidos')

      // Field errors with formatted names
      expect(toast.error).toHaveBeenCalledWith('Email: Email es requerido')
      expect(toast.error).toHaveBeenCalledWith('Email: Email inválido')
      expect(toast.error).toHaveBeenCalledWith('Nombre: Nombre es requerido')

      // Total: 1 main + 3 field errors
      expect(toast.error).toHaveBeenCalledTimes(4)
    })

    it('should handle empty details object', () => {
      const error: ApiErrorResponse = {
        error: {
          code: 'ERROR',
          message: 'Error general',
          details: {},
        },
      }

      showErrorToast(error)

      expect(toast.error).toHaveBeenCalledWith('Error general')
      expect(toast.error).toHaveBeenCalledTimes(1)
    })

    it('should format multiple field names correctly', () => {
      const error: ApiErrorResponse = {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validación fallida',
          details: {
            emailaddress1: ['Error de email'],
            telephone1: ['Error de teléfono'],
            companyname: ['Error de empresa'],
            estimatedvalue: ['Error de valor'],
          },
        },
      }

      showErrorToast(error)

      expect(toast.error).toHaveBeenCalledWith('Email: Error de email')
      expect(toast.error).toHaveBeenCalledWith('Teléfono: Error de teléfono')
      expect(toast.error).toHaveBeenCalledWith('Empresa: Error de empresa')
      expect(toast.error).toHaveBeenCalledWith('Valor estimado: Error de valor')
    })

    it('should format camelCase field names when not in map', () => {
      const error: ApiErrorResponse = {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Error',
          details: {
            customField: ['Error personalizado'],
            anotherCustomField: ['Otro error'],
          },
        },
      }

      showErrorToast(error)

      // Should format camelCase to readable text
      expect(toast.error).toHaveBeenCalledWith('Custom Field: Error personalizado')
      expect(toast.error).toHaveBeenCalledWith('Another Custom Field: Otro error')
    })

    it('should handle non-array details', () => {
      const error: ApiErrorResponse = {
        error: {
          code: 'ERROR',
          message: 'Error',
          details: {
            field: 'not an array', // Should be ignored
          },
        },
      }

      showErrorToast(error)

      // Only main error shown
      expect(toast.error).toHaveBeenCalledWith('Error')
      expect(toast.error).toHaveBeenCalledTimes(1)
    })
  })

  describe('handleApiError', () => {
    it('should execute operation successfully', async () => {
      const operation = vi.fn().mockResolvedValue({ id: '123', name: 'Test' })

      const result = await handleApiError(operation)

      expect(result).toEqual({ id: '123', name: 'Test' })
      expect(operation).toHaveBeenCalled()
      expect(toast.error).not.toHaveBeenCalled()
    })

    it('should handle error and show toast', async () => {
      const operation = vi.fn().mockRejectedValue({
        error: {
          code: 'ERROR',
          message: 'Operación fallida',
          details: null,
        },
      } as ApiErrorResponse)

      const result = await handleApiError(operation)

      expect(result).toBe(null)
      expect(toast.error).toHaveBeenCalledWith('Operación fallida')
    })

    it('should use custom error message when provided', async () => {
      const operation = vi.fn().mockRejectedValue({
        error: {
          code: 'ERROR',
          message: 'Error del API',
          details: null,
        },
      } as ApiErrorResponse)

      const result = await handleApiError(operation, 'Error personalizado')

      expect(result).toBe(null)
      expect(toast.error).toHaveBeenCalledWith('Error personalizado')
      expect(toast.error).toHaveBeenCalledTimes(1)
    })

    it('should show validation errors when no custom message', async () => {
      const operation = vi.fn().mockRejectedValue({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validación fallida',
          details: {
            emailaddress1: ['Email inválido'],
          },
        },
      } as ApiErrorResponse)

      const result = await handleApiError(operation)

      expect(result).toBe(null)
      expect(toast.error).toHaveBeenCalledWith('Validación fallida')
      expect(toast.error).toHaveBeenCalledWith('Email: Email inválido')
      expect(toast.error).toHaveBeenCalledTimes(2)
    })

    it('should return null on error', async () => {
      const operation = vi.fn().mockRejectedValue({
        error: {
          code: 'SERVER_ERROR',
          message: 'Error del servidor',
          details: null,
        },
      } as ApiErrorResponse)

      const result = await handleApiError(operation)

      expect(result).toBe(null)
    })

    it('should handle async operations with complex return types', async () => {
      const complexObject = {
        id: '123',
        name: 'Test',
        nested: {
          value: 42,
          array: [1, 2, 3],
        },
      }

      const operation = vi.fn().mockResolvedValue(complexObject)

      const result = await handleApiError(operation)

      expect(result).toEqual(complexObject)
    })
  })

  describe('Field name formatting edge cases', () => {
    it('should format all CDS field names correctly', () => {
      const error: ApiErrorResponse = {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Error',
          details: {
            emailaddress1: ['Error'],
            emailaddress2: ['Error'],
            emailaddress3: ['Error'],
            firstname: ['Error'],
            lastname: ['Error'],
            telephone1: ['Error'],
            telephone2: ['Error'],
            mobilephone: ['Error'],
            jobtitle: ['Error'],
            parentcustomerid: ['Error'],
            address1_line1: ['Error'],
            address1_city: ['Error'],
            address1_stateorprovince: ['Error'],
            address1_postalcode: ['Error'],
            address1_country: ['Error'],
            companyname: ['Error'],
            websiteurl: ['Error'],
            name: ['Error'],
            subject: ['Error'],
            estimatedvalue: ['Error'],
            estimatedclosedate: ['Error'],
            actualrevenue: ['Error'],
            actualclosedate: ['Error'],
            closeprobability: ['Error'],
            description: ['Error'],
          },
        },
      }

      showErrorToast(error)

      // Verify all field names are formatted
      expect(toast.error).toHaveBeenCalledWith('Email: Error')
      expect(toast.error).toHaveBeenCalledWith('Email alternativo: Error')
      expect(toast.error).toHaveBeenCalledWith('Email adicional: Error')
      expect(toast.error).toHaveBeenCalledWith('Nombre: Error')
      expect(toast.error).toHaveBeenCalledWith('Apellido: Error')
      expect(toast.error).toHaveBeenCalledWith('Teléfono: Error')
      expect(toast.error).toHaveBeenCalledWith('Teléfono alternativo: Error')
      expect(toast.error).toHaveBeenCalledWith('Teléfono móvil: Error')
      expect(toast.error).toHaveBeenCalledWith('Cargo: Error')
      expect(toast.error).toHaveBeenCalledWith('Cuenta: Error')
      expect(toast.error).toHaveBeenCalledWith('Dirección: Error')
      expect(toast.error).toHaveBeenCalledWith('Ciudad: Error')
      expect(toast.error).toHaveBeenCalledWith('Estado/Provincia: Error')
      expect(toast.error).toHaveBeenCalledWith('Código postal: Error')
      expect(toast.error).toHaveBeenCalledWith('País: Error')
      expect(toast.error).toHaveBeenCalledWith('Empresa: Error')
      expect(toast.error).toHaveBeenCalledWith('Sitio web: Error')
      expect(toast.error).toHaveBeenCalledWith('Nombre: Error') // name field (duplicate check)
      expect(toast.error).toHaveBeenCalledWith('Asunto: Error')
      expect(toast.error).toHaveBeenCalledWith('Valor estimado: Error')
      expect(toast.error).toHaveBeenCalledWith('Fecha estimada de cierre: Error')
      expect(toast.error).toHaveBeenCalledWith('Ingresos reales: Error')
      expect(toast.error).toHaveBeenCalledWith('Fecha real de cierre: Error')
      expect(toast.error).toHaveBeenCalledWith('Probabilidad de cierre: Error')
      expect(toast.error).toHaveBeenCalledWith('Descripción: Error')

      // 1 main message + 25 field errors
      expect(toast.error).toHaveBeenCalledTimes(26)
    })
  })

  describe('CamelCase formatting', () => {
    it('should format camelCase with single uppercase letter', () => {
      const error: ApiErrorResponse = {
        error: {
          code: 'ERROR',
          message: 'Error',
          details: {
            userId: ['Error'],
          },
        },
      }

      showErrorToast(error)

      expect(toast.error).toHaveBeenCalledWith('User Id: Error')
    })

    it('should format camelCase with multiple uppercase letters', () => {
      const error: ApiErrorResponse = {
        error: {
          code: 'ERROR',
          message: 'Error',
          details: {
            customerFirstName: ['Error'],
          },
        },
      }

      showErrorToast(error)

      expect(toast.error).toHaveBeenCalledWith('Customer First Name: Error')
    })

    it('should handle already capitalized first letter', () => {
      const error: ApiErrorResponse = {
        error: {
          code: 'ERROR',
          message: 'Error',
          details: {
            CustomField: ['Error'],
          },
        },
      }

      showErrorToast(error)

      expect(toast.error).toHaveBeenCalledWith('Custom Field: Error')
    })

    it('should handle single word in lowercase', () => {
      const error: ApiErrorResponse = {
        error: {
          code: 'ERROR',
          message: 'Error',
          details: {
            field: ['Error'],
          },
        },
      }

      showErrorToast(error)

      expect(toast.error).toHaveBeenCalledWith('Field: Error')
    })
  })
})
