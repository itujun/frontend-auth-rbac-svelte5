# Access Console — RBAC Test Client

Frontend simulasi untuk menguji visual semua fitur backend
(`backend-auth-rbac-nest11`): auth + JWT + refresh token, RBAC,
upload+kompresi avatar, dan pagination/search/sort/filter.

## Tech Stack

- **SvelteKit 2** + **Svelte 5** (runes: `$state`, `$derived`, `$props`, `$effect`)
- **TypeScript**
- **Tailwind CSS 4** (`@tailwindcss/forms`, `@tailwindcss/typography`)
- SSR **dimatikan** (`ssr = false`) — app ini murni SPA yang bicara ke backend NestJS terpisah

## Cara Menjalankan (Development)

1. **Pastikan backend sudah jalan** (lihat README backend), termasuk `CORS_ORIGIN`
   di `.env` backend diarahkan ke `http://localhost:5173` (default Vite).

2. **Copy env**
   ```bash
   cp .env.example .env
   ```
   Sesuaikan `VITE_API_BASE_URL` kalau backend tidak jalan di `http://localhost:3000/api`.

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Jalankan dev server**
   ```bash
   npm run dev
   ```
   Buka `http://localhost:5173`.

## Script Lain

| Script          | Fungsi                                              |
| ---------------- | ------------------------------------------------------ |
| `npm run check`   | Type-check (svelte-check) — jalankan sebelum commit    |
| `npm run build`   | Build production                                       |
| `npm run preview` | Preview hasil build production                         |

## Arsitektur

```
src/
  lib/
    api/
      types.ts          # Kontrak TypeScript, cermin persis dari response backend
      client.ts          # Fetch wrapper: auto-refresh token, unwrap response envelope
      token.svelte.ts     # State token (terpisah dari state auth penuh, hindari circular import)
    state/
      auth.svelte.ts       # Login/register/logout/logout-all/bootstrap (Svelte 5 runes)
      toast.svelte.ts      # Notifikasi global
    components/
      ui/                 # Komponen generik: Button, Input, Textarea, Card, Badge, ToastStack
      shell/               # Komponen shell ter-autentikasi: Sidebar, Topbar
  routes/
    +layout.ts              # ssr = false
    +layout.svelte            # Root layout: session bootstrap + ToastStack
    +page.svelte                # Redirect ke /profile atau /login
    login/+page.svelte           # Halaman login
    register/+page.svelte         # Halaman register
    (app)/+layout.svelte           # Shell ter-autentikasi: rangkai Sidebar + Topbar + auth guard
    (app)/profile/+page.svelte      # Profile self-service
```

### Kenapa strukturnya begini?

- **Access token cuma di memori (Svelte rune `$state`), BUKAN
  localStorage/sessionStorage.** Konsisten dengan desain backend Phase 2:
  kalau token disimpan di localStorage, serangan XSS bisa mencurinya
  lewat JS. Konsekuensinya: refresh browser = accessToken hilang dari
  memori — makanya root layout SELALU mencoba silent refresh
  (`POST /auth/refresh`, modal cookie httpOnly) saat app dimuat pertama
  kali, sebelum merender apapun.
- **`token.svelte.ts` terpisah dari `state/auth.svelte.ts`**: `api/client.ts`
  butuh baca/tulis token untuk header `Authorization` + auto-refresh,
  tapi tidak boleh depend ke `state/auth.svelte.ts` (yang sebaliknya
  depend ke `api/client.ts` untuk request login/register) — kalau
  digabung akan jadi circular import.
- **SSR dimatikan total** (`+layout.ts`): status login ditentukan
  client-side lewat cookie httpOnly yang tidak bisa dibaca server
  SvelteKit ini. Mencoba SSR di sini cuma akan menambah kompleksitas
  tanpa manfaat nyata untuk sebuah internal test client.
- **Nav SELALU ditampilkan ke semua user**, terlepas dari permission
  yang dia punya. Kalau user tidak punya izin, halaman terkait
  menampilkan pesan 403 dari backend APA ADANYA — ini sengaja, supaya
  tool ini juga jadi bukti visual bahwa `PermissionsGuard` di backend
  benar-benar bekerja, bukan disembunyikan seolah-olah "sudah aman"
  padahal cuma disembunyikan di frontend.
- **Reuse token dedupe untuk refresh**: kalau beberapa request kena 401
  bersamaan, `refreshAccessToken()` di-dedupe (semua nunggu satu
  promise yang sama) — mencegah beberapa `POST /auth/refresh` paralel
  yang bisa memicu reuse-detection di backend (mengira refresh token
  dipakai ulang secara mencurigakan padahal itu race condition biasa).
- **Komponen UI reusable** (`Button`, `Input`, `Textarea`, `Card`, `Badge`):
  dipakai ulang di semua halaman lewat props (`variant`, `size`, `label`,
  `bind:value` via `$bindable()`) — bukan copy-paste style tiap form.
- **`Sidebar`/`Topbar` dipisah dari `(app)/+layout.svelte`**: layout
  cuma merangkai (mengatur susunan + auth guard), bukan menaruh markup
  sidebar/topbar langsung di dalamnya. Ini memudahkan reuse/testing
  komponen shell secara independen, dan `Topbar` sendiri yang tahu
  detail state loading saat proses logout — layout tidak perlu tahu.

## Progress Roadmap

- [x] **Checkpoint 1 — Fondasi + Auth**
      Types TypeScript, API client dgn auto-refresh token, state
      management (Svelte 5 runes), Tailwind theme (font Space Grotesk/
      Inter/JetBrains Mono), routing skeleton, halaman Login & Register
      fungsional penuh.
- [x] **Checkpoint 2 — App Shell + Profile Page**
      Sidebar + topbar (logout, logout semua device) dengan auth guard,
      halaman Profil Saya (edit fullName/phone/bio, upload avatar,
      reset avatar ke default).
- [ ] **Checkpoint 3 — Users Page** (pagination, search, sort, filter isActive, lihat/edit profile user lain)
- [ ] **Checkpoint 4 — Roles Page** (CRUD, sync permission ke role, assign/revoke user)
- [ ] **Checkpoint 5 — Permissions Page** (CRUD)
- [ ] **Checkpoint 6 — Testing end-to-end + polish + packaging final**
