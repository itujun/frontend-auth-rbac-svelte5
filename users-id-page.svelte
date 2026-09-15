<script lang="ts">
	import { api, ApiError, API_ORIGIN } from '$lib/api/client';
	import { resolve } from '$app/paths';
	import { pushToast } from '$lib/state/toast.svelte';
	import type { Profile } from '$lib/api/types';
	import Card from '$lib/components/ui/Card.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Textarea from '$lib/components/ui/Textarea.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import BackLink from '$lib/components/ui/BackLink.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let profile = $state<Profile | null>(null);
	let fullName = $state('');
	let phone = $state('');
	let bio = $state('');
	let saving = $state(false);

	// `data` reactive (berubah kalau SvelteKit reuse komponen ini saat
	// pindah antar /users/[id] yang beda) -- pakai $effect, BUKAN
	// inisialisasi $state langsung dari data.profile, supaya form ikut
	// ter-refresh saat userId berganti tanpa remount komponen.
	$effect(() => {
		profile = data.profile;
		fullName = data.profile?.fullName ?? '';
		phone = data.profile?.phone ?? '';
		bio = data.profile?.bio ?? '';
	});

	async function handleSave(e: SubmitEvent) {
		e.preventDefault();
		saving = true;
		try {
			const res = await api.patch<Profile>(`/profiles/${data.userId}`, {
				fullName,
				phone,
				bio,
			});
			profile = res.data;
			pushToast('Profil user berhasil diperbarui', 'success');
		} catch (err) {
			pushToast(
				err instanceof ApiError ? err.message : 'Gagal menyimpan profil',
				'error',
			);
		} finally {
			saving = false;
		}
	}

	let avatarSrc = $derived(profile ? `${API_ORIGIN}${profile.avatarUrl}` : '');
</script>

<BackLink href={resolve('/(app)/users')} label="Kembali ke daftar user" />

<div class="mb-5">
	<h1 class="font-display text-xl font-semibold text-slate-900">
		Profil User <span class="font-mono text-slate-400">#{data.userId}</span>
	</h1>
	<p class="mt-1 text-xs text-slate-500">
		<code class="font-mono">GET/PATCH /profiles/:userId</code>
		(permission <code class="font-mono">profile:read</code>/<code
			class="font-mono">profile:update</code
		>)
	</p>
</div>

{#if data.error}
	<div
		class="max-w-md rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
	>
		{data.error}
	</div>
{:else if profile}
	<div class="grid max-w-2xl grid-cols-1 gap-5 sm:grid-cols-[180px_1fr]">
		<Card class="flex flex-col items-center gap-2.5 text-center">
			<img
				src={avatarSrc}
				alt="Avatar"
				class="h-28 w-28 rounded-full border border-slate-200 bg-slate-50 object-cover"
			/>
			<p class="text-xs text-slate-400">
				Avatar hanya bisa diubah oleh user itu sendiri lewat halaman Profil
				Saya.
			</p>
		</Card>

		<Card>
			<form class="flex flex-col gap-3.5" onsubmit={handleSave}>
				<Input id="fullName" label="Nama lengkap" bind:value={fullName} />
				<Input id="phone" label="Telepon" bind:value={phone} />
				<Textarea id="bio" label="Bio" bind:value={bio} />
				<div>
					<Button type="submit" loading={saving} disabled={saving}
						>Simpan perubahan</Button
					>
				</div>
			</form>
		</Card>
	</div>
{/if}
