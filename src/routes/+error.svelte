<script lang="ts">
	import { page } from '$app/stores';
	import { dev } from '$app/environment';

	let status = $derived($page.status);
	let message = $derived(
		status === 404 ? 'Página no encontrada' :
		status === 403 ? 'Acceso denegado' :
		status === 500 ? 'Error interno del servidor' :
		'Error inesperado'
	);
	let description = $derived(
		status === 404 ? 'La página que buscas no existe o ha sido movida.' :
		status === 403 ? 'No tienes permisos para acceder a esta sección.' :
		status === 500 ? 'Ocurrió un error en el servidor. Intenta de nuevo más tarde.' :
		'Algo salió mal. Por favor intenta de nuevo.'
	);
	let errorMessage = $derived($page.error?.message ?? '');
</script>

<div class="min-h-screen flex items-center justify-center p-4">
	<div class="text-center max-w-md">
		<!-- Código de error grande -->
		<div class="mb-6">
			<span class="text-8xl font-heading font-bold text-[var(--color-primary)] opacity-30 select-none">
				{status}
			</span>
		</div>

		<!-- Icono decorativo -->
		<div class="mb-6">
			{#if status === 404}
				<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mx-auto">
					<circle cx="11" cy="11" r="8"/>
					<line x1="21" y1="21" x2="16.65" y2="16.65"/>
					<line x1="8" y1="11" x2="14" y2="11"/>
				</svg>
			{:else if status === 403}
				<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mx-auto">
					<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
					<path d="M7 11V7a5 5 0 0 1 10 0v4"/>
				</svg>
			{:else}
				<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mx-auto">
					<circle cx="12" cy="12" r="10"/>
					<line x1="12" y1="8" x2="12" y2="12"/>
					<line x1="12" y1="16" x2="12.01" y2="16"/>
				</svg>
			{/if}
		</div>

		<h1 class="text-2xl font-heading font-semibold text-[var(--color-text)] mb-2">{message}</h1>
		<p class="text-[var(--color-text-secondary)] mb-8">{description}</p>

		{#if dev && errorMessage}
			<div class="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-left">
				<p class="text-xs font-mono text-[var(--color-error)] break-all">{errorMessage}</p>
			</div>
		{/if}

		<div class="flex items-center justify-center gap-3">
			<button
				onclick={() => window.history.back()}
				class="px-4 py-2.5 border border-[var(--color-border)] text-[var(--color-text)] font-medium rounded-lg hover:bg-[var(--color-surface-alt)] transition-all text-sm"
			>
				Volver atrás
			</button>
			<a
				href="/dashboard"
				class="px-4 py-2.5 bg-[var(--color-primary)] text-white font-medium rounded-lg hover:bg-[var(--color-primary-dark)] transition-all text-sm"
			>
				Ir al inicio
			</a>
		</div>
	</div>
</div>
