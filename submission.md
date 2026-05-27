Buatlah aplikasi web belajar **Kata Kerja Bahasa Arab (Fi'il) + Dhomir** menggunakan **Next.js 15 (App Router)** + **TypeScript** + **Tailwind CSS**. Aplikasi ini bersifat **frontend only** (tidak ada backend, tidak ada database eksternal).

### Tujuan Aplikasi

Aplikasi ini mirip Duolingo tetapi **fokus khusus** pada konjugasi kata kerja Arab beserta dhomir (kata ganti).

### Fitur Utama yang Harus Ada

1. **Home / Dashboard**
   - Streak counter (hari berturut-turut)
   - Total XP
   - Hearts (nyawa)
   - Progress keseluruhan (persentase fi'il yang dikuasai)
   - Tombol "Mulai Belajar Hari Ini"

2. **Daftar Fi'il (Verb List)**
   - Tampilkan daftar fi'il dengan root (misal: ك ت ب), bentuk madhi, mudhari, dan artinya
   - Filter berdasarkan: tingkat kesulitan (Pemula, Menengah, Mahir), tipe fi'il (Salim, Muzaf, dll)
   - Search bar (bisa cari berdasarkan arab, root, atau arti)

3. **Halaman Detail Fi'il**
   - Tampilkan tabel konjugasi lengkap:
     - **Fi'il Madhi** (14 dhomir)
     - **Fi'il Mudhari** (14 dhomir)
     - **Fi'il Amr** (Imperative)
   - Tampilkan Mashdar dan arti
   - Tombol audio untuk mendengar pengucapan root dan contoh

4. **Latihan / Quiz**
   - Beberapa tipe latihan:
     - Pilih konjugasi yang benar sesuai dhomir
     - Isi kotak kosong (conjugation drill)
     - Tebak arti
     - Matching (dhomir dengan bentuk fi'il)
     - Listening (dengar audio → ketik jawaban)
   - Sistem hearts (salah = kurangi heart)
   - Setelah selesai latihan → tampilkan skor + XP

5. **Progress System**
   - Setiap fi'il punya status: Belum Dipelajari, Sedang Dipelajari, Dikuasai
   - Progress disimpan menggunakan **Dexie.js** (IndexedDB)
   - Streak & XP juga disimpan di Dexie.js

### Desain & Teknis

- Full **RTL support** (Arabic friendly)
- Desain modern, clean, dan gamification (mirip Duolingo)
- Responsif (mobile-first)
- Gunakan **shadcn/ui** + Tailwind
- Support **PWA** (bisa di-install di HP)
- Gunakan App Router, Server Components sebanyak mungkin
- Optimasi performa (loading cepat meski ada banyak data JSON)

### Struktur Data

Sediakan minimal **50 fi'il** awal dalam bentuk JSON yang rapi. Setiap fi'il harus punya:

- root, madhi, mudhari, mashdar, arti, tipe, audio path, dan conjugations lengkap untuk 14 dhomir.

### Persyaratan Tambahan

- Kode harus clean, rapi, dan well-commented
- Gunakan Zustand untuk state management (streak, hearts, xp)
- Buat folder structure yang scalable
- Siapkan halaman Settings (reset progress, dll)

---
