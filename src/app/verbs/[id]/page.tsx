'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { getVerbById } from '@/data/verbs'
import { useAppStore } from '@/lib/store'
import {
  updateVerbProgress,
  initializeDb,
  getVerbProgress,
  getAllVerbProgress,
} from '@/lib/db'
import { Fiil } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ConjugationTable } from '@/components/learning/conjugation-table'
import { formatArabicRoot } from '@/lib/utils'

export default function VerbDetailPage() {
  const params = useParams()
  const [verb, setVerb] = useState<Fiil | null>(null)
  const [loading, setLoading] = useState(true)
  const { setCurrentVerb, verbProgress, setVerbProgress } = useAppStore()

  useEffect(() => {
    async function loadData() {
      await initializeDb()
      const verbId = params.id as string
      const foundVerb = getVerbById(verbId)

      if (foundVerb) {
        setVerb(foundVerb)
        setCurrentVerb(foundVerb)

        const progress = await getVerbProgress(verbId)
        if (!progress) {
          await updateVerbProgress(verbId, { status: 'sedang_dipelajari' })
        }

        const allProgress = await getAllVerbProgress()
        setVerbProgress(allProgress)
      }
      setLoading(false)
    }
    loadData()
  }, [params.id, setCurrentVerb, setVerbProgress])

  const playAudio = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'ar-SA'
      speechSynthesis.speak(utterance)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'dikuasai':
        return 'bg-green-100 text-green-700'
      case 'sedang_dipelajari':
        return 'bg-yellow-100 text-yellow-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatus = () => {
    const progress = verbProgress.find((p) => p.verbId === verb?.id)
    return progress?.status || 'belum_dipelajari'
  }

  const getStatusLabel = () => {
    const status = getStatus()
    switch (status) {
      case 'dikuasai':
        return 'متقن'
      case 'sedang_dipelajari':
        return 'قيد التعلم'
      default:
        return 'لم يدرس بعد'
    }
  }

  if (loading || !verb) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-2xl text-primary font-bold">جاري التحميل...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      <header className="bg-primary p-4 text-white sticky top-0 z-10">
        <nav className="flex justify-between items-center max-w-4xl mx-auto">
          <Link href="/verbs" className="text-2xl">
            ←
          </Link>
          <h1 className="text-xl font-bold">تفاصيل الفعل</h1>
          <Link href="/quiz" prefetch={false} className="text-xl">
            📝
          </Link>
        </nav>
      </header>

      <main className="max-w-4xl mx-auto p-4">
        <Card className="mb-6 border-none bg-gradient-to-br from-green-50 to-green-100 shadow-sm">
          <CardContent className="p-6">
            <div className="mb-4 flex justify-between items-start">
              <div>
                <span
                  className={`text-xs px-3 py-1 rounded-full font-bold ${getStatusColor(getStatus())}`}
                >
                  {getStatusLabel()}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => playAudio(formatArabicRoot(verb.root))}
                  className="rounded-full shadow-sm"
                >
                  🔊
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => playAudio(verb.madhi)}
                  className="rounded-full shadow-sm"
                >
                  🗣️
                </Button>
              </div>
            </div>

            <div className="text-center">
              <div className="text-5xl font-arabic mb-3 font-bold text-gray-800">
                {verb.madhi}
              </div>
              <div className="text-xl text-gray-600 mb-1 font-semibold">
                الماضي
              </div>
              <div className="text-lg text-muted-foreground">
                ({formatArabicRoot(verb.root)})
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <Card className="bg-purple-50 border-purple-100 shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-sm text-purple-600 font-semibold mb-2">
                المضارع
              </div>
              <div className="text-3xl font-arabic font-bold text-gray-800">
                {verb.mudhari}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-blue-50 border-blue-100 shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-sm text-blue-600 font-semibold mb-2">
                المصدر
              </div>
              <div className="text-3xl font-arabic font-bold text-gray-800">
                {verb.mashdar}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-orange-50 border-orange-100 shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-sm text-orange-600 font-semibold mb-2">
                الأمر
              </div>
              <div className="text-3xl font-arabic font-bold text-gray-800">
                {verb.amr}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-50 border-slate-200 shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-sm text-slate-600 font-semibold mb-2">
                Audio Path
              </div>
              <div className="text-xs font-medium text-slate-500">
                {verb.audioPath}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6">
          <div className="text-lg font-bold mb-2">المعنى</div>
          <div className="text-2xl text-gray-800">{verb.meaning}</div>
        </div>

        <div className="mb-6">
          <div className="flex gap-2 mb-4">
            <span className="bg-gray-100 px-3 py-1 rounded-lg text-sm">
              {verb.type}
            </span>
            <span className="bg-gray-100 px-3 py-1 rounded-lg text-sm">
              {verb.difficulty}
            </span>
          </div>
        </div>

        <div className="mb-8 space-y-6">
          <h2 className="text-xl font-bold">تصريفات الفعل</h2>
          <ConjugationTable
            title="Fi'il Madhi - 14 Dhomir"
            mode="madhi"
            conjugations={verb.conjugations}
          />
          <ConjugationTable
            title="Fi'il Mudhari - 14 Dhomir"
            mode="mudhari"
            conjugations={verb.conjugations}
          />
          <ConjugationTable
            title="Fi'il Amr"
            mode="amr"
            conjugations={verb.conjugations}
          />
        </div>

        <Link href={`/quiz?verb=${verb.id}`} prefetch={false}>
          <Button
            size="lg"
            className="w-full py-8 text-2xl font-bold rounded-2xl shadow-sm hover:shadow-md"
          >
            تدرب على هذا الفعل
          </Button>
        </Link>
      </main>
    </div>
  )
}
