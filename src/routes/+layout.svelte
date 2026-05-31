<script lang="ts">
	import '../app.css';
	import Sidebar from '$lib/components/layout/Sidebar.svelte';
	import Header from '$lib/components/layout/Header.svelte';
	import Toast from '$lib/components/ui/Toast.svelte';
	import { useTheme } from '$lib/stores/theme.svelte';
	import { useToast } from '$lib/stores/toast.svelte';

	let { children, data } = $props();

	let user = $derived(data?.user ?? null);
	let sidebarOpen = $state(false);

	let theme = useTheme();
	let toast = useToast();
</script>

<!-- Inline script to prevent FOUC on dark mode -->
<svelte:head>
	<script>
		(function() {
			try {
				var t = localStorage.getItem('theme');
				if (t === 'dark' || (t !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
					document.documentElement.classList.add('dark');
				}
			} catch(e) {}
		})();
	</script>
</svelte:head>

<div class="min-h-screen bg-[var(--color-surface)]">
	<Sidebar {user} open={sidebarOpen} onClose={() => sidebarOpen = false} />

	<div class="lg:ml-64 min-h-screen flex flex-col">
		{#if user}
			<Header
				userName={user.name}
				userRole={user.role}
				onMenuToggle={() => sidebarOpen = !sidebarOpen}
			/>
		{/if}

		<main id="main-content" class="flex-1 p-4 lg:p-6">
			{@render children()}
		</main>
	</div>
</div>

<Toast />

<!-- skip link -->
<a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[var(--color-primary)] focus:text-white focus:rounded-lg">
	Saltar al contenido
</a>
