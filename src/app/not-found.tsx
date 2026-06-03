import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-400 via-emerald-300 to-teal-400 dark:from-slate-900 dark:via-slate-800 dark:to-emerald-950 p-4">
      <div className="text-center max-w-md">
        <div className="text-8xl mb-6">🔍</div>
        <h1 className="text-4xl font-bold text-white mb-3">
          Halaman Tidak Ditemukan
        </h1>
        <p className="text-lg text-white/80 mb-8">
          Maaf, halaman yang Anda cari tidak tersedia. Silakan kembali ke
          beranda untuk melanjutkan belajar.
        </p>
        <Link
          href="/"
          className="inline-block rounded-2xl bg-white px-8 py-4 text-lg font-bold text-emerald-600 shadow-xl hover:bg-white/90 transition-all hover:scale-105"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  )
}
