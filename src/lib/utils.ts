import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

import type { ProgressStatus, VerbProgress } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function normalizeArabicText(value: string): string {
  return value
    .normalize('NFKC')
    .replace(/\u0640/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function formatArabicRoot(root: string): string {
  return root.replace(/-/g, ' ')
}

export function calculateMasteryPercentage(
  progress: VerbProgress[],
  totalVerbs: number
): number {
  if (!totalVerbs) {
    return 0
  }

  const mastered = progress.filter((item) => item.status === 'dikuasai').length
  return Math.round((mastered / totalVerbs) * 100)
}

export function getStatusLabel(status: ProgressStatus): string {
  switch (status) {
    case 'dikuasai':
      return 'Dikuasai'
    case 'sedang_dipelajari':
      return 'Sedang Dipelajari'
    default:
      return 'Belum Dipelajari'
  }
}

export function createDistractors(
  correct: string,
  pool: string[],
  count = 3
): string[] {
  return Array.from(new Set(pool.filter((item) => item !== correct)))
    .sort(() => Math.random() - 0.5)
    .slice(0, count)
}
