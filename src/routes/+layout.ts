// Access token cuma hidup di memori browser (lihat token.svelte.ts),
// dan status login ditentukan client-side lewat cookie httpOnly yang
// tidak bisa dibaca server SvelteKit ini. Karena itu SSR dimatikan
// untuk SELURUH app -- ini murni SPA yang bicara ke backend NestJS
// terpisah, bukan aplikasi yang butuh render di server.
export const ssr = false;
