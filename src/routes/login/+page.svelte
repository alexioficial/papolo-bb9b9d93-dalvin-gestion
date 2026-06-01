<script lang="ts">
	import { enhance } from '$app/forms';

	let { form } = $props();

	let email = $state('');
	let password = $state('');
	let error = $derived((form as Record<string, string>)?.error ?? '');
</script>

<div class="min-h-[calc(100vh-3rem)] flex items-center justify-center">
	<div class="w-full max-w-sm mx-auto">
		<div class="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-xl shadow-sm p-8">
			<div class="text-center mb-8">
				<div class="w-14 h-14 rounded-xl bg-[var(--color-primary)] flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">D</div>
				<h1 class="text-xl font-heading font-semibold text-[var(--color-text)]">Dalvin</h1>
				<p class="text-sm text-[var(--color-text-secondary)] mt-1">Sistema de Gestión</p>
			</div>

			<form method="POST" use:enhance>
				<div class="space-y-4">
					<div>
						<label for="email" class="block text-sm font-medium text-[var(--color-text)] mb-1.5">Correo electrónico</label>
						<input
							id="email"
							name="email"
							type="email"
							autocomplete="email"
							required
							bind:value={email}
							class="w-full px-3 py-2.5 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface-card)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:ring-2 focus:ring-[var(--color-primary-light)] focus:border-transparent outline-none transition-all"
							placeholder="admin@dalvin.com"
						/>
					</div>

					<div>
						<label for="password" class="block text-sm font-medium text-[var(--color-text)] mb-1.5">Contraseña</label>
						<input
							id="password"
							name="password"
							type="password"
							autocomplete="current-password"
							required
							bind:value={password}
							class="w-full px-3 py-2.5 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface-card)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:ring-2 focus:ring-[var(--color-primary-light)] focus:border-transparent outline-none transition-all"
							placeholder="••••••"
						/>
					</div>

					{#if error}
						<div class="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800" role="alert">
							<p class="text-sm text-[var(--color-error)]">{error}</p>
						</div>
					{/if}

					<button
						type="submit"
						class="w-full px-4 py-2.5 bg-[var(--color-primary)] text-white font-medium rounded-lg hover:bg-[var(--color-primary-dark)] active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						Iniciar sesión
					</button>
				</div>
			</form>

			<div class="mt-6 pt-6 border-t border-[var(--color-border)] text-xs text-[var(--color-text-muted)] text-center space-y-1">
				<p>Demo: <strong class="text-[var(--color-text)]">admin@dalvin.com</strong> / <strong class="text-[var(--color-text)]">admin123</strong></p>
				<p>Cajero: <strong class="text-[var(--color-text)]">carlos@dalvin.com</strong> / <strong class="text-[var(--color-text)]">cajero123</strong></p>
			</div>
		</div>
	</div>
</div>
