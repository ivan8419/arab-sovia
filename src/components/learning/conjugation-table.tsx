'use client'

import { useMemo, useState } from 'react'

import type { Conjugation } from '@/types'
import { Card, CardContent } from '@/components/ui/card'

type ConjugationMode = 'madhi' | 'mudhari' | 'amr'

type ConjugationTableProps = {
  conjugations: Conjugation[]
  title: string
  mode: ConjugationMode
}

export function ConjugationTable({
  conjugations,
  title,
  mode,
}: ConjugationTableProps) {
  const [copied, setCopied] = useState<string | null>(null)

  const rows = useMemo(() => {
    return conjugations.filter((item) => {
      if (mode === 'amr') {
        return Boolean(item.amr)
      }

      return true
    })
  }, [conjugations, mode])

  const handleCopy = async (value: string, key: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(key)
      window.setTimeout(() => setCopied(null), 1200)
    } catch {
      setCopied(null)
    }
  }

  return (
    <Card className="overflow-hidden border border-slate-200">
      <CardContent className="p-0">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-right">
            <thead>
              <tr className="bg-white text-sm text-slate-500">
                <th className="border-b border-slate-200 px-4 py-3">Dhomir</th>
                <th className="border-b border-slate-200 px-4 py-3">Bentuk</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => {
                const value =
                  mode === 'madhi'
                    ? item.madhi
                    : mode === 'mudhari'
                      ? item.mudhari
                      : (item.amr ?? '-')
                const key = `${mode}-${item.dhomir}`

                return (
                  <tr
                    key={key}
                    className="transition-colors hover:bg-primary/5"
                  >
                    <td className="border-b border-slate-100 px-4 py-3 font-arabic text-lg font-medium text-slate-700">
                      {item.dhomirLabel}
                    </td>
                    <td className="border-b border-slate-100 px-4 py-3">
                      <button
                        type="button"
                        onClick={() => handleCopy(value, key)}
                        className="w-full rounded-xl px-3 py-2 text-right font-arabic text-xl font-semibold text-slate-900 transition hover:bg-slate-100"
                      >
                        {value}
                        <span className="mr-2 text-xs font-sans text-slate-400">
                          {copied === key ? 'Copied' : 'Tap to copy'}
                        </span>
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
