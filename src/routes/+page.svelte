<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	// Redirigir desde el cliente como fallback (el server redirect ya hace lo mismo)
	onMount(() => {
		const user = ($page.data as { user?: unknown })?.user;
		if (user) {
			goto('/dashboard');
		} else {
			goto('/login');
		}
	});
</script>

<div class="min-h-[calc(100vh-3rem)] flex items-center justify-center">
	<div class="text-center">
		<div class="w-14 h-14 rounded-xl bg-[var(--color-primary)] flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 animate-pulse">D</div>
		<p class="text-[var(--color-text-muted)]">Redirigiendo...</p>
	</div>
</div>
