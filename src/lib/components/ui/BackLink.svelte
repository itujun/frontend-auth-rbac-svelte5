<script lang="ts">
	interface Props {
		href: string;
		label: string;
	}

	let { href, label }: Props = $props();
</script>

<a
	{href}
	class="mb-3.5 inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800"
>
	&larr; {label}
</a>
