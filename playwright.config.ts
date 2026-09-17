import { defineConfig, devices } from '@playwright/test';

// Node TIDAK otomatis baca .env (beda dengan Vite yang load ke
// import.meta.env untuk kode aplikasi) -- playwright.config.ts jalan
// sebagai proses Node terpisah di luar pipeline Vite, jadi perlu
// di-load manual. `process.loadEnvFile()` bawaan Node 20.6+ (stabil di
// Node 22 yang dipakai project ini), tidak perlu install `dotenv`.
// Tanpa ini, E2E_ADMIN_EMAIL/PASSWORD di .env TIDAK PERNAH terbaca
// oleh Playwright walau sudah benar di file -- login.spec.ts akan
// terus ke-skip diam-diam tanpa pesan error yang jelas.
try {
	process.loadEnvFile('.env');
} catch {
	// .env tidak ada -- wajar untuk CI (kredensial lewat GitHub Secrets,
	// bukan file), atau kalau memang belum di-setup lokal. login.spec.ts
	// akan tetap ke-skip secara aman lewat test.skip() di file itu.
}

// PRASYARAT sebelum menjalankan `npm run test:e2e`:
// 1. Backend (rbac-backend) HARUS sudah jalan & bisa diakses di
//    VITE_API_BASE_URL (default http://localhost:3000/api) --
//    `docker compose up -d` dari repo backend.
// 2. Database backend HARUS sudah punya user hasil `npm run db:seed`
//    (superadmin) -- E2E ini test alur LOGIN SUNGGUHAN ke backend
//    asli, bukan mock. Isi kredensialnya lewat env E2E_ADMIN_EMAIL /
//    E2E_ADMIN_PASSWORD (lihat .env.example.e2e), JANGAN hardcode di
//    sini.
//
// Ini SENGAJA beda filosofi dari unit test (client.test.ts) yang mock
// fetch -- E2E ini justru untuk memverifikasi INTEGRASI asli frontend
// <-> backend beneran nyambung, konsisten dengan semangat Testcontainers
// di E2E backend (Postgres asli, bukan mock).
export default defineConfig({
	testDir: './tests/e2e',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	reporter: 'html',
	use: {
		// Port 4000 (BUKAN 3000) -- sengaja beda dari default port
		// backend NestJS supaya keduanya bisa jalan BERSAMAAN saat
		// login.spec.ts butuh backend beneran nyambung.
		baseURL: 'http://localhost:4000',
		trace: 'on-first-retry',
	},
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] },
		},
	],
	// PENTING: `node build` (server SvelteKit/adapter-node SUNGGUHAN,
	// menjalankan hooks.server.ts + SSR per-route), BUKAN
	// `vite preview` (cuma static file server generik bawaan Vite --
	// tidak tahu apa-apa soal adapter-node, tidak SSR, cuma nyajiin
	// shell HTML kosong yang sama untuk semua route). Ketahuan lewat
	// live-testing: guard redirect (RBAC) tidak pernah jalan kalau
	// disajikan lewat `vite preview`, karena app 100% bergantung ke JS
	// client-side boot dari nol tanpa progressive enhancement SSR sama
	// sekali.
	webServer: {
		command: 'npm run build && npm run start',
		url: 'http://localhost:4000',
		env: { PORT: '4000' },
		reuseExistingServer: !process.env.CI,
		timeout: 120_000,
	},
});
