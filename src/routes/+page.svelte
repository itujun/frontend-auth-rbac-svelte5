<script lang="ts">
	import { goto } from '$app/navigation';
	import { authState } from '$lib/state/auth.svelte';

	$effect(() => {
		goto(authState.currentUser ? '/profile' : '/login', { replaceState: true });
	});
</script>
