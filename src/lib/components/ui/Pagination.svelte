<script lang="ts">
	import type { PaginationMeta } from '$lib/api/types';
	import Button from './Button.svelte';

	interface Props {
		meta: PaginationMeta | null;
		onchange: (page: number) => void;
	}

	let { meta, onchange }: Props = $props();

	function go(page: number) {
		if (!meta || page < 1 || page > meta.totalPages || page === meta.page)
			return;
		onchange(page);
	}
</script>

{#if meta && meta.totalItems > 0}
	<div class="mt-3.5 flex flex-wrap items-center justify-between gap-2.5">
		<span class="text-xs text-slate-500">
			{(meta.page - 1) * meta.limit + 1}&ndash;{Math.min(
				meta.page * meta.limit,
				meta.totalItems,
			)} dari
			{meta.totalItems}
		</span>
		<div class="flex items-center gap-2.5">
			<Button
				variant="outline"
				size="sm"
				disabled={meta.page <= 1}
				onclick={() => go(meta.page - 1)}
			>
				Sebelumnya
			</Button>
			<span class="font-mono text-xs text-slate-500"
				>{meta.page} / {meta.totalPages}</span
			>
			<Button
				variant="outline"
				size="sm"
				disabled={meta.page >= meta.totalPages}
				onclick={() => go(meta.page + 1)}
			>
				Berikutnya
			</Button>
		</div>
	</div>
{/if}
