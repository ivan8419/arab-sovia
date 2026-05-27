'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { getRandomVerbs, verbsData } from '@/data/verbs'
import { useAppStore } from '@/lib/store'
import { Fiil } from '@/types'
import confetti from 'canvas-confetti'
import { updateUserStats, getUserStats, initializeDb } from '@/lib/db'

interface Enemy {
  id: number
  x: number
  target: string
  verb: Fiil
  correctAnswer: string
  hp: number
  maxHp: number
}

export default function DefenseGame() {
  const [gameStarted, setGameStarted] = useState(false)
  const [score, setScore] = useState(0)
  const [wave, setWave] = useState(1)
  const [enemies, setEnemies] = useState<Enemy[]>([])
  const [playerHp, setPlayerHp] = useState(100)
  const [options, setOptions] = useState<string[]>([])
  const [castleShake, setCastleShake] = useState(false)
  const [loading, setLoading] = useState(true)

  const enemyIdRef = useRef(0)
  const { addXp, loseHeart, loadFromDb, xp, hearts } = useAppStore()

  // Load database
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

  // Find closest enemy
  const closestEnemy = enemies.reduce<Enemy | null>((closest, current) => {
    if (!closest) return current
    return current.x < closest.x ? current : closest
  }, null)

  // Generate options based on closest enemy
  useEffect(() => {
    if (!closestEnemy) {
      setOptions([])
      return
    }

    const correct = closestEnemy.correctAnswer
    const correctVerbConjugations = closestEnemy.verb.conjugations.map(
      (c) => c.madhi
    )
    const uniqueWrong = Array.from(
      new Set(correctVerbConjugations.filter((c) => c !== correct))
    )

    // Shuffle and pick 3 wrong options
    const wrong = uniqueWrong.sort(() => Math.random() - 0.5).slice(0, 3)

    // Fill to 3 if not enough
    while (wrong.length < 3) {
      const randomVerb = verbsData[Math.floor(Math.random() * verbsData.length)]
      const randomConj =
        randomVerb.conjugations[Math.floor(Math.random() * 14)].madhi
      if (randomConj !== correct && !wrong.includes(randomConj)) {
        wrong.push(randomConj)
      }
    }

    setOptions([correct, ...wrong].sort(() => Math.random() - 0.5))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [closestEnemy?.id])

  // Spawn enemy
  const spawnEnemy = useCallback(() => {
    setEnemies((prev) => {
      if (prev.length >= 4) return prev

      const verbs = getRandomVerbs(1)
      const verb = verbs[0]
      const dhomirIndex = Math.floor(Math.random() * 14)
      const conjugation = verb.conjugations[dhomirIndex]

      const newEnemy: Enemy = {
        id: enemyIdRef.current++,
        x: 95,
        target: conjugation.dhomirLabel,
        verb: verb,
        correctAnswer: conjugation.madhi,
        hp: 30,
        maxHp: 30,
      }

      return [...prev, newEnemy]
    })
  }, [])

  // Start game
  const startGame = useCallback(() => {
    setScore(0)
    setWave(1)
    setPlayerHp(100)
    setEnemies([])
    setGameStarted(true)
  }, [])

  // Wave system & Spawning timer
  useEffect(() => {
    if (!gameStarted) return

    const spawnTimer = setInterval(
      () => {
        spawnEnemy()
      },
      Math.max(1500, 3500 - wave * 300)
    )

    return () => clearInterval(spawnTimer)
  }, [gameStarted, wave, spawnEnemy])

  // Enemy movement loop
  useEffect(() => {
    if (!gameStarted) return

    const moveEnemies = setInterval(() => {
      setEnemies((prev) => {
        const nextEnemies = []
        let hits = 0

        for (const enemy of prev) {
          const nextX = enemy.x - (0.4 + wave * 0.05)
          if (nextX <= 15) {
            hits++
          } else {
            nextEnemies.push({ ...enemy, x: nextX })
          }
        }

        if (hits > 0) {
          // Defer side effects to avoid "setState during render" warning
          setTimeout(() => {
            setPlayerHp((hp) => Math.max(0, hp - 20 * hits))
            for (let i = 0; i < hits; i++) {
              loseHeart()
            }

            // Sync loss to DB
            async function syncLoss() {
              const stats = await getUserStats()
              if (stats) {
                await updateUserStats({
                  hearts: Math.max(0, stats.hearts - hits),
                })
              }
            }
            syncLoss()

            setCastleShake(true)
            setTimeout(() => setCastleShake(false), 500)
          }, 0)
        }

        return nextEnemies
      })
    }, 50)

    return () => clearInterval(moveEnemies)
  }, [gameStarted, wave, loseHeart])

  // Check Game Over
  useEffect(() => {
    if (playerHp <= 0 || hearts <= 0) {
      setGameStarted(false)
    }
  }, [playerHp, hearts])

  // Handle answer click
  const handleAnswer = async (option: string) => {
    if (!closestEnemy) return

    if (option === closestEnemy.correctAnswer) {
      // CORRECT
      const targetId = closestEnemy.id

      // Decrease HP
      setEnemies((prev) =>
        prev.map((e) => {
          if (e.id === targetId) {
            return { ...e, hp: Math.max(0, e.hp - 30) }
          }
          return e
        })
      )

      // Sparkle/hit score
      setScore((s) => s + 50)
      addXp(15)

      // Sync XP
      const stats = await getUserStats()
      if (stats) {
        await updateUserStats({
          totalXp: stats.totalXp + 15,
        })
      }

      // Check if dead, trigger explode confetti
      setTimeout(() => {
        setEnemies((prev) =>
          prev.filter((e) => {
            if (e.id === targetId && e.hp <= 0) {
              confetti({
                particleCount: 15,
                spread: 30,
                origin: { x: Math.min(0.9, Math.max(0.2, e.x / 100)), y: 0.5 },
                colors: ['#3B82F6', '#60A5FA', '#93C5FD'],
              })
              // Update wave if all clear
              if (prev.length <= 1) {
                setWave((w) => w + 1)
              }
              return false
            }
            return true
          })
        )
      }, 50)
    } else {
      // WRONG
      loseHeart()
      setPlayerHp((hp) => Math.max(0, hp - 15))

      // Sync loss
      const stats = await getUserStats()
      if (stats) {
        await updateUserStats({
          hearts: Math.max(0, stats.hearts - 1),
        })
      }

      setCastleShake(true)
      setTimeout(() => setCastleShake(false), 500)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center text-white">
        <div className="animate-spin text-4xl">🛡️</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 text-white font-sans overflow-x-hidden">
      <header className="p-4 bg-slate-900/40 backdrop-blur-md sticky top-0 z-50">
        <nav className="flex justify-between items-center max-w-4xl mx-auto">
          <Link
            href="/games"
            className="text-2xl hover:scale-110 transition-transform"
          >
            ←
          </Link>
          <h1 className="text-xl font-bold flex items-center gap-2">
            🛡️ Fi&apos;il Defense{' '}
            <span className="text-xs bg-blue-500/20 px-2 py-0.5 rounded-full border border-blue-500/30 text-blue-300">
              Wave {wave}
            </span>
          </h1>
          <div className="flex gap-4">
            <span className="text-lg bg-slate-900/50 px-3 py-1 rounded-full border border-slate-800">
              ⚔️ {score}
            </span>
            <span className="text-lg bg-blue-900/50 px-3 py-1 rounded-full border border-blue-800">
              ❤️ {hearts} Nyawa
            </span>
          </div>
        </nav>
      </header>

      <main className="max-w-4xl mx-auto p-4 flex flex-col justify-center min-h-[calc(100vh-80px)]">
        {!gameStarted ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-12 px-6 bg-slate-900/50 border border-slate-800 rounded-3xl backdrop-blur-lg max-w-lg mx-auto"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{
                repeat: Infinity,
                duration: 2.5,
                ease: 'easeInOut',
              }}
              className="text-8xl mb-6 drop-shadow-[0_10px_20px_rgba(59,130,246,0.3)]"
            >
              🛡️
            </motion.div>
            <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
              Fi&apos;il Defense
            </h2>
            <p className="text-lg mb-8 text-slate-300">
              Jawab konjugasi fi&apos;il yang benar dari dhomir musuh yang
              mendekat sebelum mereka menyerang benteng!
            </p>
            {(playerHp <= 0 || hearts <= 0) && (
              <div className="mb-8 p-4 bg-rose-950/30 rounded-2xl border border-rose-800/40">
                <p className="text-2xl font-bold text-rose-400">Game Over!</p>
                <p className="text-lg text-slate-300">
                  Skor Akhir: {score} • Wave Tercapai: {wave}
                </p>
              </div>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startGame}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 px-10 py-4 rounded-2xl font-bold text-xl shadow-lg shadow-blue-500/20 border border-blue-400/20"
            >
              Mulai Pertahanan ⚔️
            </motion.button>
          </motion.div>
        ) : (
          <>
            {/* Healthbar castle */}
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2 text-slate-400">
                <span>Kekuatan Kastil</span>
                <span>{playerHp}% HP</span>
              </div>
              <div className="h-4 bg-slate-900 rounded-full overflow-hidden border border-slate-800 p-[2px]">
                <motion.div
                  animate={{ width: `${playerHp}%` }}
                  className={`h-full rounded-full transition-all duration-300 ${
                    playerHp > 60
                      ? 'bg-emerald-500'
                      : playerHp > 30
                        ? 'bg-yellow-500'
                        : 'bg-rose-500 animate-pulse'
                  }`}
                />
              </div>
            </div>

            {/* Arena Battle */}
            <div className="relative h-60 bg-slate-900/60 rounded-3xl mb-8 overflow-hidden border-2 border-slate-800/60 shadow-inner">
              {/* Grid Background Lines for TD effect */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px)] bg-[size:4rem_100%] opacity-10" />

              {/* Castle */}
              <motion.div
                animate={castleShake ? { x: [-10, 10, -10, 10, 0] } : {}}
                className={`absolute left-4 top-1/2 -translate-y-1/2 text-7xl z-10 transition-transform ${
                  castleShake
                    ? 'drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                    : ''
                }`}
              >
                🏰
              </motion.div>

              {/* Enemies */}
              <AnimatePresence>
                {enemies.map((enemy) => (
                  <motion.div
                    key={enemy.id}
                    initial={{ left: '100%', opacity: 0 }}
                    animate={{ left: `${enemy.x}%`, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center z-20"
                    style={{ transform: 'translate(-50%, -50%)' }}
                  >
                    {/* Enemy HP and Label */}
                    <div className="bg-slate-950/80 px-2 py-0.5 rounded border border-slate-700 text-[10px] text-blue-300 font-bold mb-1 shadow">
                      {enemy.verb.madhi}
                    </div>

                    <div
                      className="text-4xl mb-1 relative animate-bounce"
                      style={{ animationDuration: '2s' }}
                    >
                      👾
                    </div>

                    {/* Enemy HP Bar */}
                    <div className="w-14 h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-[1px]">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }}
                      />
                    </div>

                    {/* Target Dhomir */}
                    <span className="text-xs mt-1 bg-purple-600 px-2.5 py-0.5 rounded-full border border-purple-500 text-white font-bold shadow-md tracking-wide">
                      {enemy.target}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Question Bar */}
            {closestEnemy ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 mb-6 text-center shadow-lg"
              >
                <p className="text-xs uppercase tracking-wider text-blue-400 mb-2 font-bold">
                  Target Terdekat
                </p>
                <div className="flex justify-center items-center gap-4 mb-2">
                  <span className="text-3xl font-bold bg-purple-900/30 border border-purple-800/40 px-4 py-1 rounded-xl text-purple-300">
                    {closestEnemy.target}
                  </span>
                  <span className="text-xl text-slate-400">×</span>
                  <span className="text-2xl font-bold font-arabic text-white">
                    {closestEnemy.verb.madhi} ({closestEnemy.verb.meaning})
                  </span>
                </div>
                <p className="text-sm text-slate-400">
                  Pilih konjugasi madhi yang benar!
                </p>
              </motion.div>
            ) : (
              <div className="bg-slate-900/30 border border-slate-900 border-dashed rounded-2xl p-8 mb-6 text-center text-slate-500">
                Menunggu musuh muncul... 🛡️
              </div>
            )}

            {/* Answers Options Grid */}
            <div className="grid grid-cols-2 gap-4">
              {options.map((option, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAnswer(option)}
                  disabled={!closestEnemy}
                  className="p-4 rounded-2xl bg-blue-900/30 border-2 border-blue-800/40 hover:border-blue-500 hover:bg-blue-900/50 font-arabic text-xl font-bold text-center disabled:opacity-50 disabled:cursor-not-allowed transition-all text-white"
                  dir="rtl"
                >
                  {option}
                </motion.button>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
