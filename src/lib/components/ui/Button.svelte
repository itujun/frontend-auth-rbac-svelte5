<script lang="ts">
	import type { Snippet } from 'svelte';

	type Variant = 'primary' | 'outline' | 'danger' | 'ghost';
	type Size = 'md' | 'sm';

	interface Props {
		variant?: Variant;
		size?: Size;
		type?: 'button' | 'submit';
		disabled?: boolean;
		loading?: boolean;
		onclick?: (e: MouseEvent) => void;
		children: Snippet;
	}

	let {
		variant = 'primary',
		size = 'md',
		type = 'button',
		disabled = false,
		loading = false,
		onclick,
		children
	}: Props = $props();

	const variantClass: Record<Variant, string> = {
		primary: 'bg-teal-600 text-white border-transparent hover:bg-teal-700',
		outline: 'bg-white text-slate-800 border-slate-300 hover:border-slate-400',
		danger: 'bg-transparent text-red-600 border-red-300 hover:bg-red-50',
		ghost: 'bg-transparent text-slate-500 border-transparent hover:bg-slate-100 hover:text-slate-800'
	};

	const sizeClass: Record<Size, string> = {
		md: 'text-sm px-3.5 py-2',
		sm: 'text-xs px-2.5 py-1.5'
	};
</script>

<button
	{type}
	disabled={disabled || loading}
	{onclick}
	class="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-55 {variantClass[
		variant
	]} {sizeClass[size]}"
>
	{#if loading}
		<span
			class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-r-transparent"
		></span>
	{/if}
	{@render children()}
</button>
