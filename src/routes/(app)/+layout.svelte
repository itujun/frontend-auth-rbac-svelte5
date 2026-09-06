<script lang="ts">
	import { goto } from '$app/navigation';
	import { authState } from '$lib/state/auth.svelte';
	import Sidebar from '$lib/components/shell/Sidebar.svelte';
	import Topbar from '$lib/components/shell/Topbar.svelte';

	let { children } = $props();

	$effect(() => {
		if (authState.isAuthReady && !authState.currentUser) {
			goto('/login', { replaceState: true });
		}
	});
</script>

{#if authState.currentUser}
	<div class="flex min-h-screen">
		<Sidebar />

		<div class="flex min-w-0 flex-1 flex-col">
			<Topbar />

			<main class="flex-1 overflow-y-auto p-6">
				{@render children()}
			</main>
		</div>
	</div>
{/if}
