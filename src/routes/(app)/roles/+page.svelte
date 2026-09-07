<script lang="ts">
	import { onMount } from 'svelte';
	import { api, ApiError, toQueryString } from '$lib/api/client';
	import { pushToast } from '$lib/state/toast.svelte';
	import type { PaginationMeta, Role, SortOrder } from '$lib/api/types';
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Pagination from '$lib/components/ui/Pagination.svelte';

	let page = $state(1);
	let limit = $state(10);
	let search = $state('');
	let sortBy = $state<'name' | 'createdAt'>('name');
	let sortOrder = $state<SortOrder>('asc');

	let rows = $state<Role[]>([]);
	let meta = $state<PaginationMeta | null>(null);
	let loading = $state(true);
	let errorMessage = $state('');
	let searchTimeout: ReturnType<typeof setTimeout>;

	async function loadRoles() {
		loading = true;
		errorMessage = '';
		try {
			const qs = toQueryString({ page, limit, search: search || undefined, sortBy, sortOrder });
			const res = await api.get<Role[]>(`/roles${qs}`);
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

	onMount(loadRoles);

	function handleSearchInput() {
		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(() => {
			page = 1;
			loadRoles();
		}, 350);
	}

	function handleSort(column: 'name' | 'createdAt') {
		if (sortBy === column) {
			sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			sortBy = column;
			sortOrder = 'asc';
		}
		loadRoles();
	}

	function handlePageChange(nextPage: number) {
		page = nextPage;
		loadRoles();
	}

	function sortIndicator(column: string) {
		if (sortBy !== column) return '';
		return sortOrder === 'asc' ? ' \u2191' : ' \u2193';
	}

	function formatDate(iso: string) {
		return new Date(iso).toLocaleString('id-ID');
	}

	// ---- Form buat role baru ----
	let formOpen = $state(false);
	let formName = $state('');
	let formDescription = $state('');
	let formSaving = $state(false);
	let formError = $state('');

	function openCreateForm() {
		formName = '';
		formDescription = '';
		formError = '';
		formOpen = true;
	}

	async function submitForm(e: SubmitEvent) {
		e.preventDefault();
		formSaving = true;
		formError = '';
		try {
			await api.post('/roles', { name: formName, description: formDescription || undefined });
			pushToast('Role berhasil dibuat', 'success');
			formOpen = false;
			await loadRoles();
		} catch (err) {
			formError = err instanceof ApiError ? err.message : 'Gagal menyimpan';
		} finally {
			formSaving = false;
		}
	}

	async function handleDelete(role: Role) {
		if (!confirm(`Hapus role "${role.name}"? Semua assignment ke role ini akan ikut terhapus.`)) {
			return;
		}
		try {
			await api.delete(`/roles/${role.id}`);
			pushToast('Role berhasil dihapus', 'success');
			await loadRoles();
		} catch (err) {
			pushToast(err instanceof ApiError ? err.message : 'Gagal menghapus', 'error');
		}
	}
</script>

<div class="mb-5 flex items-start justify-between gap-4">
	<div>
		<h1 class="font-display text-xl font-semibold text-slate-900">Roles</h1>
		<p class="mt-1 text-xs text-slate-500">
			<code class="font-mono">GET/POST/PATCH/DELETE /roles</code> &middot; klik salah satu role
			untuk atur permission &amp; anggotanya
		</p>
	</div>
	<Button onclick={openCreateForm}>+ Role baru</Button>
</div>

{#if formOpen}
	<Card class="mb-4 max-w-md">
		<h2 class="text-sm font-semibold text-slate-900">Buat role baru</h2>
		{#if formError}
			<div class="mt-2.5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
				{formError}
			</div>
		{/if}
		<form class="mt-3.5 flex flex-col gap-3.5" onsubmit={submitForm}>
			<Input id="r-name" label="Nama" bind:value={formName} required />
			<Input id="r-desc" label="Deskripsi (opsional)" bind:value={formDescription} />
			<div class="flex items-center gap-2.5">
				<Button type="submit" loading={formSaving} disabled={formSaving}>Simpan</Button>
				<Button variant="outline" onclick={() => (formOpen = false)}>Batal</Button>
			</div>
		</form>
	</Card>
{/if}

<div class="mb-3.5 flex flex-wrap items-center gap-2.5">
	<input
		type="search"
		placeholder="Cari nama/deskripsi..."
		bind:value={search}
		oninput={handleSearchInput}
		class="w-full max-w-60 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-600 focus:ring-2 focus:ring-teal-600/30 focus:outline-none"
	/>
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
		<div class="p-10 text-center text-sm text-slate-500">Belum ada role.</div>
	{:else}
		<table class="w-full border-collapse text-[13.5px]">
			<thead>
				<tr>
					<th class="border-b border-slate-300 px-2.5 py-2 text-left text-xs font-semibold text-slate-500"
						>ID</th
					>
					<th class="border-b border-slate-300 px-2.5 py-2 text-left text-xs font-semibold text-slate-500">
						<button onclick={() => handleSort('name')} class="hover:text-slate-900">
							Nama{sortIndicator('name')}
						</button>
					</th>
					<th class="border-b border-slate-300 px-2.5 py-2 text-left text-xs font-semibold text-slate-500"
						>Deskripsi</th
					>
					<th class="border-b border-slate-300 px-2.5 py-2 text-left text-xs font-semibold text-slate-500">
						<button onclick={() => handleSort('createdAt')} class="hover:text-slate-900">
							Dibuat{sortIndicator('createdAt')}
						</button>
					</th>
					<th class="border-b border-slate-300 px-2.5 py-2"></th>
				</tr>
			</thead>
			<tbody>
				{#each rows as r (r.id)}
					<tr class="hover:bg-slate-50">
						<td class="border-b border-slate-200 px-2.5 py-2.5 font-mono">{r.id}</td>
						<td class="border-b border-slate-200 px-2.5 py-2.5 font-mono">{r.name}</td>
						<td class="border-b border-slate-200 px-2.5 py-2.5 text-slate-500"
							>{r.description || '\u2014'}</td
						>
						<td class="border-b border-slate-200 px-2.5 py-2.5 font-mono text-xs"
							>{formatDate(r.createdAt)}</td
						>
						<td class="border-b border-slate-200 px-2.5 py-2.5 text-right whitespace-nowrap">
							<a href={`/roles/${r.id}`} class="text-xs font-semibold text-teal-700 hover:underline"
								>Kelola</a
							>
							<button
								onclick={() => handleDelete(r)}
								class="ml-3 text-xs font-semibold text-red-600 hover:underline"
							>
								Hapus
							</button>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
		<Pagination {meta} onchange={handlePageChange} />
	{/if}
</Card>
