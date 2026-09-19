import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// $env/dynamic/public HANYA ter-populate lewat middleware request
// SvelteKit (baca process.env saat ada request HTTP masuk) -- Vitest
// tidak pernah lewat pipeline itu sama sekali (langsung import modul
// TS secara statis untuk unit test), jadi virtual module ini selalu
// undefined di bawah Vitest, terlepas dari config apapun. Known issue
// resmi: https://github.com/sveltejs/kit/issues/10446.
//
// Mock di sini (setup file), BUKAN di client.test.ts saja -- otomatis
// berlaku ke semua test file, termasuk yang belum ada sekarang tapi
// nanti transitively import client.ts.
//
// env kosong SENGAJA -- client.ts sudah punya fallback
// (`env.PUBLIC_API_BASE_URL ?? 'http://localhost:3000/api'`), jadi
// test tetap dapat API_BASE yang valid & deterministik tanpa perlu
// menduplikasi nilai .env di sini.
vi.mock('$env/dynamic/public', () => ({
	env: {},
}));
