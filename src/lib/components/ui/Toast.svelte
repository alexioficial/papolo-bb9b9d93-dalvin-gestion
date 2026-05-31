<script lang="ts">
	import { useToast } from '$lib/stores/toast.svelte';

	let toast = useToast();
	let { toasts = toast.all } = $props();
</script>

{#if toasts.length > 0}
	<div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm" aria-live="polite">
		{#each toasts as t (t.id)}
			<div
				class="flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium
				       animate-[slideIn_0.3s_ease-out]
				       {t.type === 'success' ? 'bg-[var(--color-success)]' :
				         t.type === 'error' ? 'bg-[var(--color-error)]' :
				         t.type === 'warning' ? 'bg-[var(--color-warning)]' :
				         'bg-[var(--color-primary)]'}"
				role="alert"
			>
				<span class="flex-1">{t.message}</span>
				<button
					onclick={() => toast.remove(t.id)}
					class="text-white/80 hover:text-white transition-colors"
					aria-label="Cerrar notificación"
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
				</button>
			</div>
		{/each}
	</div>
{/if}

<style>
	@keyframes slideIn {
		from { transform: translateX(100%); opacity: 0; }
		to { transform: translateX(0); opacity: 1; }
	}
</style>
