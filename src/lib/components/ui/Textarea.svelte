<script lang="ts">
	interface Props {
		id: string;
		label?: string;
		value: string;
		placeholder?: string;
		rows?: number;
		disabled?: boolean;
	}

	let {
		id,
		label,
		value = $bindable(''),
		placeholder,
		rows = 3,
		disabled = false,
	}: Props = $props();
</script>

<div class="flex flex-col gap-1.5">
	{#if label}
		<label for={id} class="text-xs font-semibold text-slate-500">{label}</label>
	{/if}
	<textarea
		{id}
		{placeholder}
		{rows}
		{disabled}
		bind:value
		class="w-full resize-y rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/30 disabled:bg-slate-100"
	></textarea>
</div>
