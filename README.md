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
- PNPM 11.1.3

### Setup

```bash
git clone https://github.com/ivan8419/arab-sovia.git
cd ARAB-SOVIA

corepack enable
corepack prepare pnpm@11.1.3 --activate

pnpm install
pnpm dev
```

Buka `http://localhost:3000`.

## Menjalankan Test

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:coverage
pnpm build
```

## Struktur Folder

```text
duolinggo-sov/
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
pnpm dlx vercel@latest
```

### Via GitHub Actions

Isi secret berikut di repository GitHub:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `DISCORD_WEBHOOK` (opsional)

Workflow `ci.yml` akan berjalan untuk `push` dan `pull_request` ke `develop`/`main`, lalu `deploy.yml` akan deploy otomatis saat branch `main` di-push.

## Available Scripts

| Script               | Keterangan                      |
| -------------------- | ------------------------------- |
| `pnpm dev`           | Menjalankan development server  |
| `pnpm build`         | Build production                |
| `pnpm start`         | Menjalankan hasil build         |
| `pnpm lint`          | ESLint untuk `src` dan workflow |
| `pnpm typecheck`     | TypeScript strict check         |
| `pnpm test`          | Unit test                       |
| `pnpm test:ui`       | Vitest UI                       |
| `pnpm test:coverage` | Coverage report                 |
| `pnpm format`        | Format semua file               |
| `pnpm format:check`  | Validasi format Prettier        |

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
