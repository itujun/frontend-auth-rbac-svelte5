<script lang="ts">
	import { page } from '$app/state';

	// Nav SELALU ditampilkan ke semua user, terlepas dari permission yang
	// dia punya. Kalau tidak punya izin, halaman akan menampilkan pesan
	// 403 dari backend apa adanya -- ini justru berguna untuk MENGUJI
	// bahwa PermissionsGuard di backend benar-benar bekerja, bukan
	// disembunyikan di frontend seolah-olah sudah "aman".
	const NAV_ITEMS = [
		{ href: '/profile', label: 'Profil Saya' },
		{ href: '/users', label: 'Users' },
		{ href: '/roles', label: 'Roles' },
		{ href: '/permissions', label: 'Permissions' }
	];
</script>

<aside class="flex w-56 flex-shrink-0 flex-col bg-slate-950 px-3.5 py-4.5 text-slate-400">
	<div class="mb-5 flex items-center gap-2 px-2 text-white">
		<span class="text-teal-500">&#9670;</span>
		<span class="font-display text-[15px] font-semibold">Access Console</span>
	</div>
	<nav class="flex flex-col gap-0.5">
		{#each NAV_ITEMS as item (item.href)}
			<a
				href={item.href}
				class="rounded-md px-2.5 py-2 text-[13.5px] {page.url.pathname.startsWith(item.href)
					? 'bg-teal-600 text-white'
					: 'hover:bg-white/5 hover:text-white'}"
			>
				{item.label}
			</a>
		{/each}
	</nav>
	<div class="mt-auto px-2 pt-3 text-[11px] text-slate-500">RBAC Test Client</div>
</aside>
