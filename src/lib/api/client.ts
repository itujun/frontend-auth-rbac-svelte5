import { tokenStore } from './token.svelte';
import type { ApiSuccessResponse } from './types';

export const API_BASE =
	import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api';
// Dipakai untuk merangkai URL gambar avatar (/uploads/...), yang
// di-serve backend TANPA prefix /api (lihat main.ts backend Phase 4).
export const API_ORIGIN = API_BASE.replace(/\/api\/?$/, '');

export class ApiError extends Error {
	statusCode: number;
	errors?: unknown;

	constructor(message: string, statusCode: number, errors?: unknown) {
		super(message);
		this.name = 'ApiError';
		this.statusCode = statusCode;
		this.errors = errors;
	}
}

let refreshInFlight: Promise<boolean> | null = null;

/**
 * POST /auth/refresh — mengandalkan httpOnly cookie `refresh_token`
 * yang otomatis dikirim browser (makanya WAJIB `credentials: 'include'`
 * di semua request, termasuk ini). Dipanggil saat app pertama load
 * (silent refresh) MAUPUN otomatis saat request lain kena 401.
 *
 * Di-dedupe lewat `refreshInFlight`: kalau ada beberapa request yang
 * kena 401 bersamaan, jangan tembak /auth/refresh berkali-kali secara
 * paralel — itu bisa memicu reuse-detection di backend (Phase 2) yang
 * mengira refresh token sedang dipakai ulang secara mencurigakan.
 */
export async function refreshAccessToken(): Promise<boolean> {
	if (refreshInFlight) return refreshInFlight;

	refreshInFlight = (async () => {
		try {
			const res = await fetch(`${API_BASE}/auth/refresh`, {
				method: 'POST',
				credentials: 'include',
			});
			if (!res.ok) {
				tokenStore.set(null);
				return false;
			}
			const body = (await res.json()) as ApiSuccessResponse<{
				accessToken: string;
			}>;
			tokenStore.set(body.data.accessToken);
			return true;
		} catch {
			return false;
		} finally {
			refreshInFlight = null;
		}
	})();

	return refreshInFlight;
}

interface RequestOptions {
	method: string;
	body?: BodyInit;
	skipAuthRetry?: boolean;
}

/**
 * Semua endpoint backend membungkus response jadi
 * `{ success, statusCode, message, data, meta?, errors? }`
 * (lihat ResponseInterceptor/AllExceptionsFilter di backend) — kita
 * bongkar bentuk itu di sini sekali saja, supaya kode pemanggil
 * (komponen halaman) tidak perlu tahu soal amplop response ini dan
 * cukup bekerja dengan `data`/`meta` yang sudah type-safe.
 */
async function request<T>(
	path: string,
	options: RequestOptions,
): Promise<ApiSuccessResponse<T>> {
	const isFormData = options.body instanceof FormData;
	const headers: Record<string, string> = {};
	if (!isFormData) headers['Content-Type'] = 'application/json';
	if (tokenStore.value) headers['Authorization'] = `Bearer ${tokenStore.value}`;

	const res = await fetch(`${API_BASE}${path}`, {
		method: options.method,
		body: options.body,
		headers,
		credentials: 'include', // wajib -- supaya cookie refresh_token ikut terkirim
	});

	// Access token expired di tengah sesi -> coba refresh SEKALI, lalu ulangi request asli.
	if (res.status === 401 && !options.skipAuthRetry) {
		const refreshed = await refreshAccessToken();
		if (refreshed) {
			return request<T>(path, { ...options, skipAuthRetry: true });
		}
	}

	let body: unknown = null;
	try {
		body = await res.json();
	} catch {
		// response tanpa body (jarang terjadi di API ini) -- biarkan null
	}

	if (!res.ok) {
		const err = body as { message?: string; errors?: unknown } | null;
		throw new ApiError(
			err?.message ?? `Request gagal (${res.status})`,
			res.status,
			err?.errors,
		);
	}

	return body as ApiSuccessResponse<T>;
}

export const api = {
	get: <T>(path: string) => request<T>(path, { method: 'GET' }),
	post: <T>(path: string, data?: unknown) =>
		request<T>(path, {
			method: 'POST',
			body: data !== undefined ? JSON.stringify(data) : undefined,
		}),
	patch: <T>(path: string, data: unknown) =>
		request<T>(path, { method: 'PATCH', body: JSON.stringify(data) }),
	put: <T>(path: string, data: unknown) =>
		request<T>(path, { method: 'PUT', body: JSON.stringify(data) }),
	delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
	upload: <T>(path: string, formData: FormData) =>
		request<T>(path, { method: 'POST', body: formData }),
};

/** Bangun query string dari object, buang key yang undefined/null/''. */
export function toQueryString(
	params: Record<string, string | number | boolean | undefined>,
): string {
	const filtered = Object.entries(params).filter(
		([, v]) => v !== undefined && v !== null && v !== '',
	);
	if (filtered.length === 0) return '';
	const usp = new URLSearchParams();
	for (const [k, v] of filtered) usp.set(k, String(v));
	return `?${usp.toString()}`;
}
