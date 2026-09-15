<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { authState } from '$lib/state/auth.svelte';

	$effect(() => {
		goto(resolve(authState.currentUser ? '/profile' : '/login'), {
			replaceState: true,
		});
	});
</script>
