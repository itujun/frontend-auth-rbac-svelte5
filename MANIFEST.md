# Manifest — Path Asli Tiap File

Beberapa nama file di sini disamarkan (folder Svelte pakai kurung
`(app)`/`[id]` yang bikin path aneh kalau di-zip datar). Berikut
pemetaan lengkap ke path asli di repo `frontend-auth-rbac-svelte5`:

## File Baru

| Di zip ini | Taruh di repo sebagai |
|---|---|
| `eslint.config.js` | `eslint.config.js` (root) |
| `.prettierrc` | `.prettierrc` (root) |
| `.prettierignore` | `.prettierignore` (root) |
| `vitest-setup.ts` | `vitest-setup.ts` (root) |
| `playwright.config.ts` | `playwright.config.ts` (root) |
| `src/lib/api/client.test.ts` | sama persis |
| `src/lib/api/token.svelte.test.ts` | sama persis |
| `tests/e2e/login.spec.ts` | sama persis |
| `tests/e2e/rbac-guard.spec.ts` | sama persis |

## File yang Diubah (Existing)

| Di zip ini | Taruh di repo sebagai |
|---|---|
| `vite.config.ts` | `vite.config.ts` (root) — ganti adapter + tambah config Vitest |
| `package.json` | `package.json` (root) — script baru: `start`, `lint`, `lint:ci`, `test`, `test:watch`, `test:e2e` |
| `.gitignore` | `.gitignore` (root) — tambah exclude Playwright |
| `root-page.svelte` | `src/routes/+page.svelte` |
| `app-layout.svelte` | `src/routes/(app)/+layout.svelte` |
| `roles-id-page.svelte` | `src/routes/(app)/roles/[id]/+page.svelte` |
| `users-id-page.svelte` | `src/routes/(app)/users/[id]/+page.svelte` |
| `src/routes/login/+page.svelte` | sama persis |
| `src/routes/register/+page.svelte` | sama persis |
| `src/lib/components/shell/Sidebar.svelte` | sama persis |
| `src/lib/components/ui/BackLink.svelte` | sama persis |
| `src/lib/components/ui/RowAction.svelte` | sama persis |

## Belum Disertakan di Zip Ini (Sudah Diedit di Sesi Sebelumnya)

File-file lain yang sempat kena `npm run lint --fix` (formatting saja,
tidak ada perubahan logic) TIDAK disertakan di sini karena cuma
perubahan whitespace/style — jalankan `npm run lint` sendiri di
repo-mu setelah menerapkan `eslint.config.js` + `.prettierrc` di atas,
hasilnya akan sama.

## Setelah Menerapkan Semua File Ini

```bash
npm uninstall @sveltejs/adapter-auto
npm install --save-dev @sveltejs/adapter-node eslint @eslint/js typescript-eslint \
  eslint-plugin-svelte svelte-eslint-parser eslint-plugin-prettier \
  eslint-config-prettier prettier prettier-plugin-svelte globals \
  vitest @vitest/browser playwright @testing-library/svelte \
  @testing-library/jest-dom jsdom

npm run lint       # rapikan formatting seluruh file lain
npm run check      # pastikan 0 error
npm run test       # 8 unit test harus lulus
npm run build      # pastikan adapter-node jalan bersih

npx playwright install chromium   # baru bisa di laptopmu, bukan di sandbox Claude
npm run test:e2e                  # butuh backend jalan + user hasil db:seed
```
