import { api, ApiError, refreshAccessToken } from '../api/client';
import { tokenStore } from '../api/token.svelte';
import type { SafeUser } from '../api/types';

let currentUser = $state<SafeUser | null>(null);
// null = belum tahu (masih proses cek sesi awal), true = sudah pasti (login atau tidak).
let isAuthReady = $state(false);

export const authState = {
	get currentUser() {
		return currentUser;
	},
	get isAuthReady() {
		return isAuthReady;
	}
};

export async function login(email: string, password: string): Promise<void> {
	const res = await api.post<{ accessToken: string; user: SafeUser }>('/auth/login', {
		email,
		password
	});
	tokenStore.set(res.data.accessToken);
	currentUser = res.data.user;
}

export async function register(email: string, password: string, fullName?: string): Promise<void> {
	await api.post('/auth/register', { email, password, fullName });
}

export async function logout(): Promise<void> {
	try {
		await api.post('/auth/logout');
	} finally {
		tokenStore.set(null);
		currentUser = null;
	}
}

/** Revoke SEMUA sesi/device milik user ini (butuh access token valid). */
export async function logoutAll(): Promise<void> {
	try {
		await api.post('/auth/logout-all');
	} finally {
		tokenStore.set(null);
		currentUser = null;
	}
}

/**
 * Dipanggil sekali saat aplikasi pertama kali dimuat (root layout).
 * Karena accessToken cuma hidup di memori, refresh browser/buka tab
 * baru = accessToken hilang -- tapi kalau refresh token cookie masih
 * valid, kita bisa diam-diam login ulang tanpa user perlu isi form lagi.
 */
export async function bootstrapSession(): Promise<void> {
	const ok = await refreshAccessToken();
	if (ok) {
		try {
			const res = await api.get<SafeUser>('/auth/me');
			currentUser = res.data;
		} catch (err) {
			if (err instanceof ApiError) {
				tokenStore.set(null);
				currentUser = null;
			}
		}
	}
	isAuthReady = true;
}
