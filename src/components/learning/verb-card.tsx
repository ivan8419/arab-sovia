'use client'

import Link from 'next/link'

import type { Fiil, ProgressStatus } from '@/types'
import { formatArabicRoot, getStatusLabel } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'

type VerbCardProps = {
  verb: Fiil
  status: ProgressStatus
}

const statusStyles: Record<ProgressStatus, string> = {
  belum_dipelajari: 'bg-slate-100 text-slate-700',
  sedang_dipelajari: 'bg-amber-100 text-amber-700',
  dikuasai: 'bg-emerald-100 text-emerald-700',
}

export function VerbCard({ verb, status }: VerbCardProps) {
  return (
    <Link href={`/verbs/${verb.id}`} className="block">
      <Card className="h-full border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
        <CardContent className="space-y-3 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="font-arabic text-2xl font-bold text-slate-900">
                {verb.madhi}
              </p>
              <p className="text-sm text-slate-500">
                Root: {formatArabicRoot(verb.root)}
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[status]}`}
            >
              {getStatusLabel(status)}
            </span>
          </div>

          <div className="space-y-1 text-sm text-slate-600">
            <p className="font-arabic text-lg text-slate-800">{verb.mudhari}</p>
            <p>{verb.meaning}</p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-primary/10 px-2.5 py-1 font-medium text-primary">
              {verb.difficulty}
            </span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600">
              {verb.type}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
