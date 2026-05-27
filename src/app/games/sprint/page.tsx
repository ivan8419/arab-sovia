'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { getRandomVerbs } from '@/data/verbs'
import { useAppStore } from '@/lib/store'
import confetti from 'canvas-confetti'

interface SprintQuestion {
  verbId: string
  madhi: string
  dhomir: string
  dhomirLabel: string
  answer: string
}

export default function SprintGame() {
  const [gameStarted, setGameStarted] = useState(false)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [currentQuestion, setCurrentQuestion] = useState<SprintQuestion | null>(
    null
  )
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [combo, setCombo] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [speed, setSpeed] = useState(1)
  const inputRef = useRef<HTMLInputElement>(null)
  const { addXp, loseHeart } = useAppStore()

  const generateQuestion = useCallback(() => {
    const verbs = getRandomVerbs(1)
    const verb = verbs[0]
    const dhomirIndex = Math.floor(Math.random() * 7)
    const conjugation = verb.conjugations[dhomirIndex]

    setCurrentQuestion({
      verbId: verb.id,
      madhi: verb.madhi,
      dhomir: conjugation.dhomir,
      dhomirLabel: conjugation.dhomirLabel,
      answer: conjugation.madhi,
    })
    setTotalQuestions((t) => t + 1)
  }, [])

  const startGame = useCallback(() => {
    setScore(0)
    setCombo(0)
    setTimeLeft(60)
    setTotalQuestions(0)
    setSpeed(1)
    setGameStarted(true)
    generateQuestion()
  }, [generateQuestion])

  useEffect(() => {
    if (gameStarted && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft((t) => t - 1)
        if (timeLeft <= 45 && timeLeft > 30) setSpeed(1.2)
        else if (timeLeft <= 30 && timeLeft > 15) setSpeed(1.5)
        else if (timeLeft <= 15) setSpeed(2)
      }, 1000 / speed)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && gameStarted) {
      setGameStarted(false)
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FF9600', '#FFD700', '#FF6B00'],
      })
    }
  }, [timeLeft, gameStarted, speed])

  useEffect(() => {
    if (gameStarted && inputRef.current) {
      inputRef.current.focus()
    }
  }, [currentQuestion, gameStarted])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentQuestion || !input.trim()) return

    const isCorrect =
      input.trim().toLowerCase() === currentQuestion.answer.toLowerCase()

    if (isCorrect) {
      setScore((s) => s + 20 + combo * 5)
      setCombo((c) => c + 1)
      addXp(10)
      setFeedback('correct')
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#58CC02'],
        gravity: 2,
      })
    } else {
      setCombo(0)
      loseHeart()
      setFeedback('wrong')
    }

    setTimeout(() => {
      setFeedback(null)
      setInput('')
      generateQuestion()
    }, 500)
  }

  const timerPercentage = (timeLeft / 60) * 100
  const timerColor =
    timeLeft > 30
      ? 'bg-green-500'
      : timeLeft > 15
        ? 'bg-yellow-500'
        : 'bg-red-500'

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900 via-red-800 to-yellow-900 text-white">
      <header className="p-4">
        <nav className="flex justify-between items-center max-w-4xl mx-auto">
          <Link href="/games" className="text-2xl">
            ←
          </Link>
          <h1 className="text-xl font-bold">🏃 Conjugation Sprint</h1>
          <div className="flex gap-4">
            <span className="text-xl">⚡ {score}</span>
          </div>
        </nav>
      </header>

      <main className="max-w-2xl mx-auto p-4">
        {!gameStarted ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-16"
          >
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-8xl mb-6"
            >
              🏃
            </motion.div>
            <h2 className="text-4xl font-bold mb-4">Conjugation Sprint</h2>
            <p className="text-xl mb-4 opacity-80">
              Ketik jawaban dengan cepat sebelum waktu habis!
            </p>
            {totalQuestions > 0 && (
              <div className="mb-6 bg-white/20 rounded-xl p-4">
                <p className="text-2xl font-bold">Skor Terakhir: {score}</p>
                <p className="opacity-80">
                  Pertanyaan dijawab: {totalQuestions}
                </p>
              </div>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startGame}
              className="bg-gradient-to-r from-orange-500 to-red-500 px-8 py-4 rounded-xl font-bold text-xl"
            >
              ابدأ الركض 🏁
            </motion.button>
          </motion.div>
        ) : (
          <>
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span>⏱️ Waktu</span>
                <span>{timeLeft}s</span>
              </div>
              <div className="h-4 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  animate={{ width: `${timerPercentage}%` }}
                  className={`h-full ${timerColor}`}
                />
              </div>
            </div>

            <motion.div
              animate={{ scale: speed > 1.5 ? 1.02 : 1 }}
              className="bg-white/10 rounded-2xl p-6 mb-6 text-center"
            >
              <p className="text-sm opacity-70 mb-2">Konjugasikan dengan:</p>
              <p className="text-3xl font-bold mb-2">
                {currentQuestion?.dhomirLabel}
              </p>
              <p className="text-lg opacity-70">
                (untuk kata kerja: {currentQuestion?.madhi})
              </p>
            </motion.div>

            {combo > 2 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-center mb-4"
              >
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  className="bg-yellow-500 px-4 py-2 rounded-full font-bold text-lg"
                >
                  🔥 Combo x{combo}! Kecepataan: {speed.toFixed(1)}x
                </motion.span>
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              <motion.form
                key={currentQuestion?.verbId}
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -50, opacity: 0 }}
                onSubmit={handleSubmit}
                className="text-center"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="اكتب التصريف..."
                  className={`w-full p-4 rounded-xl text-xl text-center font-arabic
                    ${feedback === 'correct' ? 'bg-green-500/50 border-green-500' : ''}
                    ${feedback === 'wrong' ? 'bg-red-500/50 border-red-500 animate-shake' : ''}
                    bg-white/20 border-2 border-white/30 focus:border-white/60 outline-none text-black text-2xl`}
                  dir="rtl"
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={!input.trim()}
                  className="w-full mt-4 bg-gradient-to-r from-orange-500 to-red-500 py-4 rounded-xl font-bold text-xl disabled:opacity-50"
                >
                  تحقق ✓
                </motion.button>
              </motion.form>
            </AnimatePresence>

            <div className="mt-8 text-center text-sm opacity-60">
              <p>
                Pertanyaan: {totalQuestions} • Combo: {combo}
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
