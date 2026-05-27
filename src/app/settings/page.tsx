'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAppStore } from '@/lib/store'
import { useTheme } from '@/components/providers'
import {
  resetAllProgress,
  initializeDb,
  getUserStats,
  getAllVerbProgress,
} from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function SettingsPage() {
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const { loadFromDb } = useAppStore()

  const handleReset = async () => {
    setLoading(true)
    await resetAllProgress()
    await initializeDb()
    const stats = await getUserStats()
    const progress = await getAllVerbProgress()
    if (stats) loadFromDb(stats, progress)
    setLoading(false)
    setShowConfirm(false)
  }

  const isDark = theme === 'dark'

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="bg-primary p-4 text-primary-foreground">
        <nav className="flex justify-between items-center max-w-4xl mx-auto">
          <Link href="/" className="text-2xl">
            ←
          </Link>
          <h1 className="text-xl font-bold">الإعدادات</h1>
          <div className="w-8"></div>
        </nav>
      </header>

      <main className="max-w-4xl mx-auto p-4">
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4">حول التطبيق</h2>
          <Card className="bg-muted border-none shadow-sm">
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-primary mb-2">
                Duolingo Sov
              </div>
              <div className="text-muted-foreground font-medium">نسخة 1.0.0</div>
              <div className="text-sm text-muted-foreground mt-2">
                تطبيق لتعلم تصريف الأفعال العربية مع الضمائر
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4">Tampilan</h2>
          <Card className="bg-muted border-border shadow-sm">
            <CardContent className="flex items-center justify-between gap-4 p-6">
              <div>
                <p className="font-semibold">Dark mode</p>
                <p className="text-sm text-muted-foreground">
                  Aktifkan tema gelap untuk tampilan yang lebih nyaman.
                </p>
              </div>
              <Button
                variant={isDark ? 'default' : 'outline'}
                onClick={toggleTheme}
              >
                {isDark ? '🌙 On' : '☀️ Off'}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4">إعادة التقدم</h2>
          <Card className="bg-destructive/10 border-destructive/20 shadow-sm">
            <CardContent className="p-6">
              <p className="text-destructive font-medium mb-6">
                هذا الإجراء سيحذف جميع تقدمك في التطبيق بما في ذلك النقاط
                والأفعال المتقنة.
              </p>

              {!showConfirm ? (
                <Button
                  variant="destructive"
                  onClick={() => setShowConfirm(true)}
                  className="font-bold px-8"
                >
                  إعادة تعيين
                </Button>
              ) : (
                <div className="flex gap-3">
                  <Button
                    variant="destructive"
                    onClick={handleReset}
                    disabled={loading}
                    className="font-bold px-8"
                  >
                    {loading ? 'جاري...' : 'تأكيد'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowConfirm(false)}
                    className="font-bold px-8"
                  >
                    إلغاء
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">معلومات</h2>
          <Card className="bg-muted border-none shadow-sm">
            <CardContent className="p-6 space-y-3 text-muted-foreground font-medium">
              <p>• هذا التطبيق يخزن بياناتك محلياً في المتصفح</p>
              <p>• يدعم اللغة العربية والاتجاه من اليمين لليسار</p>
              <p>• مصمم ليكون شبيهاً بتطبيقات التعلم اللغوي</p>
              <p>• يدعم التخزين المحلي وخصائص PWA للتثبيت على الهاتف</p>
            </CardContent>
          </Card>
        </div>

        <Link href="/">
          <Button
            variant="secondary"
            size="lg"
            className="w-full font-bold text-lg py-6"
          >
            العودة للرئيسية
          </Button>
        </Link>
      </main>
    </div>
  )
}
