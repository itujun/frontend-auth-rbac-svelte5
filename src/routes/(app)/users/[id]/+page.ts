import type { PageLoad } from './$types';
import { api, ApiError } from '$lib/api/client';
import type { Profile } from '$lib/api/types';

/**
 * Sengaja TIDAK pakai helper `error()` dari SvelteKit saat request
 * gagal (mis. 403 karena tidak punya permission `profile:read`).
 * Kalau throw, SvelteKit akan render `+error.svelte` yang MENGGANTI
 * seluruh halaman termasuk sidebar/topbar -- padahal kita justru mau
 * user tetap lihat shell aplikasi dan pesan error apa adanya dari
 * backend, konsisten dengan filosofi "biarkan 403 backend terlihat,
 * bukan disembunyikan/di-generalisir oleh frontend".
 */
export const load: PageLoad = async ({ params }) => {
	const userId = Number(params.id);

	try {
		const res = await api.get<Profile>(`/profiles/${userId}`);
		return { userId, profile: res.data, error: null as string | null };
	} catch (err) {
		return {
			userId,
			profile: null,
			error: err instanceof ApiError ? err.message : 'Gagal memuat profil user'
		};
	}
};
