import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api, ApiError, toQueryString } from './client';
import { tokenStore } from './token.svelte';

// Reset token & mock fetch bersih di setiap test -- token disimpan di
// memori level-module (lihat komentar di token.svelte.ts), jadi kalau
// tidak direset, test satu bisa "bocor" state ke test berikutnya.
beforeEach(() => {
	tokenStore.set(null);
	vi.restoreAllMocks();
});

describe('toQueryString', () => {
	it('mengembalikan string kosong kalau semua value undefined/null/kosong', () => {
		expect(
			toQueryString({ a: undefined, b: null as unknown as undefined, c: '' }),
		).toBe('');
	});

	it('membuang key yang undefined/null/kosong, tapi tetap sertakan 0 dan false', () => {
		const qs = toQueryString({
			page: 1,
			active: false,
			count: 0,
			search: undefined,
		});
		const params = new URLSearchParams(qs.slice(1));
		expect(params.get('page')).toBe('1');
		expect(params.get('active')).toBe('false');
		expect(params.get('count')).toBe('0');
		expect(params.has('search')).toBe(false);
	});
});

describe('ApiError', () => {
	it('menyimpan statusCode dan errors, name selalu "ApiError"', () => {
		const err = new ApiError('Gagal validasi', 422, {
			email: ['Email tidak valid'],
		});
		expect(err.message).toBe('Gagal validasi');
		expect(err.statusCode).toBe(422);
		expect(err.errors).toEqual({ email: ['Email tidak valid'] });
		expect(err.name).toBe('ApiError');
		expect(err).toBeInstanceOf(Error);
	});
});

describe('api.get -- auto-refresh on 401', () => {
	it('otomatis refresh token lalu ulangi request SEKALI kalau kena 401', async () => {
		const fetchMock = vi.fn();
		vi.stubGlobal('fetch', fetchMock);

		// 1) Request asli -> 401 (access token expired)
		fetchMock.mockResolvedValueOnce({
			ok: false,
			status: 401,
			json: async () => ({ message: 'Unauthorized' }),
		});
		// 2) POST /auth/refresh -> sukses, dapat access token baru
		fetchMock.mockResolvedValueOnce({
			ok: true,
			status: 200,
			json: async () => ({ data: { accessToken: 'token-baru' } }),
		});
		// 3) Request diulang dengan token baru -> sukses
		fetchMock.mockResolvedValueOnce({
			ok: true,
			status: 200,
			json: async () => ({ data: { id: 1 } }),
		});

		const result = await api.get<{ id: number }>('/users/1');

		expect(result.data).toEqual({ id: 1 });
		expect(fetchMock).toHaveBeenCalledTimes(3);
		// Panggilan ke-2 HARUS ke /auth/refresh
		expect(fetchMock.mock.calls[1][0]).toContain('/auth/refresh');
		// Panggilan ke-3 (retry) HARUS bawa Authorization header token baru
		const retryHeaders = fetchMock.mock.calls[2][1]?.headers as Record<
			string,
			string
		>;
		expect(retryHeaders.Authorization).toBe('Bearer token-baru');
		// Token baru harus tersimpan di tokenStore untuk request berikutnya
		expect(tokenStore.value).toBe('token-baru');
	});

	it('TIDAK infinite-loop kalau refresh juga gagal -- lempar ApiError dari 401 asli', async () => {
		const fetchMock = vi.fn();
		vi.stubGlobal('fetch', fetchMock);

		fetchMock.mockResolvedValueOnce({
			ok: false,
			status: 401,
			json: async () => ({ message: 'Unauthorized' }),
		});
		// /auth/refresh JUGA gagal (refresh token expired/revoked)
		fetchMock.mockResolvedValueOnce({
			ok: false,
			status: 401,
			json: async () => ({ message: 'Refresh gagal' }),
		});

		await expect(api.get('/users/1')).rejects.toThrow(ApiError);
		// Cuma 2 panggilan (request asli + refresh) -- BUKAN retry lagi
		// setelah refresh gagal, karena itu akan infinite-loop.
		expect(fetchMock).toHaveBeenCalledTimes(2);
		expect(tokenStore.value).toBeNull();
	});
});
