<script lang="ts">
	import { api, ApiError } from '$lib/api/client';
	import { resolve } from '$app/paths';
	import { pushToast } from '$lib/state/toast.svelte';
	import { SvelteSet } from 'svelte/reactivity';
	import type { Role, RoleUserSummary } from '$lib/api/types';
	import Card from '$lib/components/ui/Card.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import RowAction from '$lib/components/ui/RowAction.svelte';
	import BackLink from '$lib/components/ui/BackLink.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	// --- Detail role (nama/deskripsi) ---
	let role = $state<Role | null>(null);
	let name = $state('');
	let description = $state('');
	let savingRole = $state(false);

	$effect(() => {
		role = data.role.value;
		name = data.role.value?.name ?? '';
		description = data.role.value?.description ?? '';
	});

	async function handleSaveRole(e: SubmitEvent) {
		e.preventDefault();
		savingRole = true;
		try {
			const res = await api.patch<Role>(`/roles/${data.roleId}`, {
				name,
				description,
			});
			role = res.data;
			pushToast('Role berhasil diperbarui', 'success');
		} catch (err) {
			pushToast(
				err instanceof ApiError ? err.message : 'Gagal menyimpan role',
				'error',
			);
		} finally {
			savingRole = false;
		}
	}

	// --- Sync permissions ---
	// SvelteSet TANPA $state() -- dia sudah reaktif dengan sendirinya
	// (mutasi add/delete internal ke-track otomatis). $state() di sini
	// justru mubazir, TAPI itu cuma aman selama instance-nya sendiri
	// TIDAK PERNAH di-swap ke instance baru (kalau di-reassign, plain
	// `let` tanpa $state tidak akan ke-track Svelte). Makanya $effect di
	// bawah sengaja mutasi instance yang sama (.clear() + .add() satu-
	// satu), BUKAN `selectedPermissionIds = new SvelteSet(...)`.
	let selectedPermissionIds = new SvelteSet<number>();
	let savingPermissions = $state(false);

	$effect(() => {
		const current = data.permissions.value ?? [];
		selectedPermissionIds.clear();
		for (const p of current) selectedPermissionIds.add(p.id);
	});

	function togglePermission(id: number) {
		if (selectedPermissionIds.has(id)) selectedPermissionIds.delete(id);
		else selectedPermissionIds.add(id);
	}

	async function handleSyncPermissions() {
		savingPermissions = true;
		try {
			await api.put(`/roles/${data.roleId}/permissions`, {
				permissionIds: Array.from(selectedPermissionIds),
			});
			pushToast('Permission role berhasil diperbarui', 'success');
		} catch (err) {
			pushToast(
				err instanceof ApiError ? err.message : 'Gagal menyimpan permission',
				'error',
			);
		} finally {
			savingPermissions = false;
		}
	}

	// --- Assign/revoke user ---
	// Writable $derived (bukan $state + $effect) -- roleUsers otomatis
	// sinkron ulang dari data.users.value tiap kali prop itu berubah
	// (mis. pindah halaman ke role lain), TAPI tetap bisa di-reassign
	// langsung di handleAssignUser/handleRevokeUser di bawah untuk
	// update optimistik tanpa nunggu round-trip ke server. $effect
	// sebelumnya cuma nge-mirror data.users.value 1:1 tanpa side-effect
	// lain -- itu tanda pasti kandidat $derived, bukan $effect.
	let roleUsers = $derived<RoleUserSummary[]>(data.users.value ?? []);
	let newUserId = $state('');
	let assigning = $state(false);

	async function handleAssignUser(e: SubmitEvent) {
		e.preventDefault();
		const userId = Number(newUserId);
		if (!userId) return;
		assigning = true;
		try {
			await api.post(`/roles/${data.roleId}/users/${userId}`);
			pushToast('Role berhasil di-assign ke user', 'success');
			newUserId = '';
			const res = await api.get<RoleUserSummary[]>(
				`/roles/${data.roleId}/users`,
			);
			roleUsers = res.data;
		} catch (err) {
			pushToast(
				err instanceof ApiError ? err.message : 'Gagal assign user',
				'error',
			);
		} finally {
			assigning = false;
		}
	}

	async function handleRevokeUser(userId: number) {
		if (!confirm('Cabut role ini dari user tersebut?')) return;
		try {
			await api.delete(`/roles/${data.roleId}/users/${userId}`);
			pushToast('Role berhasil dicabut dari user', 'success');
			roleUsers = roleUsers.filter((u) => u.id !== userId);
		} catch (err) {
			pushToast(
				err instanceof ApiError ? err.message : 'Gagal mencabut role',
				'error',
			);
		}
	}
</script>

