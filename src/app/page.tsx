'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import { initializeDb, getUserStats, getAllVerbProgress } from '@/lib/db'
import { calculateMasteryPercentage } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function Home() {
  const [loading, setLoading] = useState(true)
  const { hearts, streak, xp, loadFromDb, verbProgress } = useAppStore()
  const [progressPercent, setProgressPercent] = useState(0)
  const [mounted, setMounted] = useState(false)
  const dailyGoal = 100
  const dailyGoalPercent = Math.min(100, Math.round((xp / dailyGoal) * 100))

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    async function loadData() {
      await initializeDb()
      const stats = await getUserStats()
      const progress = await getAllVerbProgress()

      if (stats) {
        loadFromDb(stats, progress)
      }
      setLoading(false)
    }
    loadData()
  }, [loadFromDb])

  useEffect(() => {
    setProgressPercent(calculateMasteryPercentage(verbProgress, 60))
  }, [verbProgress])

  if (loading || !mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-slate-900">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="text-6xl"
        >
          🏃
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-emerald-300 to-teal-400 dark:from-slate-900 dark:via-slate-800 dark:to-emerald-950 transition-colors duration-300">
      <header className="border-b border-white/20 bg-white/60 dark:bg-slate-900/80 backdrop-blur-md p-4 shadow-lg sticky top-0 z-50">
        <nav className="flex justify-between items-center max-w-4xl mx-auto">
          <div>
            <h1 className="text-xl font-bold text-white drop-shadow-md">
              Arab Sovia 🌙
            </h1>
            <p className="text-sm text-white/80">Belajar fi&apos;il + dhomir</p>
          </div>
          <Link
            href="/settings"
            className="text-2xl transition-transform hover:rotate-90 p-2 rounded-full bg-white/30 hover:bg-white/50 backdrop-blur-sm"
          >
            ⚙️
          </Link>
        </nav>
      </header>

      <main className="max-w-4xl mx-auto p-4">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-3xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-6 text-white shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-56 h-56 bg-yellow-400/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-primary/30 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2" />

          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.2em] font-semibold text-white/90">
                🎯 Arabic Learning Journey
              </p>
              <h2 className="text-3xl md:text-4xl font-bold leading-tight">
                Mulai Belajar
                <br />
                Bahasa Arab 🌙
              </h2>
              <p className="max-w-xl text-white/80 text-sm md:text-base">
                Kuasai 60+ fi&apos;il dengan 14 dhomir. belajar seperti bermain
                game!
              </p>
            </div>
            <Link href="/quiz" prefetch={false}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="h-auto rounded-2xl px-8 py-4 text-lg font-bold bg-white text-purple-600 hover:bg-white/90 shadow-xl"
              >
                Mulai Sekarang 🚀
              </motion.button>
            </Link>
          </div>
        </motion.section>

        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8"
        >
          {[
            {
              icon: '🔥',
              value: streak,
              label: 'Hari Streak',
              gradient: 'from-orange-500 to-red-500',
              shadow: 'shadow-orange-500/25',
              text: 'text-white',
            },
            {
              icon: '⚡',
              value: xp,
              label: 'Total XP',
              gradient: 'from-yellow-400 to-amber-500',
              shadow: 'shadow-yellow-500/25',
              text: 'text-white',
            },
            {
              icon: '❤️',
              value: hearts,
              label: 'Hearts',
              gradient: 'from-pink-500 to-rose-500',
              shadow: 'shadow-pink-500/25',
              text: 'text-white',
            },
            {
              icon: '📊',
              value: `${progressPercent}%`,
              label: 'Mastery',
              gradient: 'from-emerald-500 to-teal-500',
              shadow: 'shadow-emerald-500/25',
              text: 'text-white',
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              whileHover={{ scale: 1.05, y: -4 }}
              className={`rounded-2xl p-4 text-center shadow-lg bg-gradient-to-br ${stat.gradient} ${stat.shadow}`}
            >
              <div className="text-3xl md:text-4xl mb-1">{stat.icon}</div>
              <div className={`text-2xl md:text-3xl font-bold ${stat.text}`}>
                {stat.value}
              </div>
              <div className="text-xs md:text-sm font-semibold text-white/80">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="mb-6 bg-card dark:bg-slate-800/50 border-border/50 shadow-lg rounded-2xl overflow-hidden">
            <CardContent className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-bold">Progress Keseluruhan</h3>
                <span className="text-sm font-semibold text-primary">
                  {progressPercent}%
                </span>
              </div>
              <div className="w-full bg-muted dark:bg-slate-700 rounded-full h-6 mb-2 overflow-hidden shadow-inner">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="bg-gradient-to-r from-primary to-green-400 h-6 rounded-full shadow-sm"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {progressPercent}% dari 60 fi&apos;il sudah dikuasai
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="mb-8 bg-card dark:bg-slate-800/50 border-border/50 shadow-lg rounded-2xl overflow-hidden">
            <CardContent className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-bold">Daily Goal</h3>
                <span className="text-sm font-semibold text-muted-foreground">
                  {xp}/{dailyGoal} XP
                </span>
              </div>
              <div className="h-4 overflow-hidden rounded-full bg-muted dark:bg-slate-700">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${dailyGoalPercent}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-500"
                />
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                {dailyGoalPercent >= 100
                  ? '🎉 Daily goal tercapai! Keep it up!'
                  : `${dailyGoalPercent}% tercapai hari ini`}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              href: '/verbs',
              icon: '📖',
              title: "Daftar Fi'il",
              desc: 'Cari & pelajari 60+ kata kerja Arab',
              gradient:
                'from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-800/20',
              border: 'border-purple-200 dark:border-purple-800',
              hoverBorder: 'hover:border-purple-400',
              text: 'text-purple-700 dark:text-purple-400',
            },
            {
              href: '/quiz',
              icon: '✍️',
              title: 'Latihan Quiz',
              desc: '5 jenis latihan konjugasi',
              gradient:
                'from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/20',
              border: 'border-blue-200 dark:border-blue-800',
              hoverBorder: 'hover:border-blue-400',
              text: 'text-blue-700 dark:text-blue-400',
            },
            {
              href: '/games',
              icon: '🎮',
              title: 'Mini Games',
              desc: '6 permainan edukatif seru',
              gradient:
                'from-orange-100 to-yellow-50 dark:from-orange-900/30 dark:to-yellow-800/20',
              border: 'border-orange-200 dark:border-orange-800',
              hoverBorder: 'hover:border-orange-400',
              text: 'text-orange-700 dark:text-orange-400',
            },
          ].map((item, index) => (
            <motion.div
              key={item.href}
              whileHover={{ scale: 1.03, y: -4 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="flex"
            >
              <Link
                href={item.href}
                className={`block rounded-2xl border-4 ${item.border} ${item.hoverBorder} bg-gradient-to-br ${item.gradient} dark:bg-gradient-to-br p-6 transition-all hover:shadow-xl w-full flex flex-col justify-between min-h-[160px]`}
              >
                <div>
                  <div className="text-4xl mb-3">{item.icon}</div>
                  <h3 className={`mb-1 text-xl font-bold ${item.text}`}>
                    {item.title}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 p-4 rounded-2xl bg-muted/50 dark:bg-slate-800/30 text-center"
        >
          <p className="text-sm text-muted-foreground">
            💡 <strong>Tips:</strong> Gunakan mode gelap untuk belajar di malam
            hari
          </p>
        </motion.div>
      </main>
    </div>
  )
}
