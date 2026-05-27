import { describe, expect, it } from 'vitest'

import {
  calculateMasteryPercentage,
  createDistractors,
  formatArabicRoot,
  normalizeArabicText,
} from '@/lib/utils'

describe('arabic helpers', () => {
  it('formats root into spaced characters', () => {
    expect(formatArabicRoot('ك-ت-ب')).toBe('ك ت ب')
  })

  it('normalizes Arabic text input', () => {
    expect(normalizeArabicText('  كَتَبَ   ')).toBe('كَتَبَ')
  })
})

describe('learning utilities', () => {
  it('calculates mastery percentage from progress list', () => {
    expect(
      calculateMasteryPercentage(
        [
          {
            id: '1',
            verbId: 'kataba',
            status: 'dikuasai',
            correctCount: 10,
            incorrectCount: 2,
            lastPracticed: null,
          },
          {
            id: '2',
            verbId: 'qaraa',
            status: 'sedang_dipelajari',
            correctCount: 3,
            incorrectCount: 1,
            lastPracticed: null,
          },
        ],
        4
      )
    ).toBe(25)
  })

  it('creates unique distractors without the correct answer', () => {
    const distractors = createDistractors('كَتَبَ', [
      'كَتَبَ',
      'قَرَأَ',
      'دَرَسَ',
      'قَرَأَ',
      'ذَهَبَ',
    ])

    expect(distractors).not.toContain('كَتَبَ')
    expect(new Set(distractors).size).toBe(distractors.length)
  })
})
