**Prompt Lengkap:**

Buatlah project **Next.js 15 (App Router)** + **TypeScript** + **Tailwind CSS** bernama **duolinggo-sov** dengan konfigurasi berikut:

### Project Setup Awal

- Gunakan **PNPM** sebagai package manager
- App Router
- TypeScript (strict mode)
- Tailwind CSS + shadcn/ui
- Framer Motion untuk animasi
- Zustand untuk state management
- Dexie.js untuk IndexedDB
- PWA support

### Yang Harus Diimplementasikan:

**1. Git & Repository Setup**
Siapkan project agar siap langsung di-push ke GitHub dengan perintah berikut:

```bash
echo "# duolinggo-sov" >> README.md
git init
git add README.md
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/ivan8419/duolinggo-sov.git
git push -u origin main
```

**2. CI/CD dengan GitHub Actions**
Buat folder `.github/workflows/` dengan 2 workflow:

- **`ci.yml`** (untuk Pull Request & Push ke develop/main)
  - Lint (ESLint)
  - Type Check (TypeScript)
  - Prettier check
  - Unit Test (Vitest + React Testing Library)
  - Build production (`next build`)
  - Cache pnpm

- **`deploy.yml`** (untuk Production)
  - Trigger hanya saat push ke `main`
  - Jalankan CI terlebih dahulu
  - Deploy otomatis ke Vercel menggunakan Vercel CLI
  - Beri notifikasi jika gagal/sukses

**3. Unit Testing**

- Setup **Vitest** + **React Testing Library** + **jsdom**
- Buat contoh unit test untuk:
  - Komponen utama (ConjugationTable, VerbCard, dll)
  - Zustand store (progress, streak, xp)
  - Utility functions (conjugation logic, arabic text helper)
- Buat folder `__tests__` atau `tests/` dengan struktur yang jelas
- Tambahkan script di `package.json`: `test`, `test:ui`, `test:coverage`

**4. Best Practices & Optimasi Vercel**

- Buat `.env.example`
- Konfigurasi `next.config.mjs` yang optimal untuk Vercel
- `vercel.json` (jika diperlukan untuk routing & PWA)
- `.gitignore` yang lengkap
- Husky + lint-staged untuk pre-commit
- Pastikan project **bisa langsung di-deploy ke Vercel tanpa error**

**5. Dokumentasi**

- Buat `README.md` yang lengkap, mencakup:
  - Cara install & run locally
  - Cara menjalankan test
  - Struktur folder
  - Cara deploy manual ke Vercel

---

**Tujuan Akhir:**
Setelah kamu selesaikan project ini, saya bisa langsung menjalankan perintah git di atas, lalu deploy ke Vercel tanpa ada error build atau konfigurasi.

---
