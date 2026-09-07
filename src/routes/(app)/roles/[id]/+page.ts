import type { PageLoad } from './$types';
import { api, ApiError } from '$lib/api/client';
import type { Permission, Role, RoleUserSummary } from '$lib/api/types';

interface SafeResult<T> {
	value: T | null;
	error: string | null;
}

/**
 * Halaman ini menggabungkan 4 sumber data dengan permission BERBEDA-BEDA
 * di backend (role:read, permission:read, dst) -- user admin bisa saja
 * punya sebagian tapi tidak semua. Kalau satu request gagal (403),
 * bagian LAIN dari halaman (mis. detail role) harus tetap tampil normal,
 * cuma section yang gagal itu saja yang menunjukkan pesan error-nya.
 * Makanya tiap fetch dibungkus try/catch sendiri-sendiri, bukan satu
 * try/catch besar yang menggagalkan semuanya kalau salah satu error.
 */
async function safeGet<T>(path: string): Promise<SafeResult<T>> {
	try {
		const res = await api.get<T>(path);
		return { value: res.data, error: null };
	} catch (err) {
		return { value: null, error: err instanceof ApiError ? err.message : 'Gagal memuat data' };
	}
}

export const load: PageLoad = async ({ params }) => {
	const roleId = Number(params.id);

	const [role, permissions, users, allPermissions] = await Promise.all([
		safeGet<Role>(`/roles/${roleId}`),
		safeGet<Permission[]>(`/roles/${roleId}/permissions`),
		safeGet<RoleUserSummary[]>(`/roles/${roleId}/users`),
		// limit=100: picker permission butuh SEMUA permission sekaligus,
		// bukan yang ter-paginasi 10 per halaman.
		safeGet<Permission[]>('/permissions?limit=100')
	]);

	return { roleId, role, permissions, users, allPermissions };
};
