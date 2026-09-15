import { test, expect } from '@playwright/test';

// Kredensial WAJIB dari env, bukan hardcode -- lihat playwright.config.ts.
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD;

test.describe('Login flow (integrasi backend asli)', () => {
	test.skip(
		!ADMIN_EMAIL || !ADMIN_PASSWORD,
		'E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD belum di-set -- skip, bukan gagal, ' +
			'karena test ini butuh backend + user hasil db:seed sungguhan.',
	);

	test('login dengan kredensial salah menampilkan pesan error, TIDAK redirect', async ({
		page,
	}) => {
		await page.goto('/login');
		await page.getByLabel('Email').fill('salah@example.com');
		await page.getByLabel('Password').fill('password-salah');
		await page.getByRole('button', { name: 'Masuk' }).click();

		// Harus TETAP di /login dengan pesan error -- bukan redirect diam-diam
		await expect(page).toHaveURL(/\/login/);
		await expect(page.getByText(/gagal|salah|invalid/i)).toBeVisible();
	});

	test('login dengan kredensial benar redirect ke /profile', async ({
		page,
	}) => {
		await page.goto('/login');
		await page.getByLabel('Email').fill(ADMIN_EMAIL!);
		await page.getByLabel('Password').fill(ADMIN_PASSWORD!);
		await page.getByRole('button', { name: 'Masuk' }).click();

		await expect(page).toHaveURL(/\/profile/);
	});

	test('refresh browser setelah login TETAP dalam kondisi login (silent refresh via cookie)', async ({
		page,
	}) => {
		await page.goto('/login');
		await page.getByLabel('Email').fill(ADMIN_EMAIL!);
		await page.getByLabel('Password').fill(ADMIN_PASSWORD!);
		await page.getByRole('button', { name: 'Masuk' }).click();
		await expect(page).toHaveURL(/\/profile/);

		// Access token cuma hidup di memori (lihat token.svelte.ts) --
		// full reload HARUS memicu silent refresh via cookie httpOnly,
		// BUKAN nge-log out user secara tidak sengaja.
		await page.reload();
		await expect(page).toHaveURL(/\/profile/);
	});
});
