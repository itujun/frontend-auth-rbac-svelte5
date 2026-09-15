import { beforeEach, describe, expect, it } from 'vitest';
import { tokenStore } from './token.svelte';

beforeEach(() => {
	tokenStore.set(null);
});

describe('tokenStore', () => {
	it('defaultnya null', () => {
		expect(tokenStore.value).toBeNull();
	});

	it('set/get token berfungsi', () => {
		tokenStore.set('abc123');
		expect(tokenStore.value).toBe('abc123');
	});

	it('TIDAK pernah menyentuh localStorage/sessionStorage', () => {
		tokenStore.set('rahasia-token');
		// Ini justru bukti desain keamanannya: token cuma hidup di
		// memori JS, tidak ada jejaknya di browser storage APBun pun --
		// kalau ada XSS, attacker tidak bisa baca token lewat
		// localStorage.getItem() sesederhana itu.
		expect(localStorage.getItem('rahasia-token')).toBeNull();
		expect(JSON.stringify(localStorage)).not.toContain('rahasia-token');
		expect(JSON.stringify(sessionStorage)).not.toContain('rahasia-token');
	});
});
