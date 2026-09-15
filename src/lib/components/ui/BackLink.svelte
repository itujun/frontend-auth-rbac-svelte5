<script lang="ts">
	import type { ResolvedPathname } from '$app/types';

	interface Props {
		// ResolvedPathname (bukan string biasa) -- memaksa SETIAP
		// pemanggil komponen ini membungkus href dengan `resolve()` dari
		// `$app/paths` di titik pemanggilan, supaya route tervalidasi
		// type-safe (typo path ketahuan saat compile, bukan runtime).
		href: ResolvedPathname;
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
