import { describe, it, expect } from 'vitest'
import {
  getVerbById,
  searchVerbs,
  filterVerbs,
  getRandomVerbs,
  getVerbsByDifficulty,
  verbsData,
} from '@/data/verbs'

describe('verbsData', () => {
  it('should have at least 60 verbs', () => {
    expect(verbsData.length).toBeGreaterThanOrEqual(60)
  })

  it('should have valid verb structure for all verbs', () => {
    verbsData.forEach((verb) => {
      expect(verb).toHaveProperty('id')
      expect(verb).toHaveProperty('root')
      expect(verb).toHaveProperty('madhi')
      expect(verb).toHaveProperty('mudhari')
      expect(verb).toHaveProperty('amr')
      expect(verb).toHaveProperty('meaning')
      expect(verb).toHaveProperty('type')
      expect(verb).toHaveProperty('difficulty')
      expect(verb).toHaveProperty('audioPath')
      expect(verb).toHaveProperty('conjugations')
      expect(Array.isArray(verb.conjugations)).toBe(true)
      expect(verb.conjugations.length).toBeGreaterThan(0)
    })
  })

  it('should have 14 conjugations for each verb', () => {
    verbsData.forEach((verb) => {
      expect(verb.conjugations.length).toBe(14)
    })
  })

  it('should include imperative forms for address pronouns', () => {
    verbsData.forEach((verb) => {
      const imperativeRows = verb.conjugations.filter((item) => item.amr)
      expect(imperativeRows.length).toBeGreaterThan(0)
    })
  })
})

describe('getVerbById', () => {
  it('should return a verb by id', () => {
    const verb = getVerbById('kataba')
    expect(verb).toBeDefined()
    expect(verb?.id).toBe('kataba')
  })

  it('should return undefined for non-existent id', () => {
    const verb = getVerbById('nonexistent-verb')
    expect(verb).toBeUndefined()
  })
})

describe('searchVerbs', () => {
  it('should find verbs by Arabic root format (dash-separated)', () => {
    const results = searchVerbs('ك-ت-ب')
    expect(results.length).toBeGreaterThan(0)
  })

  it('should find verbs by meaning (Indonesian/Malay)', () => {
    const results = searchVerbs('menulis')
    expect(results.length).toBeGreaterThan(0)
  })

  it('should be case insensitive', () => {
    const results = searchVerbs('MENULIS')
    expect(results.length).toBeGreaterThan(0)
  })

  it('should return empty array for no matches', () => {
    const results = searchVerbs('xyz123')
    expect(results.length).toBe(0)
  })
})

describe('filterVerbs', () => {
  it('should filter by difficulty', () => {
    const results = filterVerbs({ difficulty: 'Pemula' })
    results.forEach((verb) => {
      expect(verb.difficulty).toBe('Pemula')
    })
  })

  it('should filter by type', () => {
    const results = filterVerbs({ type: 'Salim' })
    results.forEach((verb) => {
      expect(verb.type).toBe('Salim')
    })
  })

  it('should filter by both difficulty and type', () => {
    const results = filterVerbs({ difficulty: 'Mahir', type: 'Salim' })
    results.forEach((verb) => {
      expect(verb.difficulty).toBe('Mahir')
      expect(verb.type).toBe('Salim')
    })
  })

  it('should return all verbs with empty filter', () => {
    const results = filterVerbs({})
    expect(results.length).toBe(verbsData.length)
  })
})

describe('getRandomVerbs', () => {
  it('should return the requested number of verbs', () => {
    const results = getRandomVerbs(5)
    expect(results.length).toBe(5)
  })

  it('should return unique verbs', () => {
    const results = getRandomVerbs(10)
    const ids = results.map((v) => v.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(results.length)
  })
})

describe('getVerbsByDifficulty', () => {
  it('should return verbs by difficulty level', () => {
    const Pemula = getVerbsByDifficulty('Pemula')
    const Menengah = getVerbsByDifficulty('Menengah')
    const Mahir = getVerbsByDifficulty('Mahir')

    expect(Pemula.length).toBeGreaterThan(0)
    expect(Menengah.length).toBeGreaterThan(0)
    expect(Mahir.length).toBeGreaterThan(0)
  })

  it('should have correct difficulty for each level', () => {
    const Pemula = getVerbsByDifficulty('Pemula')
    Pemula.forEach((v) => expect(v.difficulty).toBe('Pemula'))
  })
})
