import { describe, it, expect, beforeEach } from 'vitest'
import { useAppStore } from '@/lib/store'

describe('useAppStore', () => {
  beforeEach(() => {
    useAppStore.setState({
      userStats: null,
      verbProgress: [],
      currentVerb: null,
      quizScore: 0,
      quizTotal: 0,
      hearts: 5,
      streak: 0,
      xp: 0,
    })
  })

  describe('XP operations', () => {
    it('should add XP correctly', () => {
      const { addXp } = useAppStore.getState()

      addXp(50)

      expect(useAppStore.getState().xp).toBe(50)
    })

    it('should accumulate XP from multiple additions', () => {
      const { addXp } = useAppStore.getState()

      addXp(25)
      addXp(30)
      addXp(10)

      expect(useAppStore.getState().xp).toBe(65)
    })
  })

  describe('Heart operations', () => {
    it('should lose a heart', () => {
      const { loseHeart } = useAppStore.getState()

      loseHeart()

      expect(useAppStore.getState().hearts).toBe(4)
    })

    it('should not go below 0 hearts', () => {
      const { loseHeart } = useAppStore.getState()
      useAppStore.setState({ hearts: 0 })

      loseHeart()

      expect(useAppStore.getState().hearts).toBe(0)
    })

    it('should gain a heart', () => {
      const { gainHeart } = useAppStore.getState()

      gainHeart()

      expect(useAppStore.getState().hearts).toBe(6)
    })
  })

  describe('Streak operations', () => {
    it('should increment streak', () => {
      const { incrementStreak } = useAppStore.getState()

      incrementStreak()

      expect(useAppStore.getState().streak).toBe(1)
    })

    it('should reset streak', () => {
      const { incrementStreak, resetStreak } = useAppStore.getState()

      incrementStreak()
      incrementStreak()
      resetStreak()

      expect(useAppStore.getState().streak).toBe(0)
    })
  })

  describe('Quiz operations', () => {
    it('should set quiz score', () => {
      const { setQuizScore } = useAppStore.getState()

      setQuizScore(8, 10)

      const state = useAppStore.getState()
      expect(state.quizScore).toBe(8)
      expect(state.quizTotal).toBe(10)
    })

    it('should reset quiz', () => {
      const { setQuizScore, resetQuiz } = useAppStore.getState()

      setQuizScore(8, 10)
      resetQuiz()

      const state = useAppStore.getState()
      expect(state.quizScore).toBe(0)
      expect(state.quizTotal).toBe(0)
    })
  })

  describe('loadFromDb', () => {
    it('should load stats from database', () => {
      const { loadFromDb } = useAppStore.getState()

      loadFromDb(
        {
          id: 'stats-1',
          hearts: 10,
          streak: 5,
          totalXp: 100,
          lastActive: null,
        },
        [
          {
            id: 'progress-1',
            verbId: '1',
            status: 'dikuasai',
            correctCount: 12,
            incorrectCount: 2,
            lastPracticed: null,
          },
        ]
      )

      const state = useAppStore.getState()
      expect(state.hearts).toBe(10)
      expect(state.streak).toBe(5)
      expect(state.xp).toBe(100)
      expect(state.verbProgress).toHaveLength(1)
    })

    it('should use default values when stats is null', () => {
      const { loadFromDb } = useAppStore.getState()

      loadFromDb({ id: 'stats-2' } as any, [])

      const state = useAppStore.getState()
      expect(state.hearts).toBe(5)
      expect(state.streak).toBe(0)
      expect(state.xp).toBe(0)
    })
  })
})
