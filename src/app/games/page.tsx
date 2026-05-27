'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { verbsData, getRandomVerbs } from '@/data/verbs'
import { useAppStore } from '@/lib/store'
import { initializeDb, getUserStats, getAllVerbProgress } from '@/lib/db'
import confetti from 'canvas-confetti'

const games = [
  {
    id: 'match',
    title: 'Verb Match Arena',
    titleAr: 'ساحة مطابقة الأفعال',
    description: 'Drag & drop matching dengan physics',
    icon: '🎯',
    color: 'from-purple-500 to-pink-500',
    path: '/games/match',
  },
  {
    id: 'sprint',
    title: 'Conjugation Sprint',
    titleAr: 'سباق التصريف',
    description: 'Typing race dengan timer visual',
    icon: '🏃',
    color: 'from-orange-500 to-red-500',
    path: '/games/sprint',
  },
  {
    id: 'defense',
    title: "Fi'il Defense",
    titleAr: 'دفاع الفعل',
    description: 'Tower defense style game',
    icon: '🛡️',
    color: 'from-blue-500 to-cyan-500',
    path: '/games/defense',
  },
  {
    id: 'memory',
    title: 'Memory Palace',
    titleAr: 'قصر الذاكرة',
    description: '3D card flip memory game',
    icon: '🧠',
    color: 'from-green-500 to-emerald-500',
    path: '/games/memory',
  },
  {
    id: 'rapid',
    title: 'Rapid Fire Duel',
    titleAr: 'مواجهة سريعة',
    description: '60 detik nonstop quiz',
    icon: '⚡',
    color: 'from-yellow-500 to-amber-500',
    path: '/games/rapid',
  },
  {
    id: 'rootle',
    title: 'Rootle',
    titleAr: 'رطل',
    description: 'Wordle style untuk akar kata',
    icon: '🎮',
    color: 'from-indigo-500 to-violet-500',
    path: '/games/rootle',
  },
]

export default function GamesPage() {
  const [loading, setLoading] = useState(true)
  const { loadFromDb, xp, hearts } = useAppStore()

  useEffect(() => {
    async function loadData() {
      await initializeDb()
      const stats = await getUserStats()
      const progress = await getAllVerbProgress()
      if (stats) loadFromDb(stats, progress)
      setLoading(false)
    }
    loadData()
  }, [loadFromDb])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 100 },
    },
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="text-6xl"
        >
          ⚡
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <header className="p-4 sticky top-0 bg-slate-900/80 backdrop-blur-md z-10">
        <nav className="flex justify-between items-center max-w-6xl mx-auto">
          <Link href="/" className="text-2xl">
            ←
          </Link>
          <h1 className="text-xl font-bold">🎮 Games</h1>
          <div className="flex gap-3">
            <span className="text-xl">⚡ {xp}</span>
            <span className="text-xl">❤️ {hearts}</span>
          </div>
        </nav>
      </header>

      <main className="max-w-6xl mx-auto p-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl font-bold mb-2">اختر لعبتك 🎯</h2>
          <p className="text-slate-400">
            Pilih game untuk belajar sambil bermain!
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {games.map((game) => (
            <motion.div key={game.id} variants={itemVariants}>
              <Link href={game.path} prefetch={false}>
                <motion.div
                  whileHover={{ scale: 1.03, rotate: 1 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br ${game.color} h-48 cursor-pointer group`}
                >
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                  <div className="relative z-10">
                    <div className="text-5xl mb-3">{game.icon}</div>
                    <h3 className="text-xl font-bold">{game.title}</h3>
                    <p className="text-sm opacity-90 mb-1">{game.titleAr}</p>
                    <p className="text-sm opacity-75">{game.description}</p>
                  </div>
                  <motion.div
                    initial={{ x: 100 }}
                    whileHover={{ x: 0 }}
                    className="absolute bottom-4 left-4 text-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ▶️
                  </motion.div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <div className="inline-flex items-center gap-2 bg-slate-800/50 rounded-full px-4 py-2">
            <span>📊</span>
            <span className="text-sm text-slate-400">
              Total verbs: {verbsData.length} • Games: {games.length}
            </span>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
