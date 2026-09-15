<script lang="ts">
	interface Props {
		id: string;
		label?: string;
		type?: string;
		value: string;
		placeholder?: string;
		required?: boolean;
		disabled?: boolean;
		autocomplete?: string;
		hint?: string;
		mono?: boolean;
		minlength?: number;
	}

	let {
		id,
		label,
		type = 'text',
		value = $bindable(''),
		placeholder,
		required = false,
		disabled = false,
		autocomplete,
		hint,
		mono = false,
		minlength,
	}: Props = $props();
</script>

<div class="flex flex-col gap-1.5">
	{#if label}
		<label for={id} class="text-xs font-semibold text-slate-500">{label}</label>
	{/if}
	<input
		{id}
		{type}
		{placeholder}
		{required}
		{disabled}
		{minlength}
		autocomplete={autocomplete as HTMLInputElement['autocomplete']}
		bind:value
		class={[
			'w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900',
			'focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/30',
			'disabled:bg-slate-100 disabled:text-slate-400',
			mono ? 'font-mono' : '',
		].join(' ')}
	/>
	{#if hint}
		<span class="text-xs text-slate-400">{hint}</span>
	{/if}
</div>
