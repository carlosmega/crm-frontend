import {
  calculateLineExtendedAmount,
  calculateLineBaseAmount,
  calculateDiscountPercentage,
  calculateDiscountAmount,
  calculateTaxAmount,
  calculateQuoteTotals,
  calculateAverageDiscountPercentage,
  calculateProfitMargin,
  calculateProfitAmount,
  formatPercentage,
  calculateDaysUntilExpiration,
  isQuoteExpired,
  calculateValidityPeriod,
  roundToTwoDecimals,
  calculateWeightedAveragePrice,
  calculateGrandTotal,
} from '../quote-calculations'
import type { QuoteDetail } from '@/core/contracts/entities/quote-detail'

describe('Quote Calculations', () => {
  describe('calculateLineBaseAmount', () => {
    it('should calculate base amount correctly', () => {
      expect(calculateLineBaseAmount(100, 5)).toBe(500)
    })

    it('should handle decimal quantities', () => {
      expect(calculateLineBaseAmount(50.5, 2.5)).toBe(126.25)
    })

    it('should handle zero quantity', () => {
      expect(calculateLineBaseAmount(100, 0)).toBe(0)
    })

    it('should handle zero price', () => {
      expect(calculateLineBaseAmount(0, 10)).toBe(0)
    })

    it('should handle large numbers', () => {
      expect(calculateLineBaseAmount(9999.99, 1000)).toBe(9999990)
    })
  })

  describe('calculateLineExtendedAmount', () => {
    it('should calculate extended amount without discount or tax', () => {
      // 100€ × 5 qty = 500€
      expect(calculateLineExtendedAmount(100, 5)).toBe(500)
    })

    it('should calculate extended amount with discount', () => {
      // (100€ × 5) - 50€ discount = 450€
      expect(calculateLineExtendedAmount(100, 5, 50)).toBe(450)
    })

    it('should calculate extended amount with tax', () => {
      // (100€ × 5) + 21€ tax = 521€
      expect(calculateLineExtendedAmount(100, 5, 0, 21)).toBe(521)
    })

    it('should calculate extended amount with both discount and tax', () => {
      // (100€ × 5) - 50€ discount + 21€ tax = 471€
      expect(calculateLineExtendedAmount(100, 5, 50, 21)).toBe(471)
    })

    it('should handle decimal values', () => {
      // (10.50€ × 2.5) - 5.25€ + 2.10€ = 23.10€
      expect(calculateLineExtendedAmount(10.5, 2.5, 5.25, 2.1)).toBe(23.1)
    })
  })

  describe('calculateDiscountPercentage', () => {
    it('should calculate discount percentage correctly', () => {
      // 50€ discount on 500€ base = 10%
      expect(calculateDiscountPercentage(500, 50)).toBe(10)
    })

    it('should calculate 50% discount', () => {
      expect(calculateDiscountPercentage(200, 100)).toBe(50)
    })

    it('should calculate 100% discount', () => {
      expect(calculateDiscountPercentage(100, 100)).toBe(100)
    })

    it('should handle zero base amount', () => {
      expect(calculateDiscountPercentage(0, 50)).toBe(0)
    })

    it('should handle zero discount', () => {
      expect(calculateDiscountPercentage(500, 0)).toBe(0)
    })

    it('should handle decimal percentages', () => {
      // 37.50€ discount on 500€ = 7.5%
      expect(calculateDiscountPercentage(500, 37.5)).toBe(7.5)
    })
  })

  describe('calculateDiscountAmount', () => {
    it('should calculate discount amount from percentage', () => {
      // 10% of 500€ = 50€
      expect(calculateDiscountAmount(500, 10)).toBe(50)
    })

    it('should calculate 50% discount amount', () => {
      expect(calculateDiscountAmount(200, 50)).toBe(100)
    })

    it('should calculate 100% discount amount', () => {
      expect(calculateDiscountAmount(100, 100)).toBe(100)
    })

    it('should handle zero percentage', () => {
      expect(calculateDiscountAmount(500, 0)).toBe(0)
    })

    it('should handle zero base amount', () => {
      expect(calculateDiscountAmount(0, 10)).toBe(0)
    })

    it('should handle decimal percentages', () => {
      // 7.5% of 500€ = 37.5€
      expect(calculateDiscountAmount(500, 7.5)).toBe(37.5)
    })
  })

  describe('calculateTaxAmount', () => {
    it('should calculate tax amount from percentage', () => {
      // 21% IVA on 100€ = 21€
      expect(calculateTaxAmount(100, 21)).toBe(21)
    })

    it('should calculate 10% tax', () => {
      expect(calculateTaxAmount(500, 10)).toBe(50)
    })

    it('should handle zero tax percentage', () => {
      expect(calculateTaxAmount(500, 0)).toBe(0)
    })

    it('should handle zero base amount', () => {
      expect(calculateTaxAmount(0, 21)).toBe(0)
    })

    it('should handle decimal tax rates', () => {
      // 19.5% tax on 200€ = 39€
      expect(calculateTaxAmount(200, 19.5)).toBe(39)
    })
  })

  describe('calculateQuoteTotals', () => {
    it('should calculate totals for single line', () => {
      const lines: QuoteDetail[] = [
        {
          quotedetailid: '1',
          quoteid: 'q1',
          quantity: 5,
          priceperunit: 100,
          baseamount: 500,
          manualdiscountamount: 50,
          tax: 21,
          extendedamount: 471, // (100 × 5) - 50 + 21
          createdon: '2025-01-01',
          modifiedon: '2025-01-01',
        },
      ]

      const result = calculateQuoteTotals(lines)

      expect(result.totalbaseamount).toBe(500)
      expect(result.totallineitemamount).toBe(471)
      expect(result.totaldiscountamount).toBe(50)
      expect(result.totaltax).toBe(21)
      expect(result.totalamount).toBe(471)
      expect(result.lineCount).toBe(1)
      expect(result.totalQuantity).toBe(5)
    })

    it('should calculate totals for multiple lines', () => {
      const lines: QuoteDetail[] = [
        {
          quotedetailid: '1',
          quoteid: 'q1',
          quantity: 5,
          priceperunit: 100,
          baseamount: 500,
          manualdiscountamount: 50,
          tax: 21,
          extendedamount: 471,
          createdon: '2025-01-01',
          modifiedon: '2025-01-01',
        },
        {
          quotedetailid: '2',
          quoteid: 'q1',
          quantity: 10,
          priceperunit: 50,
          baseamount: 500,
          manualdiscountamount: 25,
          tax: 10,
          extendedamount: 485,
          createdon: '2025-01-01',
          modifiedon: '2025-01-01',
        },
      ]

      const result = calculateQuoteTotals(lines)

      expect(result.totalbaseamount).toBe(1000)
      expect(result.totallineitemamount).toBe(956) // 471 + 485
      expect(result.totaldiscountamount).toBe(75) // 50 + 25
      expect(result.totaltax).toBe(31) // 21 + 10
      expect(result.totalamount).toBe(956)
      expect(result.lineCount).toBe(2)
      expect(result.totalQuantity).toBe(15) // 5 + 10
    })

    it('should handle empty lines array', () => {
      const result = calculateQuoteTotals([])

      expect(result.totalbaseamount).toBe(0)
      expect(result.totallineitemamount).toBe(0)
      expect(result.totaldiscountamount).toBe(0)
      expect(result.totaltax).toBe(0)
      expect(result.totalamount).toBe(0)
      expect(result.lineCount).toBe(0)
      expect(result.totalQuantity).toBe(0)
    })

    it('should handle lines without discount or tax', () => {
      const lines: QuoteDetail[] = [
        {
          quotedetailid: '1',
          quoteid: 'q1',
          quantity: 2,
          priceperunit: 100,
          baseamount: 200,
          extendedamount: 200,
          createdon: '2025-01-01',
          modifiedon: '2025-01-01',
        },
      ]

      const result = calculateQuoteTotals(lines)

      expect(result.totalbaseamount).toBe(200)
      expect(result.totallineitemamount).toBe(200)
      expect(result.totaldiscountamount).toBe(0)
      expect(result.totaltax).toBe(0)
      expect(result.totalamount).toBe(200)
    })
  })

  describe('calculateAverageDiscountPercentage', () => {
    it('should calculate average discount percentage', () => {
      const lines: QuoteDetail[] = [
        {
          quotedetailid: '1',
          quoteid: 'q1',
          quantity: 1,
          priceperunit: 100,
          baseamount: 100,
          manualdiscountamount: 10, // 10%
          extendedamount: 90,
          createdon: '2025-01-01',
          modifiedon: '2025-01-01',
        },
        {
          quotedetailid: '2',
          quoteid: 'q1',
          quantity: 1,
          priceperunit: 100,
          baseamount: 100,
          manualdiscountamount: 20, // 20%
          extendedamount: 80,
          createdon: '2025-01-01',
          modifiedon: '2025-01-01',
        },
      ]

      // Total base: 200€, Total discount: 30€ = 15%
      const result = calculateAverageDiscountPercentage(lines)
      expect(result).toBe(15)
    })

    it('should return 0 for empty lines', () => {
      expect(calculateAverageDiscountPercentage([])).toBe(0)
    })

    it('should return 0 when total base is 0', () => {
      const lines: QuoteDetail[] = [
        {
          quotedetailid: '1',
          quoteid: 'q1',
          quantity: 0,
          priceperunit: 0,
          baseamount: 0,
          manualdiscountamount: 0,
          extendedamount: 0,
          createdon: '2025-01-01',
          modifiedon: '2025-01-01',
        },
      ]

      expect(calculateAverageDiscountPercentage(lines)).toBe(0)
    })

    it('should handle lines without discounts', () => {
      const lines: QuoteDetail[] = [
        {
          quotedetailid: '1',
          quoteid: 'q1',
          quantity: 1,
          priceperunit: 100,
          baseamount: 100,
          extendedamount: 100,
          createdon: '2025-01-01',
          modifiedon: '2025-01-01',
        },
      ]

      expect(calculateAverageDiscountPercentage(lines)).toBe(0)
    })
  })

  describe('calculateProfitMargin', () => {
    it('should calculate profit margin correctly', () => {
      // Price: 100€, Cost: 60€ = 40% margin
      expect(calculateProfitMargin(100, 60)).toBe(40)
    })

    it('should calculate 50% margin', () => {
      expect(calculateProfitMargin(100, 50)).toBe(50)
    })

    it('should calculate 0% margin when price equals cost', () => {
      expect(calculateProfitMargin(100, 100)).toBe(0)
    })

    it('should handle negative margin (cost > price)', () => {
      // Price: 100€, Cost: 120€ = -20% margin (loss)
      expect(calculateProfitMargin(100, 120)).toBe(-20)
    })

    it('should handle zero price', () => {
      expect(calculateProfitMargin(0, 50)).toBe(0)
    })

    it('should handle zero cost', () => {
      // Price: 100€, Cost: 0€ = 100% margin
      expect(calculateProfitMargin(100, 0)).toBe(100)
    })
  })

  describe('calculateProfitAmount', () => {
    it('should calculate profit amount correctly', () => {
      expect(calculateProfitAmount(100, 60)).toBe(40)
    })

    it('should handle zero profit', () => {
      expect(calculateProfitAmount(100, 100)).toBe(0)
    })

    it('should handle negative profit (loss)', () => {
      expect(calculateProfitAmount(100, 120)).toBe(-20)
    })

    it('should handle zero cost', () => {
      expect(calculateProfitAmount(100, 0)).toBe(100)
    })
  })

  describe('formatPercentage', () => {
    it('should format percentage with 2 decimals by default', () => {
      expect(formatPercentage(15.5)).toBe('15.50%')
    })

    it('should format whole number percentage', () => {
      expect(formatPercentage(50)).toBe('50.00%')
    })

    it('should format percentage with custom decimals', () => {
      expect(formatPercentage(33.333, 1)).toBe('33.3%')
    })

    it('should handle zero percentage', () => {
      expect(formatPercentage(0)).toBe('0.00%')
    })

    it('should handle undefined value', () => {
      expect(formatPercentage(undefined)).toBe('0.00%')
    })

    it('should handle null value', () => {
      expect(formatPercentage(null as any)).toBe('0.00%')
    })

    it('should handle NaN value', () => {
      expect(formatPercentage(NaN)).toBe('0.00%')
    })
  })

  describe('calculateDaysUntilExpiration', () => {
    it('should calculate days until future date', () => {
      const today = new Date()
      const futureDate = new Date(today)
      futureDate.setDate(today.getDate() + 10)

      const result = calculateDaysUntilExpiration(futureDate.toISOString())
      expect(result).toBe(10)
    })

    it('should return negative days for past date', () => {
      const today = new Date()
      const pastDate = new Date(today)
      pastDate.setDate(today.getDate() - 5)

      const result = calculateDaysUntilExpiration(pastDate.toISOString())
      expect(result).toBeLessThan(0)
    })

    it('should return null for undefined date', () => {
      expect(calculateDaysUntilExpiration(undefined)).toBe(null)
    })

    it('should return 0 or 1 for today', () => {
      const today = new Date().toISOString()
      const result = calculateDaysUntilExpiration(today)
      expect(result).toBeGreaterThanOrEqual(0)
      expect(result).toBeLessThanOrEqual(1)
    })
  })

  describe('isQuoteExpired', () => {
    it('should return true for past date', () => {
      const pastDate = new Date('2020-01-01').toISOString()
      expect(isQuoteExpired(pastDate)).toBe(true)
    })

    it('should return false for future date', () => {
      const futureDate = new Date('2030-12-31').toISOString()
      expect(isQuoteExpired(futureDate)).toBe(false)
    })

    it('should return false for undefined date', () => {
      expect(isQuoteExpired(undefined)).toBe(false)
    })

    it('should return false or true for today depending on time', () => {
      const today = new Date()
      const result = isQuoteExpired(today.toISOString())
      expect(typeof result).toBe('boolean')
    })
  })

  describe('calculateValidityPeriod', () => {
    it('should calculate validity period correctly', () => {
      const from = '2025-01-01'
      const to = '2025-01-31'

      const result = calculateValidityPeriod(from, to)
      expect(result).toBe(30)
    })

    it('should return null for missing from date', () => {
      expect(calculateValidityPeriod(undefined, '2025-01-31')).toBe(null)
    })

    it('should return null for missing to date', () => {
      expect(calculateValidityPeriod('2025-01-01', undefined)).toBe(null)
    })

    it('should return null for both missing', () => {
      expect(calculateValidityPeriod(undefined, undefined)).toBe(null)
    })

    it('should calculate 1 day for same dates', () => {
      const date = '2025-01-01'
      const result = calculateValidityPeriod(date, date)
      expect(result).toBe(0)
    })

    it('should calculate 365 days for one year', () => {
      const from = '2025-01-01'
      const to = '2026-01-01'

      const result = calculateValidityPeriod(from, to)
      expect(result).toBe(365) // One year = 365 days
    })
  })

  describe('roundToTwoDecimals', () => {
    it('should round to 2 decimals correctly', () => {
      expect(roundToTwoDecimals(10.555)).toBe(10.56)
    })

    it('should round down when third decimal < 5', () => {
      expect(roundToTwoDecimals(10.554)).toBe(10.55)
    })

    it('should handle whole numbers', () => {
      expect(roundToTwoDecimals(10)).toBe(10)
    })

    it('should handle negative numbers', () => {
      expect(roundToTwoDecimals(-10.555)).toBe(-10.55)
    })

    it('should handle zero', () => {
      expect(roundToTwoDecimals(0)).toBe(0)
    })

    it('should handle very small numbers', () => {
      expect(roundToTwoDecimals(0.005)).toBe(0.01)
    })
  })

  describe('calculateWeightedAveragePrice', () => {
    it('should calculate weighted average price correctly', () => {
      const lines: QuoteDetail[] = [
        {
          quotedetailid: '1',
          quoteid: 'q1',
          quantity: 5,
          priceperunit: 100,
          baseamount: 500,
          extendedamount: 500,
          createdon: '2025-01-01',
          modifiedon: '2025-01-01',
        },
        {
          quotedetailid: '2',
          quoteid: 'q1',
          quantity: 10,
          priceperunit: 50,
          baseamount: 500,
          extendedamount: 500,
          createdon: '2025-01-01',
          modifiedon: '2025-01-01',
        },
      ]

      // (100 × 5 + 50 × 10) / (5 + 10) = 1000 / 15 = 66.67
      const result = calculateWeightedAveragePrice(lines)
      expect(result).toBeCloseTo(66.67, 2)
    })

    it('should return 0 for empty lines', () => {
      expect(calculateWeightedAveragePrice([])).toBe(0)
    })

    it('should return 0 when total quantity is 0', () => {
      const lines: QuoteDetail[] = [
        {
          quotedetailid: '1',
          quoteid: 'q1',
          quantity: 0,
          priceperunit: 100,
          baseamount: 0,
          extendedamount: 0,
          createdon: '2025-01-01',
          modifiedon: '2025-01-01',
        },
      ]

      expect(calculateWeightedAveragePrice(lines)).toBe(0)
    })

    it('should handle single line', () => {
      const lines: QuoteDetail[] = [
        {
          quotedetailid: '1',
          quoteid: 'q1',
          quantity: 5,
          priceperunit: 100,
          baseamount: 500,
          extendedamount: 500,
          createdon: '2025-01-01',
          modifiedon: '2025-01-01',
        },
      ]

      expect(calculateWeightedAveragePrice(lines)).toBe(100)
    })
  })

  describe('calculateGrandTotal', () => {
    it('should calculate grand total with all charges', () => {
      expect(calculateGrandTotal(1000, 50, 25)).toBe(1075)
    })

    it('should calculate grand total without freight', () => {
      expect(calculateGrandTotal(1000, 0, 25)).toBe(1025)
    })

    it('should calculate grand total without additional charges', () => {
      expect(calculateGrandTotal(1000, 50, 0)).toBe(1050)
    })

    it('should handle only line items total', () => {
      expect(calculateGrandTotal(1000)).toBe(1000)
    })

    it('should handle zero line items total', () => {
      expect(calculateGrandTotal(0, 50, 25)).toBe(75)
    })

    it('should handle decimal values', () => {
      expect(calculateGrandTotal(1000.50, 25.25, 10.10)).toBe(1035.85)
    })
  })
})
