import type { Handle } from '@sveltejs/kit';

// Origin backend diambil dari env yang SAMA dengan yang dipakai
// api/client.ts (VITE_API_BASE_URL) -- supaya CSP connect-src selalu
// sinkron otomatis kalau URL backend berubah, tidak perlu diubah manual
// di dua tempat.
const API_ORIGIN = new URL(
	import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api',
).origin;

// Setara Helmet di backend (lihat security hardening Phase 6 di repo
// backend) -- header-header ini TIDAK otomatis ada di server Node
// polos (adapter-node), beda dengan platform seperti Vercel/Netlify
// yang sudah kasih beberapa default sendiri.
export const handle: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);

	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('X-Frame-Options', 'DENY');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	response.headers.set(
		'Permissions-Policy',
		'camera=(), microphone=(), geolocation=()',
	);

	// HSTS cuma efektif kalau app ini benar-benar diakses lewat HTTPS
	// (baik langsung, atau di belakang reverse proxy yang terminate
	// TLS lalu forward ke sini) -- aman di-set selalu, browser cuma
	// menghormatinya di koneksi HTTPS.
	response.headers.set(
		'Strict-Transport-Security',
		'max-age=31536000; includeSubDomains',
	);

	// style-src TERPAKSA 'unsafe-inline' -- SvelteKit secara default
	// nge-inline critical CSS kecil langsung di <style> tag dalam HTML
	// respons pertama (optimasi first-paint), bukan cuma dari file .css
	// eksternal. CSP nonce-based (kit.csp di svelte.config) adalah cara
	// yang lebih ketat untuk menghindari 'unsafe-inline' ini, TAPI
	// belum diterapkan di project ini -- catat sebagai potensi
	// improvement lanjutan, bukan diabaikan begitu saja.
	response.headers.set(
		'Content-Security-Policy',
		[
			"default-src 'self'",
			"script-src 'self'",
			"style-src 'self' 'unsafe-inline'",
			"img-src 'self' data: " + API_ORIGIN,
			`connect-src 'self' ${API_ORIGIN}`,
			"frame-ancestors 'none'",
			"base-uri 'self'",
			"form-action 'self'",
		].join('; '),
	);

	return response;
};
