'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { getRandomVerbs } from '@/data/verbs'
import { useAppStore } from '@/lib/store'
import { Fiil } from '@/types'
import confetti from 'canvas-confetti'
import { updateUserStats, getUserStats, initializeDb } from '@/lib/db'

interface MatchItem {
  id: string
  content: string
  type: 'verb' | 'meaning'
  verbId: string
}

export default function MatchGame() {
  const [gameStarted, setGameStarted] = useState(false)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [items, setItems] = useState<MatchItem[]>([])
  const [verbsList, setVerbsList] = useState<MatchItem[]>([])
  const [meaningsList, setMeaningsList] = useState<MatchItem[]>([])

  const [selectedVerb, setSelectedVerb] = useState<MatchItem | null>(null)
  const [selectedMeaning, setSelectedMeaning] = useState<MatchItem | null>(null)

  const [matchedPairs, setMatchedPairs] = useState<string[]>([])
  const [failedPairs, setFailedPairs] = useState<string[]>([])
  const [combo, setCombo] = useState(0)
  const [loading, setLoading] = useState(true)

  const { addXp, loseHeart, loadFromDb, xp, hearts } = useAppStore()

  useEffect(() => {
    async function init() {
      await initializeDb()
      const stats = await getUserStats()
      if (stats) {
        loadFromDb(stats, [])
      }
      setLoading(false)
    }
    init()
  }, [loadFromDb])

  const startGame = useCallback(() => {
    const verbs = getRandomVerbs(5)
    const vList: MatchItem[] = []
    const mList: MatchItem[] = []

    verbs.forEach((verb) => {
      vList.push({
        id: `verb-${verb.id}`,
        content: verb.madhi,
        type: 'verb',
        verbId: verb.id,
      })
      mList.push({
        id: `meaning-${verb.id}`,
        content: verb.meaning,
        type: 'meaning',
        verbId: verb.id,
      })
    })

    // Shuffle lists independently
    setVerbsList(vList.sort(() => Math.random() - 0.5))
    setMeaningsList(mList.sort(() => Math.random() - 0.5))

    setMatchedPairs([])
    setFailedPairs([])
    setSelectedVerb(null)
    setSelectedMeaning(null)
    setScore(0)
    setCombo(0)
    setTimeLeft(60)
    setGameStarted(true)
  }, [])

  useEffect(() => {
    if (gameStarted && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && gameStarted) {
      setGameStarted(false)
    }
  }, [timeLeft, gameStarted])

  const handleCardClick = async (item: MatchItem) => {
    if (matchedPairs.includes(item.verbId) || failedPairs.includes(item.id))
      return

    if (item.type === 'verb') {
      if (selectedVerb?.id === item.id) {
        setSelectedVerb(null)
      } else {
        setSelectedVerb(item)
        if (selectedMeaning) {
          await checkMatch(item, selectedMeaning)
        }
      }
    } else {
      if (selectedMeaning?.id === item.id) {
        setSelectedMeaning(null)
      } else {
        setSelectedMeaning(item)
        if (selectedVerb) {
          await checkMatch(selectedVerb, item)
        }
      }
    }
  }

  const checkMatch = async (vItem: MatchItem, mItem: MatchItem) => {
    if (vItem.verbId === mItem.verbId) {
      // MATCH SUCCESS
      const newMatched = [...matchedPairs, vItem.verbId]
      setMatchedPairs(newMatched)
      setScore((s) => s + 100 + combo * 15)
      setCombo((c) => c + 1)
      addXp(15)

      // Save to IndexedDB
      const stats = await getUserStats()
      if (stats) {
        await updateUserStats({
          totalXp: stats.totalXp + 15,
        })
      }

      setSelectedVerb(null)
      setSelectedMeaning(null)

      // Check if all pairs matched
      if (newMatched.length === verbsList.length) {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#58CC02', '#CE82FF', '#FF9600', '#FF4B4B'],
        })
        setTimeout(() => {
          setGameStarted(false)
        }, 1500)
      }
    } else {
      // MATCH FAILED
      setCombo(0)
      loseHeart()

      // Save to IndexedDB
      const stats = await getUserStats()
      if (stats) {
        await updateUserStats({
          hearts: Math.max(0, stats.hearts - 1),
        })
      }

      setFailedPairs([vItem.id, mItem.id])
      setSelectedVerb(null)
      setSelectedMeaning(null)

      setTimeout(() => {
        setFailedPairs([])
      }, 500)
    }
  }

  const progress = (matchedPairs.length / verbsList.length) * 100

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 flex items-center justify-center text-white">
        <div className="animate-spin text-4xl">⚡</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-purple-900 to-pink-950 text-white font-sans">
      <header className="p-4 bg-purple-950/40 backdrop-blur-md sticky top-0 z-50">
        <nav className="flex justify-between items-center max-w-4xl mx-auto">
          <Link
            href="/games"
            className="text-2xl hover:scale-110 transition-transform"
          >
            ←
          </Link>
          <h1 className="text-xl font-bold flex items-center gap-2">
            🎯 Verb Match Arena{' '}
            <span className="text-xs bg-pink-500/20 px-2 py-0.5 rounded-full border border-pink-500/30 text-pink-300">
              Fi&apos;il & Arti
            </span>
          </h1>
          <div className="flex gap-4">
            <span className="text-lg bg-purple-900/50 px-3 py-1 rounded-full border border-purple-800">
              ⏱️ {timeLeft}s
            </span>
            <span className="text-lg bg-pink-900/50 px-3 py-1 rounded-full border border-pink-800">
              ⚡ {score}
            </span>
          </div>
        </nav>
      </header>

      <main className="max-w-2xl mx-auto p-4 flex flex-col justify-center min-h-[calc(100vh-80px)]">
        {!gameStarted ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-12 px-6 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-lg"
          >
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              className="text-8xl mb-6 drop-shadow-[0_10px_20px_rgba(236,72,153,0.3)]"
            >
              🎯
            </motion.div>
            <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-400">
              Verb Match Arena
            </h2>
            <p className="text-lg mb-8 text-purple-200/80">
              Pilih kata kerja Arab (Fi&apos;il) di sebelah kanan, dan cocokkan
              dengan artinya di sebelah kiri!
            </p>
            {score > 0 && (
              <div className="mb-8 p-4 bg-purple-900/30 rounded-2xl border border-purple-800/40 max-w-xs mx-auto">
                <p className="text-2xl font-bold text-pink-300">
                  Skor Akhir: {score}
                </p>
                <p className="text-sm text-purple-300/70">
                  Dapatkan bonus XP tambahan!
                </p>
              </div>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startGame}
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 px-10 py-4 rounded-2xl font-bold text-xl shadow-lg shadow-pink-500/20 border border-pink-400/20"
            >
              ابدأ اللعب 🎮
            </motion.button>
          </motion.div>
        ) : (
          <>
            <div className="mb-8">
              <div className="flex justify-between text-sm mb-2 text-purple-300">
                <span>Progress Kecocokan</span>
                <span>
                  {matchedPairs.length} / {verbsList.length} Pasangan
                </span>
              </div>
              <div className="h-3 bg-purple-950 rounded-full overflow-hidden border border-purple-800/50 p-[2px]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"
                />
              </div>
            </div>

            {combo > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [1.2, 1] }}
                className="text-center mb-6"
              >
                <span className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-5 py-2 rounded-full font-bold text-lg shadow-lg border border-orange-400/30 animate-pulse">
                  🔥 Combo x{combo}!
                </span>
              </motion.div>
            )}

            <div className="bg-slate-950/40 backdrop-blur-2xl border border-white/10 p-4 sm:p-8 rounded-[2.5rem] shadow-[0_8px_32px_rgba(0,0,0,0.5)] relative overflow-hidden">
              {/* Decorative blobs for glassmorphism depth */}
              <div className="absolute top-0 left-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

              <div className="relative grid grid-cols-2 gap-4 sm:gap-8 items-start">
                {/* MEANINGS COLUMN (INDONESIAN) - Left side visually in LTR layout */}
                <div className="space-y-4">
                  <h3 className="text-xs sm:text-sm font-bold text-pink-300/80 mb-4 tracking-[0.2em] uppercase text-center border-b border-pink-900/30 pb-3 flex items-center justify-center gap-2">
                    <span className="w-8 h-[1px] bg-pink-500/30 hidden sm:block"></span>
                    Arti Kata
                    <span className="w-8 h-[1px] bg-pink-500/30 hidden sm:block"></span>
                  </h3>
                  <AnimatePresence>
                    {meaningsList.map((item) => {
                      const isMatched = matchedPairs.includes(item.verbId)
                      const isSelected = selectedMeaning?.id === item.id
                      const isFailed = failedPairs.includes(item.id)

                      return (
                        <motion.button
                          key={item.id}
                          onClick={() => handleCardClick(item)}
                          disabled={isMatched}
                          whileHover={isMatched ? {} : { scale: 1.02 }}
                          whileTap={isMatched ? {} : { scale: 0.98 }}
                          animate={isFailed ? { x: [-6, 6, -6, 6, 0] } : {}}
                          transition={{ duration: 0.4 }}
                          className={`relative w-full min-h-[5rem] sm:min-h-[6rem] p-4 sm:p-5 flex items-center rounded-2xl sm:rounded-3xl text-left border transition-all font-bold shadow-lg overflow-hidden backdrop-blur-md group
                          ${
                            isMatched
                              ? 'bg-emerald-900/20 border-emerald-500/20 text-emerald-400/40 cursor-default opacity-60 scale-95 shadow-inner'
                              : isFailed
                                ? 'bg-rose-500/40 border-rose-400 text-white animate-shake shadow-[0_0_25px_rgba(225,29,72,0.5)]'
                                : isSelected
                                  ? 'bg-gradient-to-br from-pink-500/40 to-purple-500/40 border-pink-400 text-pink-50 shadow-[0_0_25px_rgba(236,72,153,0.5)] scale-[1.02] ring-2 ring-pink-400/50'
                                  : 'bg-white/10 border-white/20 hover:bg-white/15 hover:border-pink-300/50 text-white hover:shadow-[0_8px_30px_rgba(236,72,153,0.2)] hover:-translate-y-1'
                          }`}
                        >
                          <span className="relative z-10 text-sm sm:text-lg">
                            {item.content}
                          </span>

                          {/* Glass shine effect */}
                          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                          {/* Background glow when selected */}
                          {isSelected && (
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none"
                              animate={{ opacity: [0.3, 0.7, 0.3] }}
                              transition={{ repeat: Infinity, duration: 2 }}
                            />
                          )}
                          {isMatched && (
                            <motion.div
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500/50 text-xl"
                            >
                              ✓
                            </motion.div>
                          )}
                        </motion.button>
                      )
                    })}
                  </AnimatePresence>
                </div>

                {/* VERBS COLUMN (ARABIC) - Right side visually */}
                <div className="space-y-4">
                  <h3 className="text-xs sm:text-sm font-bold text-purple-300/80 mb-4 tracking-[0.2em] uppercase text-center border-b border-purple-900/30 pb-3 flex items-center justify-center gap-2">
                    <span className="w-8 h-[1px] bg-purple-500/30 hidden sm:block"></span>
                    Kata Kerja
                    <span className="w-8 h-[1px] bg-purple-500/30 hidden sm:block"></span>
                  </h3>
                  <AnimatePresence>
                    {verbsList.map((item) => {
                      const isMatched = matchedPairs.includes(item.verbId)
                      const isSelected = selectedVerb?.id === item.id
                      const isFailed = failedPairs.includes(item.id)

                      return (
                        <motion.button
                          key={item.id}
                          onClick={() => handleCardClick(item)}
                          disabled={isMatched}
                          whileHover={isMatched ? {} : { scale: 1.02 }}
                          whileTap={isMatched ? {} : { scale: 0.98 }}
                          animate={isFailed ? { x: [-6, 6, -6, 6, 0] } : {}}
                          transition={{ duration: 0.4 }}
                          className={`relative w-full min-h-[5rem] sm:min-h-[6rem] p-4 sm:p-5 flex items-center justify-center rounded-2xl sm:rounded-3xl text-center border font-arabic transition-all font-bold shadow-lg overflow-hidden backdrop-blur-md group
                          ${
                            isMatched
                              ? 'bg-emerald-900/20 border-emerald-500/20 text-emerald-400/40 cursor-default opacity-60 scale-95 shadow-inner'
                              : isFailed
                                ? 'bg-rose-500/40 border-rose-400 text-white animate-shake shadow-[0_0_25px_rgba(225,29,72,0.5)]'
                                : isSelected
                                  ? 'bg-gradient-to-bl from-purple-500/40 to-blue-500/40 border-purple-400 text-purple-50 shadow-[0_0_25px_rgba(168,85,247,0.5)] scale-[1.02] ring-2 ring-purple-400/50'
                                  : 'bg-white/10 border-white/20 hover:bg-white/15 hover:border-purple-300/50 text-white hover:shadow-[0_8px_30px_rgba(168,85,247,0.2)] hover:-translate-y-1'
                          }`}
                          dir="rtl"
                        >
                          <span className="relative z-10 text-2xl sm:text-3xl">
                            {item.content}
                          </span>

                          {/* Glass shine effect */}
                          <div className="absolute inset-0 bg-gradient-to-bl from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                          {/* Background glow when selected */}
                          {isSelected && (
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-l from-white/10 to-transparent pointer-events-none"
                              animate={{ opacity: [0.3, 0.7, 0.3] }}
                              transition={{ repeat: Infinity, duration: 2 }}
                            />
                          )}
                          {isMatched && (
                            <motion.div
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500/50 text-xl"
                            >
                              ✓
                            </motion.div>
                          )}
                        </motion.button>
                      )
                    })}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
