<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ResolvedPathname } from '$app/types';

	interface Props {
		// ResolvedPathname (bukan `string` polos) -- caller WAJIB bungkus
		// href dengan resolve() dari $app/paths sebelum dioper ke sini.
		// Komponen reusable seperti ini tidak tahu route apa yang bakal
		// dipakai, jadi tidak bisa validasi sendiri -- tipe inilah yang
		// memindahkan kewajiban validasi ke sisi caller, sekaligus bikin
		// svelte/no-navigation-without-resolve tidak salah tangkap
		// (linter percaya tipe ini SUDAH pasti hasil resolve()).
		href?: ResolvedPathname;
		onclick?: () => void;
		variant?: 'default' | 'danger';
		class?: string;
		children: Snippet;
	}

	let {
		href,
		onclick,
		variant = 'default',
		class: className = '',
		children,
	}: Props = $props();

	let colorClass = $derived(
		variant === 'danger' ? 'text-red-600' : 'text-teal-700',
	);
</script>

{#if href}
	<a
		{href}
		class="text-xs font-semibold hover:underline {colorClass} {className}"
		>{@render children()}</a
	>
{:else}
	<button
		type="button"
		{onclick}
		class="text-xs font-semibold hover:underline {colorClass} {className}"
	>
		{@render children()}
	</button>
{/if}
