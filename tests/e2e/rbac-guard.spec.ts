import { test, expect } from '@playwright/test';

test.describe('RBAC route guard (tanpa login)', () => {
	test('akses /profile tanpa login redirect ke /login', async ({ page }) => {
		await page.goto('/profile');
		await expect(page).toHaveURL(/\/login/);
	});

	test('akses /users tanpa login redirect ke /login', async ({ page }) => {
		await page.goto('/users');
		await expect(page).toHaveURL(/\/login/);
	});

	test('akses root "/" tanpa login redirect ke /login (bukan ke /profile)', async ({
		page,
	}) => {
		await page.goto('/');
		await expect(page).toHaveURL(/\/login/);
	});
});
