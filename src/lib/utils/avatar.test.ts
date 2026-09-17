import { describe, expect, it } from 'vitest';
import { resolveAvatarUrl } from './avatar';

describe('resolveAvatarUrl', () => {
	it('mengembalikan URL apa adanya kalau sudah absolut (https://...)', () => {
		const url = 'https://pub-xxxxxxxxxxxx.r2.dev/avatars/user-1-uuid.webp';
		expect(resolveAvatarUrl(url, 'http://localhost:3000')).toBe(url);
	});

	it('mengembalikan URL apa adanya kalau sudah absolut (http://...)', () => {
		const url = 'http://pub-xxxxxxxxxxxx.r2.dev/avatars/user-1-uuid.webp';
		expect(resolveAvatarUrl(url, 'http://localhost:3000')).toBe(url);
	});

	it('tetap bekerja untuk custom domain (bukan cuma .r2.dev)', () => {
		const url = 'https://cdn.contohdomain.com/avatars/user-1-uuid.webp';
		expect(resolveAvatarUrl(url, 'http://localhost:3000')).toBe(url);
	});

	it('memprefix apiOrigin kalau avatarUrl masih path relatif (default avatar)', () => {
		expect(
			resolveAvatarUrl('/uploads/avatars/default.png', 'http://localhost:3000'),
		).toBe('http://localhost:3000/uploads/avatars/default.png');
	});
});
