<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { authState } from '$lib/state/auth.svelte';

	let { children } = $props();

	/**
	 * Cerminan persis dari (app)/+layout.svelte -- di sana redirect ke
	 * /login kalau BELUM login, di sini redirect ke /profile kalau SUDAH
	 * login. $effect (bukan cek biasa di script top-level) supaya tetap
	 * react kalau authState.currentUser berubah SAAT user masih di
	 * halaman /login (misal: login berhasil di tabl lain, atau
	 * bootstapSession() di root layout baru selesai belakangan).
	 */
	$effect(() => {
		if (authState.isAuthReady && authState.currentUser) {
			goto(resolve('/profile'), { replaceState: true });
		}
	});
</script>

{#if !authState.currentUser}
	{@render children()}
{/if}
