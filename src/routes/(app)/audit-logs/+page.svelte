<script lang="ts">
	import { onMount } from 'svelte';
	import { api, ApiError, toQueryString } from '$lib/api/client';
	import type { AuditLog, PaginationMeta, SortOrder } from '$lib/api/types';
	import Card from '$lib/components/ui/Card.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Pagination from '$lib/components/ui/Pagination.svelte';
	import SortableTh from '$lib/components/ui/SortableTh.svelte';
	import RowAction from '$lib/components/ui/RowAction.svelte';

	let page = $state(1);
	let limit = $state(10);
	let sortOrder = $state<SortOrder>('desc');

	// Filter tersedia dari backend cuma exact-match (bukan search bebas
	// seperti di Users/Permissions) -- lihat FindAuditLogsQueryDto.
	let actorUserId = $state('');
	let actionFilter = $state('');
	let resourceType = $state('');

	let rows = $state<AuditLog[]>([]);
	let meta = $state<PaginationMeta | null>(null);
	let loading = $state(true);
	let errorMessage = $state('');
	let filterTimeout: ReturnType<typeof setTimeout>;

	// Detail (metadata/IP/user-agent) dibuka inline per baris, bukan modal --
	// konsisten dengan pola di seluruh app (lihat StyleGuide §6.1).
	let expandedIds = $state<number[]>([]);

	function toggleExpanded(id: number) {
		expandedIds = expandedIds.includes(id)
			? expandedIds.filter((x) => x !== id)
			: [...expandedIds, id];
	}

	async function loadLogs() {
		loading = true;
		errorMessage = '';
		try {
			const qs = toQueryString({
				page,
				limit,
				sortBy: 'createdAt',
				sortOrder,
				actorUserId: actorUserId || undefined,
				action: actionFilter || undefined,
				resourceType: resourceType || undefined,
			});
			const res = await api.get<AuditLog[]>(`/audit-logs${qs}`);
			rows = res.data;
			meta = res.meta ?? null;
		} catch (err) {
			errorMessage =
				err instanceof ApiError ? err.message : 'Gagal memuat data';
			rows = [];
			meta = null;
		} finally {
			loading = false;
		}
	}

	onMount(loadLogs);

	function handleFilterInput() {
		clearTimeout(filterTimeout);
		filterTimeout = setTimeout(() => {
			page = 1;
			loadLogs();
		}, 350);
	}

	function handleSort() {
		sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
		loadLogs();
	}

	function handlePageChange(nextPage: number) {
		page = nextPage;
		loadLogs();
	}

	function formatDate(iso: string) {
		return new Date(iso).toLocaleString('id-ID');
	}

	// Kategori warna badge cuma dua (success/danger) + muted -- sesuai
	// Badge component, tidak ada varian "warning" di design system ini.
	// Aksi netral (update, logout, sync) sengaja tetap muted, bukan
	// dipaksa masuk salah satu dari dua warna semantik.
	function actionVariant(action: string): 'success' | 'danger' | 'muted' {
		if (/delete|revoke|failed/.test(action)) return 'danger';
		if (/create|register|success|assign/.test(action)) return 'success';
		return 'muted';
	}
</script>

<div class="mb-5">
	<h1 class="font-display text-xl font-semibold text-slate-900">Audit Log</h1>
	<p class="mt-1 text-xs text-slate-500">
		<code class="font-mono">GET /audit-logs</code> (permission
		<code class="font-mono">audit_log:read</code>) &middot; read-only, tidak
		mencatat dirinya sendiri
	</p>
</div>

<!--
	Raw <input> (BUKAN komponen Input.svelte) -- sama seperti search box di
	Users/+page.svelte. Input.svelte tidak punya prop event handler
	(oninput/onchange), cuma bind:value, jadi tidak cocok untuk field yang
	butuh debounce reaktif seperti filter di sini.
