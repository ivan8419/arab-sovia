'use client'

import { useState, useEffect, useMemo, Suspense, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { verbsData, getVerbById } from '@/data/verbs'
import { useAppStore } from '@/lib/store'
import {
  updateVerbProgress,
  updateUserStats,
  getUserStats,
  getAllVerbProgress,
  initializeDb,
  restoreHearts,
} from '@/lib/db'
import { Fiil, Conjugation } from '@/types'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { createDistractors } from '@/lib/utils'

type QuizType = 'pilihan' | 'isiKosong' | 'tebakArti' | 'matching' | 'listening'

interface QuizQuestion {
  type: QuizType
  verb: Fiil
  conjugation?: Conjugation
  dhomirIndex?: number
}

function QuizInner() {
  const searchParams = useSearchParams()
  const initialVerbId = searchParams.get('verb')

  const [quizType, setQuizType] = useState<QuizType>('pilihan')
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string>('')
  const [inputAnswer, setInputAnswer] = useState('')
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [quizComplete, setQuizComplete] = useState(false)
  const [score, setScore] = useState(0)
  const [loading, setLoading] = useState(true)
  const [restoringHearts, setRestoringHearts] = useState(false)

  const { hearts, loseHeart, addXp, loadFromDb, currentVerb, setCurrentVerb } =
    useAppStore()

  const pickRandomVerb = () => {
    if (verbsData.length === 0) {
      return null
    }

    const randomIndex = Math.floor(Math.random() * verbsData.length)
    return verbsData[randomIndex]
  }

  useEffect(() => {
    async function init() {
      await initializeDb()
      const stats = await getUserStats()
      const progress = await getAllVerbProgress()
      if (stats) loadFromDb(stats, progress)
      setLoading(false)
    }
    init()
  }, [loadFromDb])

  const generateQuiz = useCallback((verb: Fiil, type: QuizType) => {
    const newQuestions: QuizQuestion[] = []
    const count = 10

    for (let i = 0; i < count; i++) {
      const dhomirIndex = Math.floor(Math.random() * 14)
      const conjugation = verb.conjugations[dhomirIndex]

      newQuestions.push({
        type,
        verb,
        conjugation,
        dhomirIndex,
      })
    }

    setQuestions(newQuestions)
    setCurrentIndex(0)
    setScore(0)
    setQuizComplete(false)
  }, [])

  const startQuiz = useCallback(
    (verb: Fiil, type: QuizType = quizType) => {
      setCurrentVerb(verb)
      generateQuiz(verb, type)
    },
    [generateQuiz, quizType, setCurrentVerb]
  )

  useEffect(() => {
    if (loading || quizComplete || questions.length > 0) {
      return
    }

    if (initialVerbId) {
      const requestedVerb = getVerbById(initialVerbId)
      if (requestedVerb) {
        startQuiz(requestedVerb, quizType)
        return
      }
    }

    if (currentVerb) {
      startQuiz(currentVerb, quizType)
      return
    }

    const fallbackVerb = pickRandomVerb()
    if (fallbackVerb) {
      startQuiz(fallbackVerb, quizType)
    }
  }, [
    currentVerb,
    initialVerbId,
    loading,
    questions.length,
    quizComplete,
    quizType,
    startQuiz,
  ])

  const currentQuestion = questions[currentIndex]

  const options = useMemo(() => {
    if (!currentQuestion) return []

    let correct = ''
    if (quizType === 'tebakArti') {
      correct = currentQuestion.verb.meaning
    } else {
      correct = currentQuestion.conjugation?.madhi || ''
    }

    let wrong: string[] = []
    if (quizType === 'tebakArti') {
      const allMeanings = verbsData.map((v) => v.meaning)
      wrong = createDistractors(correct, allMeanings)
    } else {
      const allConjugations = currentQuestion.verb.conjugations.map(
        (c) => c.madhi
      )
      wrong = createDistractors(correct, allConjugations)
    }

    return [...wrong, correct].sort(() => Math.random() - 0.5)
  }, [currentQuestion, quizType])

  const playAudio = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'ar-SA'
      speechSynthesis.speak(utterance)
    }
  }

  const handleAnswer = async (answer: string) => {
    if (showResult || !currentQuestion) return

    const correct =
      quizType === 'tebakArti'
        ? currentQuestion.verb.meaning
        : currentQuestion.conjugation?.madhi || ''
    const correctAnswer = answer.trim() === correct.trim()

    setSelectedAnswer(answer)
    setIsCorrect(correctAnswer)
    setShowResult(true)

    if (correctAnswer) {
      setScore((prev) => prev + 1)
      addXp(10)
    } else {
      loseHeart()
    }

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex((prev) => prev + 1)
        setShowResult(false)
        setSelectedAnswer('')
        setInputAnswer('')
      } else {
        setQuizComplete(true)
        async function saveProgress() {
          const verbId = currentQuestion.verb.id
          await updateVerbProgress(verbId, { status: 'sedang_dipelajari' })
          const stats = await getUserStats()
          if (stats) {
            await updateUserStats({
              totalXp: stats.totalXp + (correctAnswer ? 10 : 0),
              hearts: Math.max(0, stats.hearts - (correctAnswer ? 0 : 1)),
            })
          }
        }
        saveProgress()
      }
    }, 1500)
  }

  const startNewQuiz = () => {
    if (currentVerb) {
      generateQuiz(currentVerb, quizType)
    }
  }

  const handleRestoreHearts = async () => {
    setRestoringHearts(true)
    const restoredStats = await restoreHearts()
    const progress = await getAllVerbProgress()

    if (restoredStats) {
      loadFromDb(restoredStats, progress)
    }

    setRestoringHearts(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-2xl text-primary font-bold">جاري التحميل...</div>
      </div>
    )
  }

  if (hearts <= 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <div className="text-6xl mb-4">💔</div>
        <h1 className="text-2xl font-bold mb-4">انتهت قلوبك!</h1>
        <p className="text-muted-foreground mb-6 text-center max-w-sm">
          Hati Anda di penyimpanan lokal sedang habis. Anda bisa isi ulang lagi
          untuk lanjut belajar.
        </p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Button
            size="lg"
            className="font-bold"
            onClick={handleRestoreHearts}
            disabled={restoringHearts}
          >
            {restoringHearts ? 'Mengisi ulang...' : 'Isi ulang hati'}
          </Button>
          <Link href="/settings" prefetch={false}>
            <Button variant="outline" size="lg" className="w-full font-bold">
              Buka pengaturan
            </Button>
          </Link>
          <Link href="/" prefetch={false}>
            <Button variant="secondary" size="lg" className="w-full font-bold">
              العودة للرئيسية
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  if (verbsData.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-2xl font-bold mb-3">Data kuis belum tersedia</h1>
        <p className="text-muted-foreground mb-6">
          Tambahkan data kata kerja terlebih dahulu agar halaman quiz bisa
          digunakan.
        </p>
        <Link href="/verbs" prefetch={false}>
          <Button size="lg" className="font-bold">
            Buka daftar fi&apos;il
          </Button>
        </Link>
      </div>
    )
  }

  if (questions.length === 0 && !quizComplete) {
    return (
      <div className="min-h-screen bg-white">
        <header className="bg-primary p-4 text-white">
          <nav className="flex justify-between items-center max-w-4xl mx-auto">
            <Link
              href="/"
              className="text-2xl hover:opacity-80 transition-opacity"
            >
              ←
            </Link>
            <h1 className="text-xl font-bold">تمارين</h1>
            <div className="text-xl">❤️ {hearts}</div>
          </nav>
        </header>

        <main className="max-w-4xl mx-auto p-4">
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-bold mb-2 text-right">ابدأ التمرين</h2>
            <p className="text-sm text-muted-foreground mb-4 text-right">
              Jika tidak memilih fi&apos;il tertentu, kuis akan dibuat otomatis
              dari data acak.
            </p>
            <select
              value={quizType}
              onChange={(e) => setQuizType(e.target.value as QuizType)}
              className="w-full p-3 border border-gray-300 rounded-xl text-right outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="pilihan">اختر التصريف الصحيح</option>
              <option value="isiKosong">املأ الفراغ</option>
              <option value="tebakArti">تخيل المعنى</option>
              <option value="matching">مطابقة (Matching)</option>
              <option value="listening">استماع (Listening)</option>
            </select>
            <Button
              size="lg"
              className="w-full mt-4 font-bold"
              onClick={() => {
                const fallbackVerb = pickRandomVerb()
                if (fallbackVerb) {
                  startQuiz(fallbackVerb, quizType)
                }
              }}
            >
              Mulai kuis acak
            </Button>
          </Card>

          <Card className="p-6 mb-6">
            <h2 className="text-xl font-bold mb-4 text-right">
              اختر فعل للتدرب
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {verbsData.slice(0, 10).map((verb) => (
                <button
                  key={verb.id}
                  onClick={() => {
                    startQuiz(verb, quizType)
                  }}
                  className="bg-gray-50 border border-gray-200 rounded-xl p-4 hover:border-primary hover:bg-green-50 transition-colors text-right"
                >
                  <div className="font-arabic text-lg font-bold text-gray-800">
                    {verb.madhi}
                  </div>
                  <div className="text-sm text-muted-foreground">{verb.meaning}</div>
                </button>
              ))}
            </div>
          </Card>

          <Link
            href="/verbs"
            className="block text-center text-primary py-3 font-semibold hover:underline"
          >
            عرض جميع الأفعال →
          </Link>
        </main>
      </div>
    )
  }

  if (quizComplete) {
    const percentage = Math.round((score / questions.length) * 100)

    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <div className="text-6xl mb-4">{percentage >= 70 ? '🎉' : '💪'}</div>
        <h1 className="text-2xl font-bold mb-2">
          {percentage >= 70 ? 'أحسنت!' : 'حاول مرة أخرى!'}
        </h1>
        <div className="text-6xl font-bold text-primary mb-4">
          {score}/{questions.length}
        </div>
        <div className="text-xl text-muted-foreground mb-6">
          ({percentage}% إجابات صحيحة)
        </div>

        <div className="flex gap-3">
          <Button onClick={startNewQuiz} size="lg" className="font-bold">
            جرب مرة أخرى
          </Button>
          <Link href="/">
            <Button variant="secondary" size="lg" className="font-bold">
              العودة
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-primary p-4 text-white sticky top-0 z-10 shadow-sm">
        <nav className="flex justify-between items-center max-w-4xl mx-auto">
          <Link
            href="/verbs"
            className="text-2xl hover:opacity-80 transition-opacity"
          >
            ←
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-xl font-bold">❤️ {hearts}</span>
            <span className="text-xl font-bold">⚡ {score * 10}</span>
          </div>
        </nav>
      </header>

      <div className="bg-gray-100 py-3 px-4 shadow-inner">
        <div className="max-w-4xl mx-auto">
          <Progress
            value={(currentIndex / questions.length) * 100}
            className="h-3"
          />
        </div>
      </div>

      <main className="max-w-4xl mx-auto p-4">
        <div className="text-center mb-6">
          <div className="text-sm text-muted-foreground mb-2">
            {currentQuestion?.verb
              ? `${currentQuestion.verb.meaning} • ${currentQuestion.verb.madhi}`
              : 'Kuis sedang disiapkan'}
          </div>
          <span className="text-sm font-semibold text-muted-foreground">
            سؤال {currentIndex + 1} من {questions.length}
          </span>
        </div>

        <Card className="bg-green-50 border-green-200 p-8 mb-6 shadow-sm">
          {(quizType === 'pilihan' || quizType === 'matching') && (
            <div className="text-center">
              <div className="text-lg text-green-700 font-semibold mb-3">
                ما تصريف الماضي مع:
              </div>
              <div className="text-5xl font-arabic font-bold text-gray-800">
                {currentQuestion?.conjugation?.dhomirLabel}
              </div>
            </div>
          )}

          {quizType === 'isiKosong' && (
            <div className="text-center">
              <div className="text-lg text-green-700 font-semibold mb-3">
                املأ الفراغ:
              </div>
              <div className="text-3xl font-arabic mb-4 font-bold text-gray-800">
                {currentQuestion?.conjugation?.dhomirLabel} ___ كل يوم
              </div>
              <div className="text-xl text-muted-foreground font-medium">
                ({currentQuestion?.verb.meaning})
              </div>
            </div>
          )}

          {quizType === 'tebakArti' && (
            <div className="text-center">
              <div className="text-lg text-green-700 font-semibold mb-3">
                ما معنى:
              </div>
              <div className="text-5xl font-arabic font-bold text-gray-800">
                {currentQuestion?.verb.madhi}
              </div>
            </div>
          )}

          {quizType === 'listening' && (
            <div className="text-center">
              <div className="text-lg text-green-700 font-semibold mb-6">
                استمع واكتب التصريف الصحيح:
              </div>
              <Button
                size="lg"
                className="rounded-full w-20 h-20 bg-blue-500 hover:bg-blue-600"
                onClick={() =>
                  playAudio(currentQuestion?.conjugation?.madhi || '')
                }
              >
                <span className="text-4xl">🔊</span>
              </Button>
              <div className="mt-4 text-muted-foreground font-arabic text-xl">
                {currentQuestion?.conjugation?.dhomirLabel}
              </div>
            </div>
          )}
        </Card>

        {(quizType === 'pilihan' ||
          quizType === 'tebakArti' ||
          quizType === 'matching') && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {options.map((option, i) => (
              <Button
                key={i}
                variant="outline"
                onClick={() => handleAnswer(option)}
                disabled={showResult}
                className={`w-full p-8 h-auto rounded-2xl border-2 text-right font-arabic text-2xl transition-all ${
                  showResult
                    ? option ===
                      (quizType === 'tebakArti'
                        ? currentQuestion?.verb.meaning
                        : currentQuestion?.conjugation?.madhi)
                      ? 'bg-green-500 border-green-600 text-white hover:bg-green-500'
                      : selectedAnswer === option
                        ? 'bg-red-500 border-red-600 text-white hover:bg-red-500'
                        : 'bg-gray-50 border-gray-200 opacity-50'
                    : 'bg-white border-gray-200 hover:border-primary hover:bg-green-50 text-gray-700'
                }`}
              >
                <span className="w-full block text-center">{option}</span>
              </Button>
            ))}
          </div>
        )}

        {(quizType === 'isiKosong' || quizType === 'listening') && (
          <div className="mt-4">
            <Input
              type="text"
              value={inputAnswer}
              onChange={(e) => setInputAnswer(e.target.value)}
              placeholder="اكتب التصريف..."
              disabled={showResult}
              className="w-full p-6 h-auto border-2 border-gray-300 rounded-2xl text-center text-3xl font-arabic focus-visible:ring-primary focus-visible:border-primary"
            />
            <Button
              size="lg"
              onClick={() => handleAnswer(inputAnswer)}
              disabled={showResult || !inputAnswer}
              className="w-full py-6 text-xl rounded-2xl font-bold mt-4"
            >
              تحقق
            </Button>
          </div>
        )}

        {showResult && (
          <Card
            className={`mt-6 p-6 rounded-2xl text-center border-2 ${
              isCorrect
                ? 'bg-green-100 border-green-200 text-green-800'
                : 'bg-red-100 border-red-200 text-red-800'
            }`}
          >
            <div className="text-3xl font-bold mb-2">
              {isCorrect ? '✓ إجابة صحيحة!' : '✗ إجابة خاطئة!'}
            </div>
            {!isCorrect && (
              <div className="font-arabic text-2xl mt-4 bg-white/50 p-4 rounded-xl inline-block">
                الإجابة الصحيحة:{' '}
                <strong className="text-green-700">
                  {quizType === 'tebakArti'
                    ? currentQuestion?.verb.meaning
                    : currentQuestion?.conjugation?.madhi}
                </strong>
              </div>
            )}
          </Card>
        )}
      </main>
    </div>
  )
}

function QuizFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-2xl text-primary font-bold">جاري التحميل...</div>
    </div>
  )
}

export default function QuizPage() {
  return (
    <Suspense fallback={<QuizFallback />}>
      <QuizInner />
    </Suspense>
  )
}
