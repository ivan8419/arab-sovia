'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-400 via-emerald-300 to-teal-400 dark:from-slate-900 dark:via-slate-800 dark:to-emerald-950 p-4">
      <div className="text-center max-w-md">
        <div className="text-8xl mb-6">⚠️</div>
        <h1 className="text-4xl font-bold text-white mb-3">
          Terjadi Kesalahan
        </h1>
        <p className="text-lg text-white/80 mb-8">
          Maaf, terjadi kesalahan yang tidak terduga. Silakan coba lagi.
        </p>
        <div className="flex gap-4 justify-center">
          <Button
            onClick={reset}
            className="rounded-2xl bg-white px-8 py-6 text-lg font-bold text-emerald-600 shadow-xl hover:bg-white/90"
          >
            Coba Lagi
          </Button>
          <Link
            href="/"
            className="inline-flex items-center rounded-2xl border-2 border-white/50 bg-transparent px-8 py-3 text-lg font-bold text-white shadow-xl hover:bg-white/10"
          >
            Beranda
          </Link>
        </div>
      </div>
    </div>
  )
}
