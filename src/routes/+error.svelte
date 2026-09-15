<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	// page.error.message dari SvelteKit sendiri (default: pesan generic
	// utk 500, atau "Not Found" utk 404) -- lihat handleError di
	// hooks.client.ts/hooks.server.ts kalau mau kustomisasi pesannya.
	const status = $derived(page.status);
	const message = $derived(page.error?.message ?? 'Terjadi kesalahan');

	const title = $derived(
		status === 404
			? 'Halaman tidak ditemukan'
			: status === 403
				? 'Akses ditolak'
				: 'Terjadi kesalahan',
	);
</script>

<svelte:head>
	<title>{status} — {title}</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center bg-slate-50 px-4">
	<Card class="max-w-sm text-center">
		<p class="font-display text-5xl font-bold text-teal-600">{status}</p>
		<h1 class="mt-2 text-lg font-semibold text-slate-800">{title}</h1>
		<p class="mt-1.5 text-sm text-slate-500">{message}</p>

		<div class="mt-5 flex justify-center gap-2">
			<Button variant="outline" onclick={() => history.back()}>Kembali</Button>
			<Button onclick={() => goto(resolve('/'))}>Ke Beranda</Button>
		</div>
	</Card>
</div>

<!--  -->
