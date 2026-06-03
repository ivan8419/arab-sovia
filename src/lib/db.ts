import Dexie, { Table } from 'dexie'
import { VerbProgress, UserStats } from '@/types'

const isBrowser = typeof window !== 'undefined'
const DEFAULT_USER_STATS: UserStats = {
  id: 'main',
  streak: 0,
  totalXp: 0,
  hearts: 5,
  lastActive: null,
}

class AppDatabase extends Dexie {
  verbProgress!: Table<VerbProgress, string>
  userStats!: Table<UserStats, string>

  constructor() {
    super('ArabSoviaDB')
    this.version(1).stores({
      verbProgress: 'id, verbId, status',
      userStats: 'id',
    })
  }
}

let dbInstance: AppDatabase | null = null

function isSameLocalDay(first: Date, second: Date): boolean {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  )
}

async function ensureUserStats(db: AppDatabase): Promise<UserStats> {
  const existing = await db.userStats.get('main')
  if (existing) {
    return existing
  }

  await db.userStats.add(DEFAULT_USER_STATS)
  return DEFAULT_USER_STATS
}

export function getDb(): AppDatabase | null {
  if (!isBrowser) return null
  if (!dbInstance) {
    dbInstance = new AppDatabase()
  }
  return dbInstance
}

export async function initializeDb(): Promise<void> {
  const db = getDb()
  if (!db) return
  try {
    await ensureUserStats(db)
  } catch {
    // silently fail if IndexedDB is not available
  }
}

export async function getUserStats(): Promise<UserStats | undefined> {
  const db = getDb()
  if (!db) return undefined
  try {
    const stats = await ensureUserStats(db)
    const now = new Date()

    if (!stats.lastActive) {
      const refreshed = { ...stats, lastActive: now.toISOString() }
      await db.userStats.update('main', { lastActive: refreshed.lastActive })
      return refreshed
    }

    const lastActiveDate = new Date(stats.lastActive)
    if (stats.hearts <= 0 && !isSameLocalDay(lastActiveDate, now)) {
      const refreshed = { ...stats, hearts: 5, lastActive: now.toISOString() }
      await db.userStats.update('main', {
        hearts: refreshed.hearts,
        lastActive: refreshed.lastActive,
      })
      return refreshed
    }

    return stats
  } catch {
    return undefined
  }
}

export async function updateUserStats(
  updates: Partial<UserStats>
): Promise<void> {
  const db = getDb()
  if (!db) return
  try {
    const current = await ensureUserStats(db)
    if (current) {
      await db.userStats.update('main', { ...current, ...updates })
    }
  } catch {
    // silently fail
  }
}

export async function getAllVerbProgress(): Promise<VerbProgress[]> {
  const db = getDb()
  if (!db) return []
  try {
    return await db.verbProgress.toArray()
  } catch {
    return []
  }
}

export async function getVerbProgress(
  verbId: string
): Promise<VerbProgress | undefined> {
  const db = getDb()
  if (!db) return undefined
  try {
    return await db.verbProgress.where('verbId').equals(verbId).first()
  } catch {
    return undefined
  }
}

export async function updateVerbProgress(
  verbId: string,
  updates: Partial<VerbProgress>
): Promise<void> {
  const db = getDb()
  if (!db) return
  try {
    const existing = await db.verbProgress
      .where('verbId')
      .equals(verbId)
      .first()
    const progressId = `progress_${verbId}`

    if (existing) {
      await db.verbProgress.update(progressId, updates)
    } else {
      await db.verbProgress.add({
        id: progressId,
        verbId,
        status: 'belum_dipelajari',
        correctCount: 0,
        incorrectCount: 0,
        lastPracticed: null,
        ...updates,
      })
    }
  } catch {
    // silently fail
  }
}

export async function resetAllProgress(): Promise<void> {
  const db = getDb()
  if (!db) return
  try {
    await db.verbProgress.clear()
    await db.userStats.update('main', {
      streak: 0,
      totalXp: 0,
      hearts: 5,
      lastActive: null,
    })
  } catch {
    // silently fail
  }
}

export async function restoreHearts(): Promise<UserStats | undefined> {
  const db = getDb()
  if (!db) return undefined
  try {
    const current = await ensureUserStats(db)
    const restored = {
      ...current,
      hearts: 5,
      lastActive: new Date().toISOString(),
    }

    await db.userStats.update('main', {
      hearts: restored.hearts,
      lastActive: restored.lastActive,
    })

    return restored
  } catch {
    return undefined
  }
}
