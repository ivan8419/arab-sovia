'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { getRandomVerbs } from '@/data/verbs'
import { useAppStore } from '@/lib/store'
import confetti from 'canvas-confetti'

interface GuessResult {
  letter: string
  status: 'correct' | 'present' | 'absent'
}

export default function RootleGame() {
  const [gameStarted, setGameStarted] = useState(false)
  const [targetVerb, setTargetVerb] = useState<any>(null)
  const [guesses, setGuesses] = useState<string[]>([])
  const [currentGuess, setCurrentGuess] = useState('')
  const [gameOver, setGameOver] = useState(false)
  const [won, setWon] = useState(false)
  const [results, setResults] = useState<GuessResult[][]>([])
  const { addXp, loadFromDb } = useAppStore()

  const targetRoot = targetVerb?.root.replace(/-/g, '') || ''
  const maxAttempts = 6

  const startGame = useCallback(() => {
    const verbs = getRandomVerbs(1)
    setTargetVerb(verbs[0])
    setGuesses([])
    setCurrentGuess('')
    setGameOver(false)
    setWon(false)
    setResults([])
    setGameStarted(true)
  }, [])

  useEffect(() => {
    if (!gameStarted) {
      startGame()
    }
  }, [gameStarted, startGame])

  const checkGuess = useCallback(() => {
    if (!currentGuess || currentGuess.length < 3 || gameOver) return

    const guess = currentGuess.toLowerCase()
    const target = targetRoot.toLowerCase()
    const newResults: GuessResult[] = []

    for (let i = 0; i < guess.length; i++) {
      if (target.includes(guess[i])) {
        if (target[i] === guess[i]) {
          newResults.push({ letter: guess[i], status: 'correct' })
        } else {
          newResults.push({ letter: guess[i], status: 'present' })
        }
      } else {
        newResults.push({ letter: guess[i], status: 'absent' })
      }
    }

    setResults([...results, newResults])
    setGuesses([...guesses, guess])
    setCurrentGuess('')

    if (guess === target || guesses.length + 1 >= maxAttempts) {
      setGameOver(true)
      if (guess === target) {
        setWon(true)
        addXp(50)
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
        })
      }
    }
  }, [currentGuess, gameOver, results, guesses, targetRoot, addXp])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      checkGuess()
    } else if (e.key === 'Backspace') {
      setCurrentGuess(currentGuess.slice(0, -1))
    } else if (
      /^[ةتثجحخسشصضطظعغفقكلمنهوي]$/.test(e.key) &&
      currentGuess.length < 4
    ) {
      setCurrentGuess(currentGuess + e.key)
    }
  }

  if (!gameStarted || !targetVerb) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="text-6xl"
        >
          🎮
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <header className="p-4">
        <nav className="flex justify-between items-center max-w-2xl mx-auto">
          <Link href="/games" className="text-2xl">
            ←
          </Link>
          <h1 className="text-xl font-bold">🎮 Rootle</h1>
          <button onClick={startGame} className="text-xl">
            🔄
          </button>
        </nav>
      </header>

      <main className="max-w-2xl mx-auto p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center mb-8"
        >
          <p className="text-2xl font-bold mb-2">Rootle</p>
          <p className="text-sm opacity-70">
            Tebak akar kata Arab dalam 6 percobaan!
          </p>
          <p className="text-xs opacity-50 mt-2">
            Petunjuk: Ini adalah kata kerja &quot;{targetVerb?.meaning}&quot;
          </p>
        </motion.div>

        <div className="grid grid-cols-4 gap-2 mb-4 max-w-xs mx-auto">
          {Array.from({ length: maxAttempts }).map((_, rowIndex) => (
            <div key={rowIndex} className="contents">
              {Array.from({ length: 4 }).map((_, colIndex) => {
                const guess = guesses[rowIndex]
                const result = results[rowIndex]
                const isCurrentRow = rowIndex === guesses.length
                const letter = guess ? guess[colIndex] : ''
                const status = result ? result[colIndex]?.status : ''

                return (
                  <motion.div
                    key={`${rowIndex}-${colIndex}`}
                    animate={{
                      rotateX: letter && !isCurrentRow ? 180 : 0,
                    }}
                    transition={{ duration: 0.3 }}
                    className={`w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center 
                      text-2xl font-bold rounded-lg border-2
                      ${
                        !letter && !isCurrentRow
                          ? 'border-slate-700 bg-transparent'
                          : status === 'correct'
                            ? 'bg-green-600 border-green-500'
                            : status === 'present'
                              ? 'bg-yellow-600 border-yellow-500'
                              : status === 'absent'
                                ? 'bg-slate-700 border-slate-600'
                                : isCurrentRow
                                  ? 'border-purple-500 bg-purple-500/20'
                                  : 'border-slate-700 bg-transparent'
                      }`}
                  >
                    <span
                      style={{
                        transform:
                          letter && !isCurrentRow ? 'rotateX(180deg)' : 'none',
                        display: 'inline-block',
                      }}
                    >
                      {letter}
                    </span>
                  </motion.div>
                )
              })}
            </div>
          ))}
        </div>

        {gameOver && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center mb-4"
          >
            <div
              className={`inline-block px-6 py-3 rounded-xl ${won ? 'bg-green-600' : 'bg-red-600'}`}
            >
              <p className="text-xl font-bold">
                {won ? '🎉 Benar!' : '😔 Salah!'}
              </p>
              <p className="text-sm">Akar kata yang benar: {targetRoot}</p>
            </div>
          </motion.div>
        )}

        <div className="text-center" onKeyDown={handleKeyDown}>
          {!gameOver && (
            <motion.input
              autoFocus
              type="text"
              value={currentGuess}
              onChange={(e) => setCurrentGuess(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ketik 4 huruf..."
              dir="rtl"
              className="w-48 p-3 rounded-xl bg-white/20 border-2 border-purple-500 text-center text-2xl mb-4 outline-none"
              maxLength={4}
            />
          )}

          {!gameOver && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={checkGuess}
              disabled={currentGuess.length < 3}
              className="bg-purple-600 px-8 py-3 rounded-xl font-bold disabled:opacity-50"
            >
              Tebak ✓
            </motion.button>
          )}

          {gameOver && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startGame}
              className="bg-purple-600 px-8 py-3 rounded-xl font-bold"
            >
              Main Lagi 🔄
            </motion.button>
          )}
        </div>

        <div className="text-center mt-8 text-sm opacity-60">
          <p>
            Akar kata dari: {targetVerb?.madhi} ({targetVerb?.meaning})
          </p>
        </div>
      </main>
    </div>
  )
}
