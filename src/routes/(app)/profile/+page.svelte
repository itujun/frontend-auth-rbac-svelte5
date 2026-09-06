<script lang="ts">
	import { onMount } from 'svelte';
	import { api, ApiError, API_ORIGIN } from '$lib/api/client';
	import { pushToast } from '$lib/state/toast.svelte';
	import type { Profile } from '$lib/api/types';
	import Card from '$lib/components/ui/Card.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Textarea from '$lib/components/ui/Textarea.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	let profile = $state<Profile | null>(null);
	let loading = $state(true);
	let errorMessage = $state('');
	let saving = $state(false);
	let uploading = $state(false);
	let fileInput = $state<HTMLInputElement | undefined>(undefined);

	let fullName = $state('');
	let phone = $state('');
	let bio = $state('');

	async function loadProfile() {
		loading = true;
		errorMessage = '';
		try {
			const res = await api.get<Profile>('/profile/me');
			profile = res.data;
			fullName = profile.fullName ?? '';
			phone = profile.phone ?? '';
			bio = profile.bio ?? '';
		} catch (err) {
			errorMessage = err instanceof ApiError ? err.message : 'Gagal memuat profile';
		} finally {
			loading = false;
		}
	}

	onMount(loadProfile);

	async function handleSave(e: SubmitEvent) {
		e.preventDefault();
		saving = true;
		try {
			const res = await api.patch<Profile>('/profile/me', { fullName, phone, bio });
			profile = res.data;
			pushToast('Profil berhasil diperbarui', 'success');
		} catch (err) {
			pushToast(err instanceof ApiError ? err.message : 'Gagal menyimpan profil', 'error');
		} finally {
			saving = false;
		}
	}

	async function handleAvatarChange(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		uploading = true;
		try {
			const formData = new FormData();
			formData.append('avatar', file);
			const res = await api.upload<Profile>('/profile/me/avatar', formData);
			profile = res.data;
			pushToast('Avatar berhasil diperbarui', 'success');
		} catch (err) {
			pushToast(err instanceof ApiError ? err.message : 'Upload avatar gagal', 'error');
		} finally {
			uploading = false;
			if (fileInput) fileInput.value = '';
		}
	}

	async function handleResetAvatar() {
		uploading = true;
		try {
			const res = await api.delete<Profile>('/profile/me/avatar');
			profile = res.data;
			pushToast('Avatar direset ke default', 'success');
		} catch (err) {
			pushToast(err instanceof ApiError ? err.message : 'Gagal reset avatar', 'error');
		} finally {
			uploading = false;
		}
	}

	let avatarSrc = $derived(profile ? `${API_ORIGIN}${profile.avatarUrl}` : '');
</script>

<div class="mb-5">
	<h1 class="font-display text-xl font-semibold text-slate-900">Profil Saya</h1>
	<p class="mt-1 text-xs text-slate-500">
		<code class="font-mono">GET/PATCH /profile/me</code> &middot;
		<code class="font-mono">POST/DELETE /profile/me/avatar</code>
	</p>
</div>

{#if loading}
	<div class="p-10 text-center text-sm text-slate-500">Memuat...</div>
{:else if errorMessage}
	<div class="rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
		{errorMessage}
	</div>
{:else if profile}
	<div class="grid grid-cols-1 gap-5 sm:grid-cols-[220px_1fr]">
		<Card class="flex flex-col items-center gap-2.5 text-center">
			<img
				src={avatarSrc}
				alt="Avatar"
				class="h-32 w-32 rounded-full border border-slate-200 bg-slate-50 object-cover"
			/>
			<div class="flex w-full flex-col gap-1.5">
				<label
					class="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap text-slate-800 hover:border-slate-400"
				>
					{uploading ? 'Mengupload...' : 'Upload avatar'}
					<input
						bind:this={fileInput}
						type="file"
						accept="image/jpeg,image/png,image/webp"
						onchange={handleAvatarChange}
						disabled={uploading}
						hidden
					/>
				</label>
				<Button variant="outline" size="sm" onclick={handleResetAvatar} disabled={uploading}>
					Reset ke default
				</Button>
			</div>
			<p class="text-xs text-slate-400">
				JPEG/PNG/WebP, maks 5MB.<br />Otomatis dikompres ke WebP 512x512.
			</p>
		</Card>

		<Card>
			<h2 class="text-sm font-semibold text-slate-900">Detail Profil</h2>
			<form class="mt-3.5 flex flex-col gap-3.5" onsubmit={handleSave}>
				<Input id="fullName" label="Nama lengkap" bind:value={fullName} />
				<Input id="phone" label="Telepon" bind:value={phone} />
				<Textarea id="bio" label="Bio" bind:value={bio} />
				<div>
					<Button type="submit" loading={saving} disabled={saving}>Simpan perubahan</Button>
				</div>
			</form>
		</Card>
	</div>
{/if}
