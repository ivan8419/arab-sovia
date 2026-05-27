'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { getRandomVerbs, verbsData } from '@/data/verbs'
import { useAppStore } from '@/lib/store'
import confetti from 'canvas-confetti'

export default function RapidFireGame() {
  const [gameStarted, setGameStarted] = useState(false)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [question, setQuestion] = useState<any>(null)
  const [options, setOptions] = useState<string[]>([])
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [correctAnswer, setCorrectAnswer] = useState<string | null>(null)
  const [streak, setStreak] = useState(0)
  const [backgroundColor, setBackgroundColor] = useState(
    'from-blue-600 to-indigo-700'
  )
  const { addXp, loseHeart } = useAppStore()
  const buttonRef = useRef<HTMLButtonElement>(null)

  const generateQuestion = useCallback(() => {
    const verbs = getRandomVerbs(1)
    const verb = verbs[0]
    const dhomirIndex = Math.floor(Math.random() * 7)
    const conjugation = verb.conjugations[dhomirIndex]
    const correct = conjugation.madhi

    const allConjugations = verbsData.flatMap((v) =>
      v.conjugations.map((c) => c.madhi)
    )
    const wrong = allConjugations
      .filter((c) => c !== correct)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)

    setOptions([correct, ...wrong].sort(() => Math.random() - 0.5))
    setQuestion({
      verb: verb,
      dhomir: conjugation.dhomirLabel,
      answer: correct,
    })
    setCorrectAnswer(null)
    setSelectedAnswer(null)
  }, [])

  const startGame = useCallback(() => {
    setScore(0)
    setStreak(0)
    setTimeLeft(60)
    setBackgroundColor('from-blue-600 to-indigo-700')
    setGameStarted(true)
    generateQuestion()
  }, [generateQuestion])

  useEffect(() => {
    if (gameStarted && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && gameStarted) {
      setGameStarted(false)
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#3B82F6', '#8B5CF6', '#F59E0B'],
      })
    }
  }, [timeLeft, gameStarted])

  useEffect(() => {
    if (gameStarted && buttonRef.current) {
      buttonRef.current.focus()
    }
  }, [question, gameStarted])

  const handleAnswer = (answer: string) => {
    if (selectedAnswer) return

    setSelectedAnswer(answer)
    const isCorrect = answer === question.answer

    if (isCorrect) {
      setScore((s) => s + 25 + streak * 10)
      setStreak((s) => s + 1)
      addXp(15)

      const colors = [
        'from-blue-600 to-indigo-700',
        'from-green-600 to-emerald-700',
        'from-purple-600 to-pink-700',
        'from-yellow-600 to-orange-700',
        'from-red-600 to-rose-700',
      ]
      setBackgroundColor(colors[Math.floor(Math.random() * colors.length)])

      confetti({
        particleCount: 20,
        spread: 40,
        origin: { y: 0.7 },
      })
    } else {
      setStreak(0)
      loseHeart()
    }

    setCorrectAnswer(question.answer)

    setTimeout(() => {
      generateQuestion()
    }, 400)
  }

  const timerPercentage = (timeLeft / 60) * 100

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${backgroundColor} text-white transition-colors duration-500`}
    >
      <header className="p-4">
        <nav className="flex justify-between items-center max-w-4xl mx-auto">
          <Link href="/games" className="text-2xl">
            ←
          </Link>
          <h1 className="text-xl font-bold">⚡ Rapid Fire</h1>
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
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 0.5 }}
              className="text-8xl mb-6"
            >
              ⚡
            </motion.div>
            <h2 className="text-4xl font-bold mb-4">Rapid Fire Duel</h2>
            <p className="text-xl mb-8 opacity-80">
              Jawab 60 detik nonstop! Seberapa cepat kamu?
            </p>
            {score > 0 && (
              <div className="mb-6 bg-white/20 rounded-xl p-4">
                <p className="text-3xl font-bold">Skor: {score}</p>
              </div>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startGame}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 px-8 py-4 rounded-xl font-bold text-xl"
            >
              ابدأ الآن 🚀
            </motion.button>
          </motion.div>
        ) : (
          <>
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span>⏱️ {timeLeft}s</span>
                {streak > 0 && (
                  <span className="text-yellow-400">🔥 x{streak}</span>
                )}
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  animate={{ width: `${timerPercentage}%` }}
                  className={`h-full ${timeLeft > 20 ? 'bg-white' : 'bg-red-500'}`}
                />
              </div>
            </div>

            <motion.div
              key={question?.verb?.id}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white/20 rounded-2xl p-8 mb-6 text-center"
            >
              <p className="text-sm opacity-70 mb-2">Apa past tense dari:</p>
              <p className="text-4xl font-bold mb-2">
                {question?.verb?.mudhari}
              </p>
              <p className="text-lg opacity-70">
                dengan dhomir: {question?.dhomir}
              </p>
            </motion.div>

            <div className="grid grid-cols-2 gap-3">
              {options.map((option, i) => (
                <motion.button
                  key={i}
                  ref={i === 0 ? buttonRef : undefined}
                  onClick={() => handleAnswer(option)}
                  disabled={!!selectedAnswer}
                  whileTap={{ scale: 0.95 }}
                  className={`p-4 rounded-xl font-arabic text-xl transition-all
                    ${
                      selectedAnswer === option
                        ? option === correctAnswer
                          ? 'bg-green-500 scale-105'
                          : 'bg-red-500'
                        : selectedAnswer && option === correctAnswer
                          ? 'bg-green-500/50'
                          : 'bg-white/20 hover:bg-white/30'
                    }`}
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
