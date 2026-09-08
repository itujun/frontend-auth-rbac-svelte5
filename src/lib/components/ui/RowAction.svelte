<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		href?: string;
		onclick?: () => void;
		variant?: 'default' | 'danger';
		class?: string;
		children: Snippet;
	}

	let { href, onclick, variant = 'default', class: className = '', children }: Props = $props();

	let colorClass = $derived(variant === 'danger' ? 'text-red-600' : 'text-teal-700');
</script>

{#if href}
	<a {href} class="text-xs font-semibold hover:underline {colorClass} {className}">{@render children()}</a>
{:else}
	<button type="button" {onclick} class="text-xs font-semibold hover:underline {colorClass} {className}">
		{@render children()}
	</button>
{/if}
