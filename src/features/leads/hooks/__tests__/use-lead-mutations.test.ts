import { renderHook, waitFor } from '@testing-library/react'
import { act } from 'react'
import { useLeadMutations } from '../use-lead-mutations'
import { leadService } from '../../api/lead-service'
import type { Lead, CreateLeadDto, UpdateLeadDto } from '@/core/contracts'
import { LeadSourceCode, LeadQualityCode, LeadStateCode, LeadStatusCode } from '@/core/contracts/enums'

// Mock leadService
vi.mock('../../api/lead-service', () => ({
  leadService: {
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    disqualify: vi.fn(),
  },
}))

describe('useLeadMutations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createLead', () => {
    it('should create lead successfully', async () => {
      const mockLead: Lead = {
        leadid: 'lead-123',
        firstname: 'John',
        lastname: 'Doe',
        companyname: 'Acme Corp',
        emailaddress1: 'john@acme.com',
        leadsourcecode: LeadSourceCode.Web,
        leadqualitycode: LeadQualityCode.Cold,
        statecode: LeadStateCode.Open,
        statuscode: LeadStatusCode.New,
        createdon: new Date().toISOString(),
        modifiedon: new Date().toISOString(),
      }

      const createDto: CreateLeadDto = {
        firstname: 'John',
        lastname: 'Doe',
        companyname: 'Acme Corp',
        emailaddress1: 'john@acme.com',
        leadsourcecode: LeadSourceCode.Web,
      }

      vi.mocked(leadService.create).mockResolvedValue(mockLead)

      const { result } = renderHook(() => useLeadMutations())

      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe(null)

      let createdLead: Lead | undefined

      await act(async () => {
        createdLead = await result.current.createLead(createDto)
      })

      expect(createdLead).toEqual(mockLead)
      expect(leadService.create).toHaveBeenCalledWith(createDto)
      expect(leadService.create).toHaveBeenCalledTimes(1)
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe(null)
    })

    it('should handle creation error', async () => {
      const errorMessage = 'Email is required'
      vi.mocked(leadService.create).mockRejectedValue(new Error(errorMessage))

      const { result } = renderHook(() => useLeadMutations())

      try {
        await act(async () => {
          await result.current.createLead({
            firstname: 'John',
            lastname: 'Doe',
          })
        })
      } catch (error: any) {
        expect(error.message).toBe(errorMessage)
      }

      expect(leadService.create).toHaveBeenCalledTimes(1)
    })

    it('should handle generic creation error', async () => {
      vi.mocked(leadService.create).mockRejectedValue('Unknown error')

      const { result } = renderHook(() => useLeadMutations())

      try {
        await act(async () => {
          await result.current.createLead({
            firstname: 'John',
            lastname: 'Doe',
          })
        })
      } catch (error: any) {
        expect(error.message).toBe('Error creating lead')
      }

      expect(leadService.create).toHaveBeenCalledTimes(1)
    })
  })

  describe('updateLead', () => {
    it('should update lead successfully', async () => {
      const mockLead: Lead = {
        leadid: 'lead-123',
        firstname: 'Jane',
        lastname: 'Smith',
        companyname: 'Updated Corp',
        statecode: LeadStateCode.Open,
        statuscode: LeadStatusCode.New,
        createdon: new Date().toISOString(),
        modifiedon: new Date().toISOString(),
      }

      const updateDto: UpdateLeadDto = {
        firstname: 'Jane',
        companyname: 'Updated Corp',
      }

      vi.mocked(leadService.update).mockResolvedValue(mockLead)

      const { result } = renderHook(() => useLeadMutations())

      let updatedLead: Lead | undefined

      await act(async () => {
        updatedLead = await result.current.updateLead('lead-123', updateDto)
      })

      expect(updatedLead).toEqual(mockLead)
      expect(leadService.update).toHaveBeenCalledWith('lead-123', updateDto)
      expect(result.current.error).toBe(null)
    })

    it('should handle lead not found on update', async () => {
      vi.mocked(leadService.update).mockResolvedValue(null)

      const { result } = renderHook(() => useLeadMutations())

      try {
        await act(async () => {
          await result.current.updateLead('lead-999', { firstname: 'Test' })
        })
      } catch (error: any) {
        expect(error.message).toBe('Lead not found')
      }

      expect(leadService.update).toHaveBeenCalledTimes(1)
    })

    it('should handle validation errors with details', async () => {
      const validationError = {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: {
            emailaddress1: ['Email is required', 'Email is invalid'],
            firstname: ['First name is required'],
          },
        },
      }

      vi.mocked(leadService.update).mockRejectedValue(validationError)

      const { result } = renderHook(() => useLeadMutations())

      try {
        await act(async () => {
          await result.current.updateLead('lead-123', { firstname: '' })
        })
      } catch (error: any) {
        expect(error.message).toContain('Validation failed')
        expect(error.message).toContain('emailaddress1')
      }

      expect(leadService.update).toHaveBeenCalledTimes(1)
    })

    it('should handle API error without details', async () => {
      const apiError = {
        error: {
          code: 'SERVER_ERROR',
          message: 'Internal server error',
          details: null,
        },
      }

      vi.mocked(leadService.update).mockRejectedValue(apiError)

      const { result } = renderHook(() => useLeadMutations())

      try {
        await act(async () => {
          await result.current.updateLead('lead-123', { firstname: 'Test' })
        })
      } catch (error: any) {
        expect(error.message).toBe('Internal server error')
      }

      expect(leadService.update).toHaveBeenCalledTimes(1)
    })

    it('should handle generic update error', async () => {
      vi.mocked(leadService.update).mockRejectedValue('Unknown error')

      const { result } = renderHook(() => useLeadMutations())

      try {
        await act(async () => {
          await result.current.updateLead('lead-123', { firstname: 'Test' })
        })
      } catch (error: any) {
        expect(error.message).toBe('Error updating lead')
      }

      expect(leadService.update).toHaveBeenCalledTimes(1)
    })
  })

  describe('deleteLead', () => {
    it('should delete lead successfully', async () => {
      vi.mocked(leadService.delete).mockResolvedValue(true)

      const { result } = renderHook(() => useLeadMutations())

      let success: boolean | undefined

      await act(async () => {
        success = await result.current.deleteLead('lead-123')
      })

      expect(success).toBe(true)
      expect(leadService.delete).toHaveBeenCalledWith('lead-123')
      expect(result.current.error).toBe(null)
    })

    it('should handle lead not found on delete', async () => {
      vi.mocked(leadService.delete).mockResolvedValue(false)

      const { result } = renderHook(() => useLeadMutations())

      try {
        await act(async () => {
          await result.current.deleteLead('lead-999')
        })
      } catch (error: any) {
        expect(error.message).toBe('Lead not found')
      }

      expect(leadService.delete).toHaveBeenCalledTimes(1)
    })

    it('should handle deletion error', async () => {
      const errorMessage = 'Permission denied'
      vi.mocked(leadService.delete).mockRejectedValue(new Error(errorMessage))

      const { result } = renderHook(() => useLeadMutations())

      try {
        await act(async () => {
          await result.current.deleteLead('lead-123')
        })
      } catch (error: any) {
        expect(error.message).toBe(errorMessage)
      }

      expect(leadService.delete).toHaveBeenCalledTimes(1)
    })

    it('should handle generic deletion error', async () => {
      vi.mocked(leadService.delete).mockRejectedValue('Unknown error')

      const { result } = renderHook(() => useLeadMutations())

      try {
        await act(async () => {
          await result.current.deleteLead('lead-123')
        })
      } catch (error: any) {
        expect(error.message).toBe('Error deleting lead')
      }

      expect(leadService.delete).toHaveBeenCalledTimes(1)
    })
  })

  describe('disqualifyLead', () => {
    it('should disqualify lead successfully', async () => {
      const mockDisqualifiedLead: Lead = {
        leadid: 'lead-123',
        firstname: 'John',
        lastname: 'Doe',
        statecode: LeadStateCode.Disqualified,
        statuscode: LeadStatusCode.Disqualified,
        createdon: new Date().toISOString(),
        modifiedon: new Date().toISOString(),
      }

      vi.mocked(leadService.disqualify).mockResolvedValue(mockDisqualifiedLead)

      const { result } = renderHook(() => useLeadMutations())

      let disqualifiedLead: Lead | undefined

      await act(async () => {
        disqualifiedLead = await result.current.disqualifyLead('lead-123')
      })

      expect(disqualifiedLead).toEqual(mockDisqualifiedLead)
      expect(leadService.disqualify).toHaveBeenCalledWith('lead-123')
      expect(result.current.error).toBe(null)
    })

    it('should handle lead not found on disqualify', async () => {
      vi.mocked(leadService.disqualify).mockResolvedValue(null)

      const { result } = renderHook(() => useLeadMutations())

      try {
        await act(async () => {
          await result.current.disqualifyLead('lead-999')
        })
      } catch (error: any) {
        expect(error.message).toBe('Lead not found')
      }

      expect(leadService.disqualify).toHaveBeenCalledTimes(1)
    })

    it('should handle disqualification error', async () => {
      const errorMessage = 'Cannot disqualify qualified lead'
      vi.mocked(leadService.disqualify).mockRejectedValue(new Error(errorMessage))

      const { result } = renderHook(() => useLeadMutations())

      try {
        await act(async () => {
          await result.current.disqualifyLead('lead-123')
        })
      } catch (error: any) {
        expect(error.message).toBe(errorMessage)
      }

      expect(leadService.disqualify).toHaveBeenCalledTimes(1)
    })

    it('should handle generic disqualification error', async () => {
      vi.mocked(leadService.disqualify).mockRejectedValue('Unknown error')

      const { result } = renderHook(() => useLeadMutations())

      try {
        await act(async () => {
          await result.current.disqualifyLead('lead-123')
        })
      } catch (error: any) {
        expect(error.message).toBe('Error disqualifying lead')
      }

      expect(leadService.disqualify).toHaveBeenCalledTimes(1)
    })
  })

  describe('State management', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useLeadMutations())

      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe(null)
      expect(typeof result.current.createLead).toBe('function')
      expect(typeof result.current.updateLead).toBe('function')
      expect(typeof result.current.deleteLead).toBe('function')
      expect(typeof result.current.disqualifyLead).toBe('function')
    })

    it('should reset error on new operation', async () => {
      const mockLead: Lead = {
        leadid: 'lead-123',
        firstname: 'John',
        lastname: 'Doe',
        statecode: LeadStateCode.Open,
        statuscode: LeadStatusCode.New,
        createdon: new Date().toISOString(),
        modifiedon: new Date().toISOString(),
      }

      vi.mocked(leadService.create)
        .mockRejectedValueOnce(new Error('First error'))
        .mockResolvedValueOnce(mockLead)

      const { result } = renderHook(() => useLeadMutations())

      // First operation - fails
      try {
        await act(async () => {
          await result.current.createLead({ firstname: 'John', lastname: 'Doe' })
        })
      } catch (error) {
        // Error expected
      }

      // Second operation - succeeds
      let createdLead: Lead | undefined
      await act(async () => {
        createdLead = await result.current.createLead({ firstname: 'John', lastname: 'Doe' })
      })

      expect(createdLead).toEqual(mockLead)
      expect(result.current.error).toBe(null) // Error should be reset
      expect(leadService.create).toHaveBeenCalledTimes(2)
    })
  })
})
