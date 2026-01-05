import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatPercent,
  formatNumber,
  formatPhone,
  truncateText,
} from '../formatters'

describe('Formatters', () => {
  describe('formatCurrency', () => {
    it('should format positive number as EUR currency', () => {
      const result = formatCurrency(1500.5)
      expect(result).toContain('€')
      expect(result).toContain('1')
      expect(result).toContain('500')
    })

    it('should format zero', () => {
      const result = formatCurrency(0)
      expect(result).toContain('€')
      expect(result).toContain('0')
    })

    it('should format negative numbers', () => {
      const result = formatCurrency(-100)
      expect(result).toContain('€')
      expect(result).toContain('-')
      expect(result).toContain('100')
    })

    it('should return "-" for null', () => {
      expect(formatCurrency(null)).toBe('-')
    })

    it('should return "-" for undefined', () => {
      expect(formatCurrency(undefined)).toBe('-')
    })

    it('should handle large numbers', () => {
      const result = formatCurrency(1000000)
      expect(result).toContain('1.000.000')
      expect(result).toContain('€')
    })

    it('should handle decimal numbers', () => {
      const result = formatCurrency(1234.56)
      expect(result).toContain('1')
      expect(result).toContain('234')
      expect(result).toContain('€')
    })
  })

  describe('formatDate', () => {
    it('should format ISO string date', () => {
      const result = formatDate('2025-11-04')
      expect(result).toContain('2025')
      expect(result).toContain('nov')
    })

    it('should format Date object', () => {
      const date = new Date('2025-11-04T00:00:00Z')
      const result = formatDate(date)
      expect(result).toContain('2025')
    })

    it('should return "-" for null', () => {
      expect(formatDate(null)).toBe('-')
    })

    it('should return "-" for undefined', () => {
      expect(formatDate(undefined)).toBe('-')
    })

    it('should return "-" for invalid date string', () => {
      expect(formatDate('invalid-date')).toBe('-')
    })

    it('should return "-" for empty string', () => {
      expect(formatDate('')).toBe('-')
    })

    it('should handle different month formats', () => {
      const result = formatDate('2025-01-15')
      expect(result).toContain('2025')
      expect(result).toContain('ene')
    })
  })

  describe('formatDateTime', () => {
    it('should format ISO datetime string', () => {
      const result = formatDateTime('2025-11-04T14:30:00')
      expect(result).toContain('2025')
      expect(result).toContain('14:30')
    })

    it('should format Date object with time', () => {
      const date = new Date('2025-11-04T14:30:00Z')
      const result = formatDateTime(date)
      expect(result).toContain('2025')
    })

    it('should return "-" for null', () => {
      expect(formatDateTime(null)).toBe('-')
    })

    it('should return "-" for undefined', () => {
      expect(formatDateTime(undefined)).toBe('-')
    })

    it('should return "-" for invalid datetime', () => {
      expect(formatDateTime('invalid')).toBe('-')
    })
  })

  describe('formatPercent', () => {
    it('should format decimal as percentage', () => {
      const result = formatPercent(0.75)
      expect(result).toContain('75')
      expect(result).toContain('%')
    })

    it('should format 0.5 as 50%', () => {
      const result = formatPercent(0.5)
      expect(result).toContain('50')
      expect(result).toContain('%')
    })

    it('should format 1 as 100%', () => {
      const result = formatPercent(1)
      expect(result).toContain('100')
      expect(result).toContain('%')
    })

    it('should format 0 as 0%', () => {
      const result = formatPercent(0)
      expect(result).toContain('0')
      expect(result).toContain('%')
    })

    it('should return "-" for null', () => {
      expect(formatPercent(null)).toBe('-')
    })

    it('should return "-" for undefined', () => {
      expect(formatPercent(undefined)).toBe('-')
    })

    it('should handle decimal percentages', () => {
      const result = formatPercent(0.256)
      expect(result).toContain('25')
      expect(result).toContain('%')
    })

    it('should handle values greater than 1', () => {
      const result = formatPercent(1.5)
      expect(result).toContain('150')
      expect(result).toContain('%')
    })
  })

  describe('formatNumber', () => {
    it('should format integer', () => {
      const result = formatNumber(1000)
      expect(result).toContain('1')
      expect(result).toContain('000')
    })

    it('should format decimal number', () => {
      const result = formatNumber(1500.5)
      expect(result).toContain('1')
      expect(result).toContain('500')
    })

    it('should format zero', () => {
      expect(formatNumber(0)).toBe('0')
    })

    it('should format negative numbers', () => {
      const result = formatNumber(-500)
      expect(result).toContain('-')
      expect(result).toContain('500')
    })

    it('should return "-" for null', () => {
      expect(formatNumber(null)).toBe('-')
    })

    it('should return "-" for undefined', () => {
      expect(formatNumber(undefined)).toBe('-')
    })

    it('should handle large numbers with decimals', () => {
      const result = formatNumber(1234567.89)
      expect(result).toContain('1.234.567')
      expect(result).toContain(',89')
    })
  })

  describe('formatPhone', () => {
    it('should format Spanish mobile number', () => {
      expect(formatPhone('612345678')).toBe('612 34 56 78')
    })

    it('should format international number with +34', () => {
      expect(formatPhone('+34612345678')).toBe('+34 612 34 56 78')
    })

    it('should handle numbers with separators', () => {
      expect(formatPhone('612-345-678')).toBe('612 34 56 78')
    })

    it('should handle numbers with spaces', () => {
      expect(formatPhone('612 345 678')).toBe('612 34 56 78')
    })

    it('should return "-" for null', () => {
      expect(formatPhone(null)).toBe('-')
    })

    it('should return "-" for undefined', () => {
      expect(formatPhone(undefined)).toBe('-')
    })

    it('should return "-" for empty string', () => {
      expect(formatPhone('')).toBe('-')
    })

    it('should return original value for unrecognized pattern', () => {
      const phone = '123456'
      expect(formatPhone(phone)).toBe(phone)
    })

    it('should handle numbers starting with 6', () => {
      expect(formatPhone('600123456')).toBe('600 12 34 56')
    })
  })

  describe('truncateText', () => {
    it('should truncate text longer than maxLength', () => {
      const result = truncateText('This is a very long text', 10)
      expect(result).toContain('This is')
      expect(result).toContain('...')
      expect(result.length).toBeGreaterThanOrEqual(10)
    })

    it('should not truncate text shorter than maxLength', () => {
      expect(truncateText('Short text', 20)).toBe('Short text')
    })

    it('should not truncate text equal to maxLength', () => {
      expect(truncateText('Exact length', 12)).toBe('Exact length')
    })

    it('should handle empty string', () => {
      expect(truncateText('', 10)).toBe('')
    })

    it('should handle maxLength of 0', () => {
      expect(truncateText('Some text', 0)).toBe('...')
    })

    it('should add ellipsis when truncating', () => {
      const result = truncateText('Long text here', 5)
      expect(result).toContain('...')
      expect(result.length).toBe(8) // 5 chars + '...'
    })

    it('should preserve exact characters before truncation', () => {
      const result = truncateText('Hello World', 5)
      expect(result).toBe('Hello...')
    })
  })
})
