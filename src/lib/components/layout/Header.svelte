<script lang="ts">
	import { useTheme } from '$lib/stores/theme.svelte';

	let { userName, userRole, onMenuToggle } = $props<{
		userName: string;
		userRole: string;
		onMenuToggle: () => void;
	}>();

	let theme = $derived(useTheme());
</script>

<header class="sticky top-0 z-20 bg-[var(--color-surface-card)]/80 backdrop-blur-sm border-b border-[var(--color-border)]">
	<div class="flex items-center justify-between px-4 lg:px-6 h-16">
		<!-- Left: hamburger + page title -->
		<div class="flex items-center gap-4">
			<button
				class="lg:hidden p-2 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-alt)] transition-colors"
				onclick={onMenuToggle}
				aria-label="Abrir menú"
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
			</button>
		</div>

		<!-- Right: theme toggle + user -->
		<div class="flex items-center gap-3">
			<button
				onclick={theme.toggle}
				class="p-2 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-alt)] transition-colors"
				aria-label={theme.isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
			>
				{#if theme.isDark}
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
				{:else}
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
				{/if}
			</button>

			<div class="flex items-center gap-2 text-sm">
				<div class="hidden sm:block text-right">
					<p class="text-[var(--color-text)] font-medium">{userName}</p>
					<p class="text-[var(--color-text-muted)] text-xs capitalize">{userRole}</p>
				</div>
				<div class="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white text-xs font-bold uppercase">
					{userName?.charAt(0) || 'U'}
				</div>
			</div>
		</div>
	</div>
</header>
