import { getStageColor, getScoreColor, formatDate, formatCurrency } from '../utils'

describe('Lead Utils', () => {
  describe('getStageColor', () => {
    it('returns correct colors for all stages', () => {
      const testCases = [
        { stage: 'prospect', expected: 'bg-gray-100 text-gray-800' },
        { stage: 'contacted', expected: 'bg-blue-100 text-blue-800' },
        { stage: 'qualified', expected: 'bg-green-100 text-green-800' },
        { stage: 'proposal', expected: 'bg-yellow-100 text-yellow-800' },
        { stage: 'negotiation', expected: 'bg-orange-100 text-orange-800' },
        { stage: 'closed_won', expected: 'bg-green-100 text-green-800' },
        { stage: 'closed_lost', expected: 'bg-red-100 text-red-800' },
      ]

      testCases.forEach(({ stage, expected }) => {
        expect(getStageColor(stage)).toBe(expected)
      })
    })

    it('returns default color for unknown stage', () => {
      expect(getStageColor('unknown_stage')).toBe('bg-gray-100 text-gray-800')
      expect(getStageColor('')).toBe('bg-gray-100 text-gray-800')
    })
  })

  describe('getScoreColor', () => {
    it('returns correct colors for different score ranges', () => {
      const testCases = [
        { score: 95, expected: 'text-green-600' },
        { score: 80, expected: 'text-green-600' },
        { score: 75, expected: 'text-yellow-600' },
        { score: 60, expected: 'text-yellow-600' },
        { score: 50, expected: 'text-orange-600' },
        { score: 40, expected: 'text-orange-600' },
        { score: 25, expected: 'text-red-600' },
        { score: 0, expected: 'text-red-600' },
      ]

      testCases.forEach(({ score, expected }) => {
        expect(getScoreColor(score)).toBe(expected)
      })
    })

    it('handles edge cases', () => {
      expect(getScoreColor(100)).toBe('text-green-600')
      expect(getScoreColor(-10)).toBe('text-red-600')
    })
  })

  describe('formatDate', () => {
    beforeEach(() => {
      // Mock toLocaleDateString to ensure consistent results
      jest.spyOn(Date.prototype, 'toLocaleDateString').mockReturnValue('1/15/2024')
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    it('formats date strings correctly', () => {
      const result = formatDate('2024-01-15')
      expect(result).toBe('1/15/2024')
      expect(Date.prototype.toLocaleDateString).toHaveBeenCalled()
    })

    it('handles different date formats', () => {
      const testDates = [
        '2024-01-15',
        '2024-12-31T23:59:59.999Z',
        '2024/01/15',
      ]

      testDates.forEach(date => {
        expect(formatDate(date)).toBe('1/15/2024')
      })
    })
  })

  describe('formatCurrency', () => {
    it('formats valid currency values', () => {
      const testCases = [
        { value: '1000', expected: '$1,000' },
        { value: '50000', expected: '$50,000' },
        { value: '1000000', expected: '$1,000,000' },
        { value: '99.99', expected: '$99.99' },
        { value: '0', expected: '$0' },
      ]

      testCases.forEach(({ value, expected }) => {
        expect(formatCurrency(value)).toBe(expected)
      })
    })

    it('handles undefined and invalid values', () => {
      expect(formatCurrency(undefined)).toBe('-')
      expect(formatCurrency('')).toBe('-')
      expect(formatCurrency('invalid')).toBe('-')
      expect(formatCurrency('abc123')).toBe('-')
    })

    it('handles edge cases', () => {
      expect(formatCurrency('0.00')).toBe('$0')
      expect(formatCurrency('1.2345')).toBe('$1.235') // Rounding behavior
    })
  })

  describe('integration tests', () => {
    it('utility functions work together correctly', () => {
      // Test that all utilities can be used together without conflicts
      const stage = 'qualified'
      const score = 85
      const date = '2024-01-15'
      const value = '50000'

      expect(getStageColor(stage)).toBe('bg-green-100 text-green-800')
      expect(getScoreColor(score)).toBe('text-green-600')
      expect(formatDate(date)).toBeDefined()
      expect(formatCurrency(value)).toBe('$50,000')
    })
  })
})
