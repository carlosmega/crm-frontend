import { SalesStageCode, SALES_STAGE_PROBABILITY } from '../sales-stage'

describe('Sales Stage', () => {
  describe('SalesStageCode enum', () => {
    it('should have correct enum values', () => {
      expect(SalesStageCode.Qualify).toBe(0)
      expect(SalesStageCode.Develop).toBe(1)
      expect(SalesStageCode.Propose).toBe(2)
      expect(SalesStageCode.Close).toBe(3)
    })

    it('should have sequential values', () => {
      expect(SalesStageCode.Develop).toBe(SalesStageCode.Qualify + 1)
      expect(SalesStageCode.Propose).toBe(SalesStageCode.Develop + 1)
      expect(SalesStageCode.Close).toBe(SalesStageCode.Propose + 1)
    })
  })

  describe('SALES_STAGE_PROBABILITY mapping', () => {
    it('should map Qualify stage to 25% probability', () => {
      expect(SALES_STAGE_PROBABILITY[SalesStageCode.Qualify]).toBe(25)
    })

    it('should map Develop stage to 50% probability', () => {
      expect(SALES_STAGE_PROBABILITY[SalesStageCode.Develop]).toBe(50)
    })

    it('should map Propose stage to 75% probability', () => {
      expect(SALES_STAGE_PROBABILITY[SalesStageCode.Propose]).toBe(75)
    })

    it('should map Close stage to 0% probability (neutral)', () => {
      expect(SALES_STAGE_PROBABILITY[SalesStageCode.Close]).toBe(0)
    })

    it('should show progressive probability increase', () => {
      const qualifyProb = SALES_STAGE_PROBABILITY[SalesStageCode.Qualify]
      const developProb = SALES_STAGE_PROBABILITY[SalesStageCode.Develop]
      const proposeProb = SALES_STAGE_PROBABILITY[SalesStageCode.Propose]

      expect(developProb).toBeGreaterThan(qualifyProb)
      expect(proposeProb).toBeGreaterThan(developProb)
    })

    it('should have all stages mapped', () => {
      expect(SALES_STAGE_PROBABILITY).toHaveProperty(SalesStageCode.Qualify.toString())
      expect(SALES_STAGE_PROBABILITY).toHaveProperty(SalesStageCode.Develop.toString())
      expect(SALES_STAGE_PROBABILITY).toHaveProperty(SalesStageCode.Propose.toString())
      expect(SALES_STAGE_PROBABILITY).toHaveProperty(SalesStageCode.Close.toString())
    })

    it('should have probabilities as numbers', () => {
      expect(typeof SALES_STAGE_PROBABILITY[SalesStageCode.Qualify]).toBe('number')
      expect(typeof SALES_STAGE_PROBABILITY[SalesStageCode.Develop]).toBe('number')
      expect(typeof SALES_STAGE_PROBABILITY[SalesStageCode.Propose]).toBe('number')
      expect(typeof SALES_STAGE_PROBABILITY[SalesStageCode.Close]).toBe('number')
    })
  })

  describe('Sales Stage Flow', () => {
    it('should follow correct progression: Qualify → Develop → Propose → Close', () => {
      const stages = [
        SalesStageCode.Qualify,
        SalesStageCode.Develop,
        SalesStageCode.Propose,
        SalesStageCode.Close,
      ]

      // Each stage should be greater than the previous
      for (let i = 1; i < stages.length; i++) {
        expect(stages[i]).toBeGreaterThan(stages[i - 1])
      }
    })

    it('should have Qualify as first stage (lowest value)', () => {
      const allStages = [
        SalesStageCode.Qualify,
        SalesStageCode.Develop,
        SalesStageCode.Propose,
        SalesStageCode.Close,
      ]

      const minStage = Math.min(...allStages)
      expect(minStage).toBe(SalesStageCode.Qualify)
    })

    it('should have Close as final stage (highest value)', () => {
      const allStages = [
        SalesStageCode.Qualify,
        SalesStageCode.Develop,
        SalesStageCode.Propose,
        SalesStageCode.Close,
      ]

      const maxStage = Math.max(...allStages)
      expect(maxStage).toBe(SalesStageCode.Close)
    })
  })

  describe('Business Logic Validation', () => {
    it('should have probability 0-100 range', () => {
      Object.values(SALES_STAGE_PROBABILITY).forEach((probability) => {
        expect(probability).toBeGreaterThanOrEqual(0)
        expect(probability).toBeLessThanOrEqual(100)
      })
    })

    it('should increase probability by 25% for each non-final stage', () => {
      expect(SALES_STAGE_PROBABILITY[SalesStageCode.Develop] - SALES_STAGE_PROBABILITY[SalesStageCode.Qualify]).toBe(25)
      expect(SALES_STAGE_PROBABILITY[SalesStageCode.Propose] - SALES_STAGE_PROBABILITY[SalesStageCode.Develop]).toBe(25)
    })
  })
})

