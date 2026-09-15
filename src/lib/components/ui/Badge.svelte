<script lang="ts">
	import type { Snippet } from 'svelte';

	type Variant = 'success' | 'danger' | 'muted';

	interface Props {
		variant?: Variant;
		children: Snippet;
	}

	let { variant = 'muted', children }: Props = $props();

	const variantClass: Record<Variant, string> = {
		success: 'bg-green-100 text-green-700',
		danger: 'bg-red-100 text-red-700',
		muted: 'bg-slate-100 text-slate-500 border border-slate-200',
	};
</script>

<span
	class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold {variantClass[
		variant
	]}"
>
	{@render children()}
</span>
