<script lang="ts">
	import { onMount } from 'svelte';
	import { api, ApiError, toQueryString } from '$lib/api/client';
	import type { PaginationMeta, SafeUser, SortOrder } from '$lib/api/types';
	import Card from '$lib/components/ui/Card.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Pagination from '$lib/components/ui/Pagination.svelte';
	import SortableTh from '$lib/components/ui/SortableTh.svelte';
	import RowAction from '$lib/components/ui/RowAction.svelte';

	let page = $state(1);
	let limit = $state(10);
	let search = $state('');
	let sortBy = $state<'email' | 'createdAt'>('createdAt');
	let sortOrder = $state<SortOrder>('desc');
	let isActiveFilter = $state('');

	let rows = $state<SafeUser[]>([]);
	let meta = $state<PaginationMeta | null>(null);
	let loading = $state(true);
	let errorMessage = $state('');
	let searchTimeout: ReturnType<typeof setTimeout>;

	async function loadUsers() {
		loading = true;
		errorMessage = '';
		try {
			const qs = toQueryString({
				page,
				limit,
				search: search || undefined,
				sortBy,
				sortOrder,
				isActive: isActiveFilter || undefined
			});
			const res = await api.get<SafeUser[]>(`/users${qs}`);
			rows = res.data;
			meta = res.meta ?? null;
		} catch (err) {
			errorMessage = err instanceof ApiError ? err.message : 'Gagal memuat data';
			rows = [];
			meta = null;
		} finally {
			loading = false;
		}
	}

	onMount(loadUsers);

	function handleSearchInput() {
		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(() => {
			page = 1;
			loadUsers();
		}, 350);
	}

	function handleFilterChange() {
		page = 1;
		loadUsers();
	}

	function handleSort(column: 'email' | 'createdAt') {
		if (sortBy === column) {
			sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			sortBy = column;
			sortOrder = 'asc';
		}
		loadUsers();
	}

	function handlePageChange(nextPage: number) {
		page = nextPage;
		loadUsers();
	}

	function formatDate(iso: string) {
		return new Date(iso).toLocaleString('id-ID');
	}
</script>

<div class="mb-5">
	<h1 class="font-display text-xl font-semibold text-slate-900">Users</h1>
	<p class="mt-1 text-xs text-slate-500">
		<code class="font-mono">GET /users</code> (permission <code class="font-mono">user:read</code>)
		&middot; klik salah satu user untuk lihat/edit profile-nya
		(<code class="font-mono">profile:read</code>/<code class="font-mono">profile:update</code>)
	</p>
</div>

<div class="mb-3.5 flex flex-wrap items-center gap-2.5">
	<input
		type="search"
		aria-label="Cari email"
		placeholder="Cari email..."
		bind:value={search}
		oninput={handleSearchInput}
		class="w-full max-w-60 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-600 focus:ring-2 focus:ring-teal-600/30 focus:outline-none"
	/>
	<select
		bind:value={isActiveFilter}
		onchange={handleFilterChange}
		aria-label="Filter status"
		class="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-600 focus:ring-2 focus:ring-teal-600/30 focus:outline-none"
	>
		<option value="">Semua status</option>
		<option value="true">Aktif</option>
		<option value="false">Nonaktif</option>
	</select>
</div>

{#if errorMessage}
	<div class="mb-3.5 rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
		{errorMessage}
	</div>
{/if}

<Card>
	{#if loading}
		<div class="p-10 text-center text-sm text-slate-500">Memuat...</div>
	{:else if rows.length === 0}
		<div class="p-10 text-center text-sm text-slate-500">Tidak ada user ditemukan.</div>
	{:else}
		<table class="w-full border-collapse text-[13.5px]">
			<thead>
				<tr>
					<SortableTh label="ID" />
					<SortableTh
						label="Email"
						active={sortBy === 'email'}
						direction={sortOrder}
						onclick={() => handleSort('email')}
					/>
					<SortableTh label="Status" />
					<SortableTh
						label="Terdaftar"
						active={sortBy === 'createdAt'}
						direction={sortOrder}
						onclick={() => handleSort('createdAt')}
					/>
					<SortableTh label="" />
				</tr>
			</thead>
			<tbody>
				{#each rows as u (u.id)}
					<tr class="hover:bg-slate-50">
						<td class="border-b border-slate-200 px-2.5 py-2.5 font-mono">{u.id}</td>
						<td class="border-b border-slate-200 px-2.5 py-2.5">{u.email}</td>
						<td class="border-b border-slate-200 px-2.5 py-2.5">
							{#if u.isActive}
								<Badge variant="success">Aktif</Badge>
							{:else}
								<Badge variant="danger">Nonaktif</Badge>
							{/if}
						</td>
						<td class="border-b border-slate-200 px-2.5 py-2.5 font-mono text-xs">
							{formatDate(u.createdAt)}
						</td>
						<td class="border-b border-slate-200 px-2.5 py-2.5 text-right">
							<RowAction href={`/users/${u.id}`}>Lihat profil</RowAction>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
		<Pagination {meta} onchange={handlePageChange} />
	{/if}
</Card>
