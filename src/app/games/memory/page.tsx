'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { getRandomVerbs } from '@/data/verbs'
import { useAppStore } from '@/lib/store'
import confetti from 'canvas-confetti'

interface Card {
  id: string
  content: string
  type: 'madhi' | 'meaning'
  verbId: string
  matched?: boolean
}

export default function MemoryGame() {
  const [gameStarted, setGameStarted] = useState(false)
  const [cards, setCards] = useState<Card[]>([])
  const [flippedCards, setFlippedCards] = useState<Card[]>([])
  const [matchedPairs, setMatchedPairs] = useState<string[]>([])
  const [moves, setMoves] = useState(0)
  const [time, setTime] = useState(0)
  const [canFlip, setCanFlip] = useState(true)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const { addXp, loadFromDb } = useAppStore()

  const startGame = useCallback(() => {
    const verbs = getRandomVerbs(6)
    const newCards: Card[] = []

    verbs.forEach((verb) => {
      newCards.push({
        id: `madhi-${verb.id}`,
        content: verb.madhi,
        type: 'madhi',
        verbId: verb.id,
      })
      newCards.push({
        id: `meaning-${verb.id}`,
        content: verb.meaning,
        type: 'meaning',
        verbId: verb.id,
      })
    })

    setCards(newCards.sort(() => Math.random() - 0.5))
    setFlippedCards([])
    setMatchedPairs([])
    setMoves(0)
    setTime(0)
    setGameStarted(true)
    setCanFlip(true)
  }, [])

  useEffect(() => {
    if (gameStarted) {
      timerRef.current = setInterval(() => {
        setTime((t) => t + 1)
      }, 1000)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [gameStarted])

  useEffect(() => {
    if (flippedCards.length === 2 && canFlip) {
      setCanFlip(false)
      setMoves((m) => m + 1)

      const [card1, card2] = flippedCards

      if (card1.verbId === card2.verbId) {
        setMatchedPairs([...matchedPairs, card1.verbId])
        setFlippedCards([])
        setCanFlip(true)
        addXp(10)

        if (matchedPairs.length + 1 === cards.length / 2) {
          confetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.5 },
            colors: ['#58CC02', '#CE82FF', '#FFD700', '#FF4B4B'],
          })
        }
      } else {
        setTimeout(() => {
          setFlippedCards([])
          setCanFlip(true)
        }, 1000)
      }
    }
  }, [flippedCards, matchedPairs, cards.length, canFlip, addXp])

  const handleCardClick = (card: Card) => {
    if (
      !canFlip ||
      flippedCards.length >= 2 ||
      card.matched ||
      flippedCards.some((c) => c.id === card.id)
    )
      return
    setFlippedCards([...flippedCards, card])
  }

  const isFlipped = (card: Card) => {
    return (
      flippedCards.some((c) => c.id === card.id) ||
      card.matched ||
      matchedPairs.includes(card.verbId)
    )
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900 text-white">
      <header className="p-4">
        <nav className="flex justify-between items-center max-w-4xl mx-auto">
          <Link href="/games" className="text-2xl">
            ←
          </Link>
          <h1 className="text-xl font-bold">🧠 Memory Palace</h1>
          <div className="flex gap-4">
            <span className="text-xl">⏱️ {formatTime(time)}</span>
            <span className="text-xl">🔄 {moves}</span>
          </div>
        </nav>
      </header>

      <main className="max-w-4xl mx-auto p-4">
        {!gameStarted ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-16"
          >
            <motion.div
              animate={{ rotateY: [0, 360] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
              className="text-8xl mb-6 mx-auto w-32 h-32"
            >
              🧠
            </motion.div>
            <h2 className="text-4xl font-bold mb-4">Memory Palace</h2>
            <p className="text-xl mb-8 opacity-80">
              Balik kartu untuk mencocokkan فعل dengan artinya!
            </p>
            {matchedPairs.length > 0 && (
              <div className="mb-6 bg-white/20 rounded-xl p-4">
                <p className="text-2xl font-bold">Moves: {moves}</p>
                <p className="opacity-80">Time: {formatTime(time)}</p>
              </div>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startGame}
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 px-8 py-4 rounded-xl font-bold text-xl"
            >
              ابدأ اللعب 🃏
            </motion.button>
          </motion.div>
        ) : (
          <>
            <div className="mb-4 text-center">
              <span className="bg-white/20 px-4 py-2 rounded-full">
                pairs: {matchedPairs.length}/{cards.length / 2}
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              <AnimatePresence>
                {cards.map((card) => (
                  <motion.div
                    key={card.id}
                    initial={false}
                    animate={{
                      rotateY: isFlipped(card) ? 180 : 0,
                      scale: flippedCards.some((c) => c.id === card.id)
                        ? 1.05
                        : 1,
                    }}
                    transition={{ duration: 0.4 }}
                    onClick={() => handleCardClick(card)}
                    className="aspect-square cursor-pointer perspective-1000"
                    style={{ perspective: 1000 }}
                  >
                    <div
                      className={`w-full h-full relative transition-all duration-300
                        ${
                          isFlipped(card)
                            ? 'bg-emerald-500/50 border-emerald-400'
                            : 'bg-gradient-to-br from-emerald-600 to-teal-600 border-emerald-400'
                        } border-2 rounded-xl`}
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      {!isFlipped(card) && (
                        <div className="absolute inset-0 flex items-center justify-center text-4xl">
                          ❓
                        </div>
                      )}
                      {isFlipped(card) && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="absolute inset-0 flex items-center justify-center"
                          style={{ transform: 'rotateY(180deg)' }}
                        >
                          <span
                            className={`font-arabic text-lg sm:text-xl text-center p-2
                            ${matchedPairs.includes(card.verbId) ? 'text-emerald-200' : 'text-white'}`}
                          >
                            {card.content}
                          </span>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {matchedPairs.length === cards.length / 2 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-center mt-8"
              >
                <div className="bg-white/20 rounded-xl p-6 inline-block">
                  <h3 className="text-2xl font-bold mb-2">🎉 Selamat!</h3>
                  <p className="text-lg">
                    Moves: {moves} • Time: {formatTime(time)}
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={startGame}
                    className="mt-4 bg-emerald-500 px-6 py-3 rounded-xl font-bold"
                  >
                    Main Lagi 🔄
                  </motion.button>
                </div>
              </motion.div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
