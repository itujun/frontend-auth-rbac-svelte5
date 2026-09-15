<script lang="ts">
	import { toastState, dismissToast } from '$lib/state/toast.svelte';

	const kindClass: Record<string, string> = {
		success: 'bg-green-50 text-green-800 border-green-200',
		error: 'bg-red-50 text-red-800 border-red-200',
		info: 'bg-slate-900 text-white border-transparent',
	};
</script>

<div class="fixed top-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2">
	{#each toastState.items as t (t.id)}
		<div
			class="flex items-start justify-between gap-3 rounded-md border px-3 py-2.5 text-sm shadow-lg {kindClass[
				t.kind
			]}"
		>
			<span>{t.message}</span>
			<button
				onclick={() => dismissToast(t.id)}
				class="text-lg leading-none opacity-60 hover:opacity-100"
				aria-label="Tutup"
			>
				&times;
			</button>
		</div>
	{/each}
</div>
