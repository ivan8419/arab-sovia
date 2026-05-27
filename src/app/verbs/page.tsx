'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { verbsData, searchVerbs } from '@/data/verbs'
import { useAppStore } from '@/lib/store'
import { getAllVerbProgress, initializeDb } from '@/lib/db'
import { VerbType, Difficulty } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { VerbCard } from '@/components/learning/verb-card'

export default function VerbsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | ''>(
    ''
  )
  const [selectedType, setSelectedType] = useState<VerbType | ''>('')
  const { verbProgress, setVerbProgress } = useAppStore()

  useEffect(() => {
    async function loadData() {
      await initializeDb()
      const progress = await getAllVerbProgress()
      setVerbProgress(progress)
    }
    loadData()
  }, [setVerbProgress])

  const filteredVerbs = useMemo(() => {
    let result = searchQuery ? searchVerbs(searchQuery) : verbsData

    if (selectedDifficulty) {
      result = result.filter((v) => v.difficulty === selectedDifficulty)
    }
    if (selectedType) {
      result = result.filter((v) => v.type === selectedType)
    }
    return result
  }, [searchQuery, selectedDifficulty, selectedType])

  const getVerbStatus = (verbId: string) => {
    const progress = verbProgress.find((p) => p.verbId === verbId)
    return progress?.status || 'belum_dipelajari'
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-primary p-4 text-white sticky top-0 z-10">
        <nav className="flex justify-between items-center max-w-4xl mx-auto">
          <Link href="/" className="text-2xl">
            ←
          </Link>
          <h1 className="text-xl font-bold">قائمة الأفعال</h1>
          <div className="w-8"></div>
        </nav>
      </header>

      <main className="max-w-4xl mx-auto p-4">
        <div className="mb-4">
          <Input
            type="text"
            placeholder="ابحث عن فعل..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-right bg-gray-50 border-gray-200"
          />
        </div>

        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          <Button
            variant={selectedDifficulty === '' ? 'default' : 'outline'}
            onClick={() => setSelectedDifficulty('')}
            className="whitespace-nowrap"
          >
            الكل
          </Button>
          <Button
            variant={selectedDifficulty === 'Pemula' ? 'default' : 'outline'}
            onClick={() => setSelectedDifficulty('Pemula')}
            className="whitespace-nowrap"
          >
            مبتدئ
          </Button>
          <Button
            variant={selectedDifficulty === 'Menengah' ? 'default' : 'outline'}
            onClick={() => setSelectedDifficulty('Menengah')}
            className="whitespace-nowrap"
          >
            متوسط
          </Button>
          <Button
            variant={selectedDifficulty === 'Mahir' ? 'default' : 'outline'}
            onClick={() => setSelectedDifficulty('Mahir')}
            className="whitespace-nowrap"
          >
            متقدم
          </Button>
        </div>

        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          <Button
            variant={selectedType === '' ? 'default' : 'outline'}
            onClick={() => setSelectedType('')}
            className="whitespace-nowrap"
          >
            جميع الأنواع
          </Button>
          <Button
            variant={selectedType === 'Salim' ? 'default' : 'outline'}
            onClick={() => setSelectedType('Salim')}
            className="whitespace-nowrap"
          >
            سليم
          </Button>
          <Button
            variant={selectedType === 'Mithali' ? 'default' : 'outline'}
            onClick={() => setSelectedType('Mithali')}
            className="whitespace-nowrap"
          >
            مثالي
          </Button>
          <Button
            variant={selectedType === "Mu'tal" ? 'default' : 'outline'}
            onClick={() => setSelectedType("Mu'tal")}
            className="whitespace-nowrap"
          >
            معتل
          </Button>
        </div>

        <div className="text-left text-sm text-muted-foreground mb-4">
          {filteredVerbs.length} فعل
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {filteredVerbs.map((verb) => {
            const status = getVerbStatus(verb.id)
            return <VerbCard key={verb.id} verb={verb} status={status} />
          })}
        </div>

        {filteredVerbs.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-xl mb-2">لا توجد نتائج</p>
            <p>جرب تغيير معايير البحث</p>
          </div>
        )}
      </main>
    </div>
  )
}
