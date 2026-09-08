<script lang="ts">
	import { onMount } from 'svelte';
	import { api, ApiError, toQueryString } from '$lib/api/client';
	import { pushToast } from '$lib/state/toast.svelte';
	import type { PaginationMeta, Permission, SortOrder } from '$lib/api/types';
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Pagination from '$lib/components/ui/Pagination.svelte';
	import SortableTh from '$lib/components/ui/SortableTh.svelte';
	import RowAction from '$lib/components/ui/RowAction.svelte';

	let page = $state(1);
	let limit = $state(10);
	let search = $state('');
	let sortBy = $state<'name' | 'createdAt'>('name');
	let sortOrder = $state<SortOrder>('asc');

	let rows = $state<Permission[]>([]);
	let meta = $state<PaginationMeta | null>(null);
	let loading = $state(true);
	let errorMessage = $state('');
	let searchTimeout: ReturnType<typeof setTimeout>;

	async function loadPermissions() {
		loading = true;
		errorMessage = '';
		try {
			const qs = toQueryString({ page, limit, search: search || undefined, sortBy, sortOrder });
			const res = await api.get<Permission[]>(`/permissions${qs}`);
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

	onMount(loadPermissions);

	function handleSearchInput() {
		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(() => {
			page = 1;
			loadPermissions();
		}, 350);
	}

	function handleSort(column: 'name' | 'createdAt') {
		if (sortBy === column) {
			sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			sortBy = column;
			sortOrder = 'asc';
		}
		loadPermissions();
	}

	function handlePageChange(nextPage: number) {
		page = nextPage;
		loadPermissions();
	}

	// ---- Form buat/edit ----
	let formOpen = $state(false);
	let editingId = $state<number | null>(null);
	let formName = $state('');
	let formDescription = $state('');
	let formSaving = $state(false);
	let formError = $state('');

	function openCreateForm() {
		editingId = null;
		formName = '';
		formDescription = '';
		formError = '';
		formOpen = true;
	}

	function openEditForm(perm: Permission) {
		editingId = perm.id;
		formName = perm.name;
		formDescription = perm.description ?? '';
		formError = '';
		formOpen = true;
	}

	async function submitForm(e: SubmitEvent) {
		e.preventDefault();
		formSaving = true;
		formError = '';
		try {
			if (editingId) {
				await api.patch(`/permissions/${editingId}`, {
					name: formName,
					description: formDescription || undefined
				});
				pushToast('Permission berhasil diperbarui', 'success');
			} else {
				await api.post('/permissions', {
					name: formName,
					description: formDescription || undefined
				});
				pushToast('Permission berhasil dibuat', 'success');
			}
			formOpen = false;
			await loadPermissions();
		} catch (err) {
			formError = err instanceof ApiError ? err.message : 'Gagal menyimpan';
		} finally {
			formSaving = false;
		}
	}

	async function handleDelete(perm: Permission) {
		if (!confirm(`Hapus permission "${perm.name}"?`)) return;
		try {
			await api.delete(`/permissions/${perm.id}`);
			pushToast('Permission berhasil dihapus', 'success');
			await loadPermissions();
		} catch (err) {
			pushToast(err instanceof ApiError ? err.message : 'Gagal menghapus', 'error');
		}
	}

	function formatDate(iso: string) {
		return new Date(iso).toLocaleString('id-ID');
	}
</script>

<div class="mb-5 flex items-start justify-between gap-4">
	<div>
		<h1 class="font-display text-xl font-semibold text-slate-900">Permissions</h1>
		<p class="mt-1 text-xs text-slate-500">
			<code class="font-mono">GET/POST/PATCH/DELETE /permissions</code> &mdash; konvensi nama
			<code class="font-mono">resource:action</code>
		</p>
	</div>
	<Button onclick={openCreateForm}>+ Permission baru</Button>
</div>

{#if formOpen}
	<Card class="mb-4 max-w-md">
		<h2 class="text-sm font-semibold text-slate-900">
			{editingId ? 'Edit permission' : 'Buat permission baru'}
		</h2>
		{#if formError}
			<div class="mt-2.5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
				{formError}
			</div>
		{/if}
		<form class="mt-3.5 flex flex-col gap-3.5" onsubmit={submitForm}>
			<Input
				id="p-name"
				label="Nama"
				bind:value={formName}
				placeholder="resource:action"
				hint="Contoh: report:export"
				required
				mono
			/>
			<Input id="p-desc" label="Deskripsi (opsional)" bind:value={formDescription} />
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
		aria-label="Cari permission"
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
		<div class="p-10 text-center text-sm text-slate-500">Belum ada permission.</div>
	{:else}
		<table class="w-full border-collapse text-[13.5px]">
			<thead>
				<tr>
					<SortableTh label="ID" />
					<SortableTh
						label="Nama"
						active={sortBy === 'name'}
						direction={sortOrder}
						onclick={() => handleSort('name')}
					/>
					<SortableTh label="Deskripsi" />
					<SortableTh
						label="Dibuat"
						active={sortBy === 'createdAt'}
						direction={sortOrder}
						onclick={() => handleSort('createdAt')}
					/>
					<SortableTh label="" />
				</tr>
			</thead>
			<tbody>
				{#each rows as p (p.id)}
					<tr class="hover:bg-slate-50">
						<td class="border-b border-slate-200 px-2.5 py-2.5 font-mono">{p.id}</td>
						<td class="border-b border-slate-200 px-2.5 py-2.5 font-mono">{p.name}</td>
						<td class="border-b border-slate-200 px-2.5 py-2.5 text-slate-500"
							>{p.description || '\u2014'}</td
						>
						<td class="border-b border-slate-200 px-2.5 py-2.5 font-mono text-xs"
							>{formatDate(p.createdAt)}</td
						>
						<td class="border-b border-slate-200 px-2.5 py-2.5 text-right whitespace-nowrap">
							<RowAction onclick={() => openEditForm(p)}>Edit</RowAction>
							<RowAction variant="danger" class="ml-3" onclick={() => handleDelete(p)}>Hapus</RowAction>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
		<Pagination {meta} onchange={handlePageChange} />
	{/if}
</Card>
