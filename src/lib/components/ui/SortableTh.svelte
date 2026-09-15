<script lang="ts">
	interface Props {
		label: string;
		active?: boolean;
		direction?: 'asc' | 'desc';
		onclick?: () => void;
	}

	let { label, active = false, direction = 'asc', onclick }: Props = $props();
</script>

<th
	class="border-b border-slate-300 px-2.5 py-2 text-left text-xs font-semibold text-slate-500"
	aria-sort={onclick
		? active
			? direction === 'asc'
				? 'ascending'
				: 'descending'
			: 'none'
		: undefined}
>
	{#if onclick}
		<button {onclick} class="hover:text-slate-900">
			{label}{#if active}{direction === 'asc' ? ' \u2191' : ' \u2193'}{/if}
		</button>
	{:else}
		{label}
	{/if}
</th>
