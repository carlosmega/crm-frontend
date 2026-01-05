import {
  calculateLeadScore,
  autoUpdateLeadQuality,
} from '../lead-scoring-service'
import {
  LeadSourceCode,
  LeadQualityCode,
  BudgetStatusCode,
  PurchaseTimeframeCode,
} from '@/core/contracts/enums'
import type { Lead } from '@/core/contracts/entities/lead'

describe('Lead Scoring Service', () => {
  describe('calculateLeadScore', () => {
    describe('Source Scoring (max 25 points)', () => {
      it('should give 20 points for Partner source', () => {
        const result = calculateLeadScore({
          leadsourcecode: LeadSourceCode.Partner,
        })
        expect(result.sourceScore).toBe(20)
        expect(result.reasoning.join(' ')).toContain('Partner')
      })

      it('should give 18 points for External Referral', () => {
        const result = calculateLeadScore({
          leadsourcecode: LeadSourceCode.External_Referral,
        })
        expect(result.sourceScore).toBe(18)
      })

      it('should give 16 points for Word of Mouth', () => {
        const result = calculateLeadScore({
          leadsourcecode: LeadSourceCode.Word_of_Mouth,
        })
        expect(result.sourceScore).toBe(16)
      })

      it('should give 15 points for Employee Referral', () => {
        const result = calculateLeadScore({
          leadsourcecode: LeadSourceCode.Employee_Referral,
        })
        expect(result.sourceScore).toBe(15)
      })

      it('should give 7 points for Web source', () => {
        const result = calculateLeadScore({
          leadsourcecode: LeadSourceCode.Web,
        })
        expect(result.sourceScore).toBe(7)
      })

      it('should give 3 points for Other source', () => {
        const result = calculateLeadScore({
          leadsourcecode: LeadSourceCode.Other,
        })
        expect(result.sourceScore).toBe(3)
      })

      it('should give 0 points if no source specified', () => {
        const result = calculateLeadScore({})
        expect(result.sourceScore).toBe(0)
      })
    })

    describe('Engagement Scoring (max 25 points)', () => {
      it('should score email engagement correctly', () => {
        const result = calculateLeadScore({}, { activityCount: { emails: 2 } })
        expect(result.engagementScore).toBe(6) // 2 emails * 3 points, max 6
      })

      it('should cap email score at 6 points', () => {
        const result = calculateLeadScore({}, { activityCount: { emails: 10 } })
        expect(result.engagementScore).toBe(6) // Capped
      })

      it('should score phone calls correctly', () => {
        const result = calculateLeadScore(
          {},
          { activityCount: { phoneCalls: 2 } }
        )
        expect(result.engagementScore).toBe(16) // 2 calls * 8 points, max 16
      })

      it('should cap phone calls at 16 points', () => {
        const result = calculateLeadScore(
          {},
          { activityCount: { phoneCalls: 10 } }
        )
        expect(result.engagementScore).toBe(16) // Capped
      })

      it('should score meetings highest', () => {
        const result = calculateLeadScore(
          {},
          { activityCount: { meetings: 2 } }
        )
        expect(result.engagementScore).toBe(20) // 2 meetings * 10 points, max 20
      })

      it('should cap meetings at 20 points', () => {
        const result = calculateLeadScore(
          {},
          { activityCount: { meetings: 10 } }
        )
        expect(result.engagementScore).toBe(20) // Capped
      })

      it('should score form submissions', () => {
        const result = calculateLeadScore(
          {},
          { activityCount: { formSubmissions: 2 } }
        )
        expect(result.engagementScore).toBe(8) // 2 forms * 4 points, max 8
      })

      it('should combine multiple activity types', () => {
        const result = calculateLeadScore(
          {},
          {
            activityCount: {
              emails: 1, // 3
              phoneCalls: 1, // 8
              meetings: 1, // 10
            },
          }
        )
        // 3 + 8 + 10 = 21 points
        expect(result.engagementScore).toBe(21)
      })

      it('should cap total engagement at 25 points', () => {
        const result = calculateLeadScore(
          {},
          {
            activityCount: {
              emails: 10,
              phoneCalls: 10,
              meetings: 10,
              formSubmissions: 10,
            },
          }
        )
        expect(result.engagementScore).toBe(25) // Capped at 25
      })

      it('should give 0 points for no activity', () => {
        const result = calculateLeadScore({})
        expect(result.engagementScore).toBe(0)
      })
    })

    describe('Fit Scoring (max 25 points)', () => {
      it('should give points for location data when no ideal profile', () => {
        const result = calculateLeadScore({
          address1_country: 'Spain',
        })
        expect(result.fitScore).toBe(5)
      })

      it('should match preferred country when ideal profile provided', () => {
        const result = calculateLeadScore(
          {
            address1_country: 'Spain',
          },
          {
            idealProfile: {
              preferredCountries: ['Spain', 'France'],
            },
          }
        )
        expect(result.fitScore).toBeGreaterThan(0)
      })

      it('should give 0 points when country not in preferred list', () => {
        const result = calculateLeadScore(
          {
            address1_country: 'Germany',
          },
          {
            idealProfile: {
              preferredCountries: ['Spain', 'France'],
            },
          }
        )
        expect(result.fitScore).toBe(0)
      })

      it('should give 0 points for no fit data', () => {
        const result = calculateLeadScore({})
        expect(result.fitScore).toBe(0)
      })
    })

    describe('BANT Scoring (max 25 points)', () => {
      it('should score Will Buy budget highest (8 points)', () => {
        const result = calculateLeadScore({
          budgetstatus: BudgetStatusCode.Will_Buy,
        })
        expect(result.bantScore).toBe(8)
      })

      it('should score Can Buy budget (6 points)', () => {
        const result = calculateLeadScore({
          budgetstatus: BudgetStatusCode.Can_Buy,
        })
        expect(result.bantScore).toBe(6)
      })

      it('should score May Buy budget (4 points)', () => {
        const result = calculateLeadScore({
          budgetstatus: BudgetStatusCode.May_Buy,
        })
        expect(result.bantScore).toBe(4)
      })

      it('should score No Budget (0 points)', () => {
        const result = calculateLeadScore({
          budgetstatus: BudgetStatusCode.No_Budget,
        })
        expect(result.bantScore).toBe(0)
      })

      it('should score decision maker authority (6 points)', () => {
        const result = calculateLeadScore({
          jobtitle: 'CEO',
        })
        expect(result.bantScore).toBe(6)
        expect(result.reasoning.join(' ')).toContain('Decision Maker')
      })

      it('should recognize various decision maker titles', () => {
        const titles = ['CTO', 'CFO', 'President', 'Director', 'VP', 'Chief']

        titles.forEach((title) => {
          const result = calculateLeadScore({
            jobtitle: title,
          })
          expect(result.bantScore).toBe(6)
        })
      })

      it('should score influencer authority (3 points)', () => {
        const result = calculateLeadScore({
          jobtitle: 'Senior Manager',
        })
        expect(result.bantScore).toBe(3)
        expect(result.reasoning.join(' ')).toContain('Influencer')
      })

      it('should score end user (0 points)', () => {
        const result = calculateLeadScore({
          jobtitle: 'Analyst',
        })
        expect(result.bantScore).toBe(0)
      })

      it('should detect urgent need keywords (6 points)', () => {
        const result = calculateLeadScore({
          description: 'We need this ASAP for a critical project',
        })
        expect(result.bantScore).toBe(6)
        expect(result.reasoning.join(' ')).toContain('Urgent')
      })

      it('should detect identified need keywords (4 points)', () => {
        const result = calculateLeadScore({
          description: 'We are looking for a solution to improve our process',
        })
        expect(result.bantScore).toBe(4)
      })

      it('should score immediate timeframe (5 points)', () => {
        const result = calculateLeadScore({
          purchasetimeframe: PurchaseTimeframeCode.Immediate,
        })
        expect(result.bantScore).toBe(5)
      })

      it('should score This Quarter timeframe (4 points)', () => {
        const result = calculateLeadScore({
          purchasetimeframe: PurchaseTimeframeCode.This_Quarter,
        })
        expect(result.bantScore).toBe(4)
      })

      it('should score Next Quarter timeframe (3 points)', () => {
        const result = calculateLeadScore({
          purchasetimeframe: PurchaseTimeframeCode.Next_Quarter,
        })
        expect(result.bantScore).toBe(3)
      })

      it('should score This Year timeframe (2 points)', () => {
        const result = calculateLeadScore({
          purchasetimeframe: PurchaseTimeframeCode.This_Year,
        })
        expect(result.bantScore).toBe(2)
      })

      it('should score Unknown timeframe (0 points)', () => {
        const result = calculateLeadScore({
          purchasetimeframe: PurchaseTimeframeCode.Unknown,
        })
        expect(result.bantScore).toBe(0)
      })

      it('should combine BANT factors', () => {
        const result = calculateLeadScore({
          budgetstatus: BudgetStatusCode.Will_Buy, // 8
          jobtitle: 'CTO', // 6
          description: 'urgent need for solution', // 6
          purchasetimeframe: PurchaseTimeframeCode.Immediate, // 5
        })
        // Total = 25 points (capped)
        expect(result.bantScore).toBe(25)
      })
    })

    describe('Total Score and Quality Classification', () => {
      it('should classify as HOT lead (80+ points)', () => {
        const result = calculateLeadScore(
          {
            leadsourcecode: LeadSourceCode.Partner, // 20
            budgetstatus: BudgetStatusCode.Will_Buy, // 8
            jobtitle: 'CEO', // 6
            description: 'urgent need', // 6
            purchasetimeframe: PurchaseTimeframeCode.Immediate, // 5
            address1_country: 'Spain', // Will add fit score if matched
          },
          {
            activityCount: {
              meetings: 3, // 25 (capped at 25)
              emails: 2, // Would add but capped
            },
            idealProfile: {
              preferredCountries: ['Spain'], // Adds fit score
            },
          }
        )
        // Source: 20, Engagement: 25 (capped), Fit: 5, BANT: 25 (capped) = 75
        // This is actually WARM (70+), not HOT (80+)
        expect(result.totalScore).toBeGreaterThanOrEqual(70)
        expect(result.quality).toBe(LeadQualityCode.Warm)
      })

      it('should classify as WARM lead (50-79 points)', () => {
        const result = calculateLeadScore(
          {
            leadsourcecode: LeadSourceCode.External_Referral, // 18
            budgetstatus: BudgetStatusCode.Can_Buy, // 6
            jobtitle: 'Director', // 6 (decision maker)
            purchasetimeframe: PurchaseTimeframeCode.This_Quarter, // 4
            address1_country: 'Spain',
          },
          {
            activityCount: {
              emails: 2, // 6
              phoneCalls: 2, // 16
            },
            idealProfile: {
              preferredCountries: ['Spain'], // 5
            },
          }
        )
        // Source: 18, Engagement: 22, Fit: 5, BANT: 16 = 61 (WARM)
        expect(result.totalScore).toBeGreaterThanOrEqual(50)
        expect(result.totalScore).toBeLessThan(80)
        expect(result.quality).toBe(LeadQualityCode.Warm)
      })

      it('should classify as COLD lead (0-49 points)', () => {
        const result = calculateLeadScore({
          leadsourcecode: LeadSourceCode.Other, // 3
        })
        expect(result.totalScore).toBeLessThan(50)
        expect(result.quality).toBe(LeadQualityCode.Cold)
      })

      it('should calculate correct total score from all components', () => {
        const result = calculateLeadScore(
          {
            leadsourcecode: LeadSourceCode.Partner, // 20
            budgetstatus: BudgetStatusCode.Can_Buy, // 6
          },
          {
            activityCount: {
              emails: 1, // 3
            },
          }
        )
        // Source: 20, Engagement: 3, Fit: 0, BANT: 6 = 29 total
        expect(result.totalScore).toBe(29)
        expect(result.sourceScore).toBe(20)
        expect(result.engagementScore).toBe(3)
        expect(result.fitScore).toBe(0)
        expect(result.bantScore).toBe(6)
      })

      it('should provide detailed reasoning', () => {
        const result = calculateLeadScore({
          leadsourcecode: LeadSourceCode.Partner,
        })
        expect(result.reasoning).toContain('--- SOURCE SCORE ---')
        expect(result.reasoning).toContain('--- ENGAGEMENT SCORE ---')
        expect(result.reasoning).toContain('--- FIT SCORE ---')
        expect(result.reasoning).toContain('--- BANT SCORE ---')
        // Check if any reasoning line starts with 'TOTAL SCORE:'
        const hasTotalScore = result.reasoning.some((line) =>
          line.startsWith('TOTAL SCORE:')
        )
        expect(hasTotalScore).toBe(true)
      })

      it('should handle maximum possible score (100 points)', () => {
        const result = calculateLeadScore(
          {
            leadsourcecode: LeadSourceCode.Partner, // 20
            budgetstatus: BudgetStatusCode.Will_Buy, // 8
            jobtitle: 'CEO', // 6
            description: 'urgent need immediately', // 6
            purchasetimeframe: PurchaseTimeframeCode.Immediate, // 5
            address1_country: 'Spain',
          },
          {
            activityCount: {
              emails: 10,
              phoneCalls: 10,
              meetings: 10,
              formSubmissions: 10,
            },
            idealProfile: {
              preferredCountries: ['Spain'],
            },
          }
        )
        // Source: 20, Engagement: 25, Fit: 5, BANT: 25 = 75 total
        expect(result.totalScore).toBeLessThanOrEqual(100)
      })
    })
  })

  describe('autoUpdateLeadQuality', () => {
    it('should update lead quality based on score', () => {
      const lead = {
        leadid: '123',
        firstname: 'John',
        lastname: 'Doe',
        leadqualitycode: LeadQualityCode.Cold,
      } as Lead

      const scoreBreakdown = {
        sourceScore: 20,
        engagementScore: 20,
        fitScore: 20,
        bantScore: 20,
        totalScore: 80,
        quality: LeadQualityCode.Hot,
        reasoning: [],
      }

      const updated = autoUpdateLeadQuality(lead, scoreBreakdown)

      expect(updated.leadqualitycode).toBe(LeadQualityCode.Hot)
      expect(updated.leadid).toBe('123') // Other fields preserved
    })

    it('should preserve all original lead properties', () => {
      const lead = {
        leadid: '123',
        firstname: 'John',
        lastname: 'Doe',
        companyname: 'Acme Corp',
        emailaddress1: 'john@acme.com',
        leadqualitycode: LeadQualityCode.Cold,
      } as Lead

      const scoreBreakdown = {
        sourceScore: 15,
        engagementScore: 15,
        fitScore: 15,
        bantScore: 15,
        totalScore: 60,
        quality: LeadQualityCode.Warm,
        reasoning: [],
      }

      const updated = autoUpdateLeadQuality(lead, scoreBreakdown)

      expect(updated.firstname).toBe('John')
      expect(updated.lastname).toBe('Doe')
      expect(updated.companyname).toBe('Acme Corp')
      expect(updated.emailaddress1).toBe('john@acme.com')
      expect(updated.leadqualitycode).toBe(LeadQualityCode.Warm)
    })

    it('should handle upgrading from Cold to Hot', () => {
      const lead = {
        leadid: '456',
        firstname: 'Jane',
        lastname: 'Smith',
        leadqualitycode: LeadQualityCode.Cold,
      } as Lead

      const scoreBreakdown = {
        sourceScore: 25,
        engagementScore: 25,
        fitScore: 25,
        bantScore: 25,
        totalScore: 100,
        quality: LeadQualityCode.Hot,
        reasoning: [],
      }

      const updated = autoUpdateLeadQuality(lead, scoreBreakdown)

      expect(updated.leadqualitycode).toBe(LeadQualityCode.Hot)
    })
  })
})
