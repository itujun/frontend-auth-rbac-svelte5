import tailwindcss from '@tailwindcss/vite';
// adapter-node dipilih EKSPLISIT (bukan adapter-auto) -- backend sudah
// dockerize sebagai server Node standalone (lihat Dockerfile di repo
// backend), jadi paling natural frontend juga jalan sebagai server Node
// mandiri yang bisa di-container-kan dengan pola serupa, bukan
// bergantung pada auto-detection platform (Vercel/Netlify/Cloudflare)
// yang TIDAK relevan untuk self-hosted deployment via Docker.
import adapter from '@sveltejs/adapter-node';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { configDefaults } from 'vitest/config';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true,
			},

			// Lihat https://svelte.dev/docs/kit/adapter-node untuk opsi
			// konfigurasi (mis. `out`, `precompress`, `envPrefix`).
			adapter: adapter(),
		}),
	],
	test: {
		// jsdom (bukan 'node') -- supaya siap dipakai untuk component
		// test (@testing-library/svelte) nanti juga, tidak cuma unit
		// test logic murni. Overhead jsdom untuk test logic murni (mis.
		// client.test.ts) bisa diabaikan.
		environment: 'jsdom',
		globals: true,
		setupFiles: ['./vitest-setup.ts'],
		// tests/e2e/** SENGAJA dikecualikan -- itu punya Playwright
		// (test runner terpisah, dijalankan via `npm run test:e2e`),
		// bukan Vitest. Tanpa exclude ini, Vitest ikut coba jalankan
		// file .spec.ts di situ dan gagal karena `@playwright/test`
		// bukan API yang dikenal Vitest.
		exclude: [...configDefaults.exclude, 'tests/e2e/**'],
	},
});
