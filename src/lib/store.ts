import { create } from 'zustand'
import { UserStats, VerbProgress, Fiil } from '@/types'

interface AppState {
  userStats: UserStats | null
  verbProgress: VerbProgress[]
  currentVerb: Fiil | null
  quizScore: number
  quizTotal: number
  hearts: number
  streak: number
  xp: number

  setUserStats: (stats: UserStats | null) => void
  setVerbProgress: (progress: VerbProgress[]) => void
  setCurrentVerb: (verb: Fiil | null) => void

  addXp: (amount: number) => void
  loseHeart: () => void
  gainHeart: () => void
  incrementStreak: () => void
  resetStreak: () => void

  setQuizScore: (score: number, total: number) => void
  resetQuiz: () => void

  loadFromDb: (stats: UserStats, progress: VerbProgress[]) => void
}

export const useAppStore = create<AppState>((set) => ({
  userStats: null,
  verbProgress: [],
  currentVerb: null,
  quizScore: 0,
  quizTotal: 0,
  hearts: 5,
  streak: 0,
  xp: 0,

  setUserStats: (stats) =>
    set({
      userStats: stats,
      hearts: stats?.hearts ?? 5,
      streak: stats?.streak ?? 0,
      xp: stats?.totalXp ?? 0,
    }),
  setVerbProgress: (progress) => set({ verbProgress: progress }),
  setCurrentVerb: (verb) => set({ currentVerb: verb }),

  addXp: (amount) => set((state) => ({ xp: state.xp + amount })),
  loseHeart: () => set((state) => ({ hearts: Math.max(0, state.hearts - 1) })),
  gainHeart: () => set((state) => ({ hearts: state.hearts + 1 })),
  incrementStreak: () => set((state) => ({ streak: state.streak + 1 })),
  resetStreak: () => set({ streak: 0 }),

  setQuizScore: (score, total) => set({ quizScore: score, quizTotal: total }),
  resetQuiz: () => set({ quizScore: 0, quizTotal: 0 }),

  loadFromDb: (stats, progress) =>
    set({
      userStats: stats,
      hearts: stats?.hearts ?? 5,
      streak: stats?.streak ?? 0,
      xp: stats?.totalXp ?? 0,
      verbProgress: progress,
    }),
}))