describe('Sales Stage Transitions (Business Logic)', () => {
  // Helper functions to simulate the service logic
  function getNextStage(currentStage: SalesStageCode): SalesStageCode | null {
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

  function getPreviousStage(currentStage: SalesStageCode): SalesStageCode | null {
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

  describe('Forward transitions', () => {
    it('should move from Qualify to Develop', () => {
      expect(getNextStage(SalesStageCode.Qualify)).toBe(SalesStageCode.Develop)
    })

    it('should move from Develop to Propose', () => {
      expect(getNextStage(SalesStageCode.Develop)).toBe(SalesStageCode.Propose)
    })

    it('should move from Propose to Close', () => {
      expect(getNextStage(SalesStageCode.Propose)).toBe(SalesStageCode.Close)
    })

    it('should return null when already at Close (final stage)', () => {
      expect(getNextStage(SalesStageCode.Close)).toBe(null)
    })
  })

  describe('Backward transitions', () => {
    it('should return null when at Qualify (first stage)', () => {
      expect(getPreviousStage(SalesStageCode.Qualify)).toBe(null)
    })

    it('should move from Develop to Qualify', () => {
      expect(getPreviousStage(SalesStageCode.Develop)).toBe(SalesStageCode.Qualify)
    })

    it('should move from Propose to Develop', () => {
      expect(getPreviousStage(SalesStageCode.Propose)).toBe(SalesStageCode.Develop)
    })

    it('should move from Close to Propose', () => {
      expect(getPreviousStage(SalesStageCode.Close)).toBe(SalesStageCode.Propose)
    })
  })

  describe('Full cycle validation', () => {
    it('should complete full forward cycle', () => {
      let stage: SalesStageCode | null = SalesStageCode.Qualify

      // Qualify → Develop
      stage = getNextStage(stage)
      expect(stage).toBe(SalesStageCode.Develop)

      // Develop → Propose
      stage = getNextStage(stage!)
      expect(stage).toBe(SalesStageCode.Propose)

      // Propose → Close
      stage = getNextStage(stage!)
      expect(stage).toBe(SalesStageCode.Close)

      // Close → null
      stage = getNextStage(stage!)
      expect(stage).toBe(null)
    })

    it('should complete full backward cycle', () => {
      let stage: SalesStageCode | null = SalesStageCode.Close

      // Close → Propose
      stage = getPreviousStage(stage)
      expect(stage).toBe(SalesStageCode.Propose)

      // Propose → Develop
      stage = getPreviousStage(stage!)
      expect(stage).toBe(SalesStageCode.Develop)

      // Develop → Qualify
      stage = getPreviousStage(stage!)
      expect(stage).toBe(SalesStageCode.Qualify)

      // Qualify → null
      stage = getPreviousStage(stage!)
      expect(stage).toBe(null)
    })

    it('should be able to go forward and backward', () => {
      let stage = SalesStageCode.Develop

      // Forward to Propose
      stage = getNextStage(stage)!
      expect(stage).toBe(SalesStageCode.Propose)

      // Back to Develop
      stage = getPreviousStage(stage)!
      expect(stage).toBe(SalesStageCode.Develop)

      // Back to Qualify
      stage = getPreviousStage(stage)!
      expect(stage).toBe(SalesStageCode.Qualify)

      // Forward to Develop
      stage = getNextStage(stage)!
      expect(stage).toBe(SalesStageCode.Develop)
    })
  })

  describe('Probability updates with stage changes', () => {
    it('should increase probability when moving forward', () => {
      const currentStage = SalesStageCode.Qualify
      const nextStage = getNextStage(currentStage)

      expect(SALES_STAGE_PROBABILITY[nextStage!]).toBeGreaterThan(
        SALES_STAGE_PROBABILITY[currentStage]
      )
    })

    it('should decrease probability when moving backward', () => {
      const currentStage = SalesStageCode.Develop
      const previousStage = getPreviousStage(currentStage)

      expect(SALES_STAGE_PROBABILITY[previousStage!]).toBeLessThan(
        SALES_STAGE_PROBABILITY[currentStage]
      )
    })

    it('should show correct probabilities at each stage transition', () => {
      let stage: SalesStageCode = SalesStageCode.Qualify
      expect(SALES_STAGE_PROBABILITY[stage]).toBe(25)

      stage = getNextStage(stage)!
      expect(SALES_STAGE_PROBABILITY[stage]).toBe(50)

      stage = getNextStage(stage)!
      expect(SALES_STAGE_PROBABILITY[stage]).toBe(75)

      stage = getNextStage(stage)!
      expect(SALES_STAGE_PROBABILITY[stage]).toBe(0) // Close
    })
  })
})
