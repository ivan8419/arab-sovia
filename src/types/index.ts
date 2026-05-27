export type VerbType = 'Salim' | 'Mithali' | "Mu'tal" | 'Mudhoffaf' | 'Mazid'

export type Difficulty = 'Pemula' | 'Menengah' | 'Mahir'

export type Dhomir =
  | 'huwa'
  | 'huma_m'
  | 'hum'
  | 'hiya'
  | 'huma_f'
  | 'hunna'
  | 'anta'
  | 'antuma_m'
  | 'antum'
  | 'anti'
  | 'antuma_f'
  | 'antunna'
  | 'ana'
  | 'nahnu'

export type ProgressStatus =
  | 'belum_dipelajari'
  | 'sedang_dipelajari'
  | 'dikuasai'

export interface Conjugation {
  dhomir: Dhomir
  dhomirLabel: string
  madhi: string
  mudhari: string
  amr?: string
}

export interface Fiil {
  id: string
  root: string
  madhi: string
  mudhari: string
  amr: string
  mashdar: string
  meaning: string
  type: VerbType
  difficulty: Difficulty
  audioPath: string
  audioExample: string
  conjugations: Conjugation[]
}

export interface VerbProgress {
  id: string
  verbId: string
  status: ProgressStatus
  correctCount: number
  incorrectCount: number
  lastPracticed: string | null
}

export interface UserStats {
  id: string
  streak: number
  totalXp: number
  hearts: number
  lastActive: string | null
}