<BackLink href={resolve('/(app)/roles')} label="Kembali ke daftar role" />

<div class="mb-5">
	<h1 class="font-display text-xl font-semibold text-slate-900">
		Kelola Role <span class="font-mono text-slate-400">#{data.roleId}</span>
	</h1>
</div>

{#if data.role.error}
	<div
		class="max-w-md rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
	>
		{data.role.error}
	</div>
{:else if role}
	<div class="flex max-w-3xl flex-col gap-5">
		<Card>
			<h2 class="text-sm font-semibold text-slate-900">Detail Role</h2>
			<form
				class="mt-3.5 grid grid-cols-1 gap-3.5 sm:grid-cols-2"
				onsubmit={handleSaveRole}
			>
				<Input id="role-name" label="Nama" bind:value={name} required />
				<Input id="role-desc" label="Deskripsi" bind:value={description} />
				<div class="sm:col-span-2">
					<Button type="submit" loading={savingRole} disabled={savingRole}
						>Simpan</Button
					>
				</div>
			</form>
		</Card>

		<Card>
			<h2 class="text-sm font-semibold text-slate-900">Permission</h2>
			<p class="mt-1 text-xs text-slate-500">
				<code class="font-mono">PUT /roles/:id/permissions</code>
				(permission <code class="font-mono">role:manage-permissions</code>)
				&mdash; centang lalu simpan untuk MENGGANTI seluruh daftar permission
				role ini.
			</p>

			{#if data.allPermissions.error}
				<div
					class="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"
				>
					{data.allPermissions.error}
				</div>
			{:else}
				<div
					class="mt-3.5 grid grid-cols-1 gap-x-4 gap-y-1.5 sm:grid-cols-2 md:grid-cols-3"
				>
					{#each data.allPermissions.value ?? [] as p (p.id)}
						<label class="flex items-center gap-2 text-xs text-slate-700">
							<input
								type="checkbox"
								checked={selectedPermissionIds.has(p.id)}
								onchange={() => togglePermission(p.id)}
								class="rounded border-slate-300 text-teal-600 focus:ring-2 focus:ring-teal-600/30"
							/>
							<span class="font-mono">{p.name}</span>
						</label>
					{/each}
				</div>
				<div class="mt-3.5">
					<Button
						onclick={handleSyncPermissions}
						loading={savingPermissions}
						disabled={savingPermissions}
					>
						Simpan permission
					</Button>
				</div>
			{/if}
		</Card>

		<Card>
			<h2 class="text-sm font-semibold text-slate-900">User dengan role ini</h2>

			{#if data.users.error}
				<div
					class="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"
				>
					{data.users.error}
				</div>
			{:else}
				<form class="mt-3.5 flex items-end gap-2.5" onsubmit={handleAssignUser}>
					<div class="w-36">
						<Input
							id="new-user-id"
							label="User ID"
							bind:value={newUserId}
							placeholder="mis. 12"
							mono
						/>
					</div>
					<Button
						type="submit"
						size="sm"
						loading={assigning}
						disabled={assigning}>Assign</Button
					>
				</form>

				{#if roleUsers.length === 0}
					<p class="mt-3.5 text-xs text-slate-400">
						Belum ada user dengan role ini.
					</p>
				{:else}
					<table class="mt-3.5 w-full border-collapse text-[13.5px]">
						<thead>
							<tr>
								<th
									class="border-b border-slate-300 px-2.5 py-2 text-left text-xs font-semibold text-slate-500"
									>ID</th
								>
								<th
									class="border-b border-slate-300 px-2.5 py-2 text-left text-xs font-semibold text-slate-500"
									>Email</th
								>
								<th
									class="border-b border-slate-300 px-2.5 py-2 text-left text-xs font-semibold text-slate-500"
									>Status</th
								>
								<th class="border-b border-slate-300 px-2.5 py-2"></th>
							</tr>
						</thead>
						<tbody>
							{#each roleUsers as u (u.id)}
								<tr class="hover:bg-slate-50">
									<td class="border-b border-slate-200 px-2.5 py-2 font-mono"
										>{u.id}</td
									>
									<td class="border-b border-slate-200 px-2.5 py-2"
										>{u.email}</td
									>
									<td class="border-b border-slate-200 px-2.5 py-2">
										{#if u.isActive}
											<Badge variant="success">Aktif</Badge>
										{:else}
											<Badge variant="danger">Nonaktif</Badge>
										{/if}
									</td>
									<td class="border-b border-slate-200 px-2.5 py-2 text-right">
										<RowAction
											variant="danger"
											onclick={() => handleRevokeUser(u.id)}>Cabut</RowAction
										>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				{/if}
			{/if}
		</Card>
	</div>
{/if}
