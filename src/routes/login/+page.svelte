<script lang="ts">
	import { goto } from '$app/navigation';
	import { login } from '$lib/state/auth.svelte';
	import { pushToast } from '$lib/state/toast.svelte';
	import { ApiError } from '$lib/api/client';
	import Input from '$lib/components/ui/Input.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';

	let email = $state('');
	let password = $state('');
	let loading = $state(false);
	let errorMessage = $state('');

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		errorMessage = '';
		loading = true;
		try {
			await login(email, password);
			pushToast('Login berhasil', 'success');
			goto('/profile');
		} catch (err) {
			errorMessage = err instanceof ApiError ? err.message : 'Login gagal';
		} finally {
			loading = false;
		}
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-slate-50 p-5">
	<Card class="w-full max-w-sm">
		<form class="flex flex-col gap-4" onsubmit={handleSubmit}>
			<div class="mb-1 text-center">
				<span class="text-xl text-teal-600">&#9670;</span>
				<h1 class="font-display mt-1.5 text-xl font-semibold text-slate-900">Access Console</h1>
				<p class="mt-1 text-xs text-slate-500">
					Masuk untuk menguji endpoint auth, RBAC, dan profile.
				</p>
			</div>

			{#if errorMessage}
				<div class="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
					{errorMessage}
				</div>
			{/if}

			<Input id="email" type="email" label="Email" bind:value={email} required autocomplete="username" />
			<Input
				id="password"
				type="password"
				label="Password"
				bind:value={password}
				required
				autocomplete="current-password"
			/>

			<Button type="submit" {loading} disabled={loading}>Masuk</Button>

			<p class="text-center text-xs text-slate-500">
				Belum punya akun?
				<a href="/register" class="font-semibold text-teal-700 hover:underline">Daftar</a>
			</p>
		</form>
	</Card>
</div>
