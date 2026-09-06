<script lang="ts">
	import { onMount } from 'svelte';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import ToastStack from '$lib/components/ui/ToastStack.svelte';
	import { authState, bootstrapSession } from '$lib/state/auth.svelte';

	let { children } = $props();

	onMount(() => {
		bootstrapSession();
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<ToastStack />

{#if !authState.isAuthReady}
	<div class="flex h-screen items-center justify-center gap-2 text-sm text-slate-400">
		<span class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-r-transparent"
		></span>
		<span>Memeriksa sesi...</span>
	</div>
{:else}
	{@render children()}
{/if}
