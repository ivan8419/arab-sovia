Buatlah aplikasi web belajar **Kata Kerja Bahasa Arab (Fi'il) + Dhomir** menggunakan **Next.js 15 (App Router)** + **TypeScript** + **Tailwind CSS** + **shadcn/ui**.

Aplikasi ini bersifat **frontend only** (tanpa backend dan database eksternal). Buatlah aplikasi dengan kualitas tinggi, desain modern, dan **animasi yang sangat menarik** agar terasa premium dan adiktif seperti Duolingo.

### Fitur Utama

1. **Dashboard Utama** (dengan animasi keren)
   - Streak counter dengan animasi fire burst saat bertambah
   - XP counter dengan animasi naik (count-up)
   - Hearts dengan animasi break saat berkurang
   - Progress circle dengan animasi smooth
   - Daily goal tracker

2. **Belajar & Konjugasi**
   - Halaman detail fi'il dengan tabel konjugasi yang smooth (hover effect + click to copy)
   - Audio button dengan ripple animation

3. **Permainan Edukatif (Mini Games) — Versi Advance**

Buat **6 permainan** dengan animasi dan efek visual yang berkualitas tinggi:

- **Game 1: Verb Match Arena**  
  Drag & drop matching dengan physics (gunakan Framer Motion), efek glow saat benar, particle explosion saat combo.

- **Game 2: Conjugation Sprint**  
  Typing race dengan timer visual, speedometer, background yang bergerak semakin cepat, combo multiplier dengan fire effect.

- **Game 3: Fi'il Defense (Tower Defense Style)**  
  Musuh (berbentuk dhomir) datang dari sisi kanan. Pemain memilih konjugasi yang benar untuk menyerang. Gunakan animasi projectile, explosion, dan health bar.

- **Game 4: Memory Palace**  
  Memory card flip dengan 3D flip animation (gunakan Framer Motion atau React Spring), efek confetti saat match.

- **Game 5: Rapid Fire Duel**  
  60 detik nonstop quiz. Background gradient berubah warna sesuai skor, shake animation saat salah, streak multiplier dengan efek glow.

- **Game 6: Rootle (Wordle Style untuk Akar Kata)**  
  Tebak akar kata (3-4 huruf) dalam 6 percobaan. Dengan tile flip animation, warna hijau/kuning/abu seperti Wordle, tapi tema Arab.

### Persyaratan Animasi & Visual

- Gunakan **Framer Motion** untuk semua animasi utama
- Tambahkan **particle effects** (gunakan tsParticles atau custom canvas) saat user benar banyak
- Confetti animation saat menyelesaikan level atau daily goal
- Smooth transitions antar halaman (page transition)
- Hover, tap, dan feedback micro-interaction di setiap tombol
- Dark mode yang elegan
- Full **RTL support** yang sempurna untuk teks Arab
- Desain modern, colorful, dan premium (gunakan gradient, glassmorphism, atau neumorphism sesuai tema)

### Teknis Lainnya

- State management: **Zustand**
- Local Database: **Dexie.js** (simpan progress, high score, streak)
- PWA siap install di HP
- Optimasi performa (lazy loading game components)
- Berikan reward XP, Hearts, dan **Badge** yang bisa dikoleksi (dengan unlock animation)

### Data Awal

Sediakan **minimal 60 fi'il** populer dalam bentuk TypeScript JSON yang rapi, lengkap dengan:

- root, madhi, mudhari, amr, mashdar, arti, tipe fi'il, audio path, dan konjugasi lengkap 14 dhomir.

---
