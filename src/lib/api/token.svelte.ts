// Access token SENGAJA cuma disimpan di memori (module-level $state),
// BUKAN localStorage/sessionStorage — konsisten dengan desain backend
// Phase 2: kalau token disimpan di localStorage, serangan XSS bisa
// mencurinya lewat JS. Konsekuensinya: refresh browser = accessToken
// hilang dari memori — makanya root layout selalu mencoba silent
// refresh (POST /auth/refresh, modal cookie httpOnly) saat app dimuat.
//
// File terpisah dari state/auth.svelte.ts supaya api/client.ts (yang
// butuh baca/tulis token untuk header Authorization + auto-refresh)
// tidak perlu import balik dari state/auth.svelte.ts (circular import).

let token = $state<string | null>(null);

export const tokenStore = {
	get value() {
		return token;
	},
	set(next: string | null) {
		token = next;
	},
};
