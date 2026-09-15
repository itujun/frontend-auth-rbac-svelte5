import { defineConfig, devices } from '@playwright/test';

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
		baseURL: 'http://localhost:4173', // port default `vite preview`
		trace: 'on-first-retry',
	},
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] },
		},
	],
	// Playwright otomatis build+jalankan frontend production build
	// sebelum test mulai, dan otomatis matikan setelah selesai --
	// tidak perlu `npm run preview` manual dulu.
	webServer: {
		command: 'npm run build && npm run preview',
		url: 'http://localhost:4173',
		reuseExistingServer: !process.env.CI,
		timeout: 120_000,
	},
});
