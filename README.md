# ARAB SOVIA

Aplikasi belajar konjugasi kata kerja Arab (fi'il) dan dhomir dengan gaya gamified mirip Duolingo. Project ini dibangun dengan Next.js 15 App Router, TypeScript, Tailwind CSS, shadcn/ui, Zustand, Dexie.js, Framer Motion, Vitest, dan PWA support.

## Fitur Utama

- Dashboard dengan XP, hearts, streak, progress mastery, dan daily goal
- Daftar fi'il dengan search, filter level, dan filter tipe fi'il
- Halaman detail fi'il dengan tabel konjugasi lengkap untuk 14 dhomir
- Quiz multi-mode: pilihan ganda, isi kosong, tebak arti, matching, dan listening
- Enam mini-game: Verb Match Arena, Conjugation Sprint, Fi'il Defense, Memory Palace, Rapid Fire Duel, dan Rootle
- Progress lokal dengan Dexie.js + IndexedDB
- RTL support, dark mode, dan PWA installable

## Cara Install & Run Locally

### Prasyarat

- Node.js 20 atau lebih baru
- npm

### Setup

```bash
git clone https://github.com/ivan8419/arab-sovia.git
cd arab-sovia

npm install
npm run dev
```

Buka `http://localhost:3000`.

## Menjalankan Test

```bash
npm run lint
npm run typecheck
npm run test
npm run test:coverage
npm run build
```

## Struktur Folder

```text
arab-sovia/
├── .github/workflows/      # CI dan deploy Vercel
├── public/                 # Manifest, service worker, icon PWA
├── src/
│   ├── app/                # App Router pages
│   ├── components/
│   │   ├── learning/       # VerbCard, ConjugationTable
│   │   └── ui/             # Primitive UI shadcn/base-ui
│   ├── data/               # Dataset 60 fi'il
│   ├── lib/                # Store, db Dexie, utilities
│   ├── __tests__/          # Unit tests Vitest + RTL
│   └── types/              # Tipe TypeScript
├── next.config.js
├── tailwind.config.ts
├── vercel.json
├── vitest.config.ts
└── package.json
```

## Deploy ke Vercel

### Manual

```bash
npx vercel@latest
```

### Via GitHub Actions

Isi secret berikut di repository GitHub:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `DISCORD_WEBHOOK` (opsional)

Workflow `ci.yml` akan berjalan untuk `push` dan `pull_request` ke `develop`/`main`, lalu `deploy.yml` akan deploy otomatis saat branch `main` di-push.

## Available Scripts

| Script                  | Keterangan                      |
| ----------------------- | ------------------------------- |
| `npm run dev`           | Menjalankan development server  |
| `npm run build`         | Build production                |
| `npm run start`         | Menjalankan hasil build         |
| `npm run lint`          | ESLint untuk `src` dan workflow |
| `npm run typecheck`     | TypeScript strict check         |
| `npm run test`          | Unit test                       |
| `npm run test:ui`       | Vitest UI                       |
| `npm run test:coverage` | Coverage report                 |
| `npm run format`        | Format semua file               |
| `npm run format:check`  | Validasi format Prettier        |

## Git Setup Awal

Setelah project siap, jalankan:

```bash
echo "# arab-sovia" >> README.md
git init
git add README.md
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/ivan8419/arab-sovia.git
git push -u origin main
```

## Environment Variables

Project ini frontend-only sehingga tidak membutuhkan secret untuk local development. Contoh variabel deployment tersedia di `.env.example`.

## License

MIT
