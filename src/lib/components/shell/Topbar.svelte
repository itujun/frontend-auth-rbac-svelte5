<script lang="ts">
	import { goto } from '$app/navigation';
	import { authState, logout, logoutAll } from '$lib/state/auth.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	let loggingOut = $state(false);

	async function handleLogout() {
		loggingOut = true;
		try {
			await logout();
			goto('/login');
		} finally {
			loggingOut = false;
		}
	}

	async function handleLogoutAll() {
		if (!confirm('Yakin logout dari SEMUA device/sesi?')) return;
		loggingOut = true;
		try {
			await logoutAll();
			goto('/login');
		} finally {
			loggingOut = false;
		}
	}
</script>

<header class="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
	<div></div>
	<div class="flex items-center gap-3">
		<span class="font-mono text-xs text-slate-500">{authState.currentUser?.email}</span>
		<Button variant="outline" size="sm" onclick={handleLogoutAll} disabled={loggingOut}>
			Logout semua device
		</Button>
		<Button variant="outline" size="sm" onclick={handleLogout} disabled={loggingOut}>Logout</Button>
	</div>
</header>