-->
<div class="mb-3.5 flex flex-wrap items-end gap-2.5">
	<div class="flex flex-col gap-1.5">
		<label for="filter-actor" class="text-xs font-semibold text-slate-500"
			>Actor ID</label
		>
		<input
			id="filter-actor"
			type="text"
			inputmode="numeric"
			placeholder="cth: 7"
			bind:value={actorUserId}
			oninput={handleFilterInput}
			class="w-28 rounded-md border border-slate-300 px-3 py-2 font-mono text-sm focus:border-teal-600 focus:ring-2 focus:ring-teal-600/30 focus:outline-none"
		/>
	</div>
	<div class="flex flex-col gap-1.5">
		<label for="filter-action" class="text-xs font-semibold text-slate-500"
			>Action</label
		>
		<input
			id="filter-action"
			type="text"
			placeholder="cth: auth.login_failed"
			bind:value={actionFilter}
			oninput={handleFilterInput}
			class="w-56 rounded-md border border-slate-300 px-3 py-2 font-mono text-sm focus:border-teal-600 focus:ring-2 focus:ring-teal-600/30 focus:outline-none"
		/>
	</div>
	<div class="flex flex-col gap-1.5">
		<label for="filter-resource" class="text-xs font-semibold text-slate-500"
			>Resource type</label
		>
		<input
			id="filter-resource"
			type="text"
			placeholder="cth: role"
			bind:value={resourceType}
			oninput={handleFilterInput}
			class="w-40 rounded-md border border-slate-300 px-3 py-2 font-mono text-sm focus:border-teal-600 focus:ring-2 focus:ring-teal-600/30 focus:outline-none"
		/>
	</div>
</div>

{#if errorMessage}
	<div
		class="mb-3.5 rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
	>
		{errorMessage}
	</div>
{/if}

<Card>
	{#if loading}
		<div class="p-10 text-center text-sm text-slate-500">Memuat...</div>
	{:else if rows.length === 0}
		<div class="p-10 text-center text-sm text-slate-500">
			Tidak ada audit log ditemukan.
		</div>
	{:else}
		<table class="w-full border-collapse text-[13.5px]">
			<thead>
				<tr>
					<SortableTh
						label="Waktu"
						active
						direction={sortOrder}
						onclick={handleSort}
					/>
					<SortableTh label="Actor" />
					<SortableTh label="Action" />
					<SortableTh label="Resource" />
					<SortableTh label="" />
				</tr>
			</thead>
			<tbody>
				{#each rows as log (log.id)}
					<tr class="hover:bg-slate-50">
						<td
							class="border-b border-slate-200 px-2.5 py-2.5 font-mono text-xs whitespace-nowrap"
						>
							{formatDate(log.createdAt)}
						</td>
						<td class="border-b border-slate-200 px-2.5 py-2.5">
							{#if log.actorEmail}
								<span class="font-mono text-xs">{log.actorEmail}</span>
							{:else}
								<span class="text-slate-400">&mdash;</span>
							{/if}
						</td>
						<td class="border-b border-slate-200 px-2.5 py-2.5">
							<Badge variant={actionVariant(log.action)}>{log.action}</Badge>
						</td>
						<td
							class="border-b border-slate-200 px-2.5 py-2.5 font-mono text-xs text-slate-500"
						>
							{#if log.resourceType}
								{log.resourceType}{#if log.resourceId}&nbsp;&middot;&nbsp;{log.resourceId}{/if}
							{:else}
								<span class="text-slate-400">&mdash;</span>
							{/if}
						</td>
						<td class="border-b border-slate-200 px-2.5 py-2.5 text-right">
							<RowAction onclick={() => toggleExpanded(log.id)}>
								{expandedIds.includes(log.id) ? 'Tutup' : 'Detail'}
							</RowAction>
						</td>
					</tr>
					{#if expandedIds.includes(log.id)}
						<tr>
							<td
								colspan="5"
								class="border-b border-slate-200 bg-slate-50 px-2.5 py-3"
							>
								<div class="grid gap-2.5 text-xs sm:grid-cols-2">
									<div>
										<span class="font-semibold text-slate-500">IP Address</span>
										<div class="font-mono text-slate-700">
											{log.ipAddress ?? '—'}
										</div>
									</div>
									<div>
										<span class="font-semibold text-slate-500">User Agent</span>
										<div class="font-mono break-all text-slate-700">
											{log.userAgent ?? '—'}
										</div>
									</div>
									<div class="sm:col-span-2">
										<span class="font-semibold text-slate-500">Metadata</span>
										{#if log.metadata}
											<pre
												class="mt-1 overflow-x-auto rounded-md border border-slate-200 bg-white p-2.5 font-mono text-[11px] text-slate-700">{JSON.stringify(
													log.metadata,
													null,
													2,
												)}</pre>
										{:else}
											<div class="font-mono text-slate-400">—</div>
										{/if}
									</div>
								</div>
							</td>
						</tr>
					{/if}
				{/each}
			</tbody>
		</table>
		<Pagination {meta} onchange={handlePageChange} />
	{/if}
</Card>
