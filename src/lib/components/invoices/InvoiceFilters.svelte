<script lang="ts">
	import type { AppUser } from '$lib/types';

	let {
		user,
		cashiers = [],
		filters = { from: '', to: '', cashierId: '' },
		onFilter
	} = $props<{
		user: AppUser;
		cashiers?: Array<{ id: string; name: string; email: string }>;
		filters?: { from: string; to: string; cashierId: string };
		onFilter: (f: { from: string; to: string; cashierId: string }) => void;
	}>();

	let from = $state(filters.from || '');
	let to = $state(filters.to || '');
	let selectedCashier = $state(filters.cashierId || '');

	function apply() {
		onFilter({ from, to, cashierId: selectedCashier });
	}

	function clear() {
		from = '';
		to = '';
		selectedCashier = '';
		onFilter({ from: '', to: '', cashierId: '' });
	}
</script>

<div class="flex flex-wrap items-end gap-3">
	<!-- Fecha desde -->
	<div class="flex flex-col gap-1">
		<label for="filter-from" class="text-xs font-medium text-[var(--color-text-secondary)]">
			Desde
		</label>
		<input
			id="filter-from"
			type="date"
			bind:value={from}
			class="px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-card)]
			       text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30
			       focus:border-[var(--color-primary)] transition-colors"
		/>
	</div>

	<!-- Fecha hasta -->
	<div class="flex flex-col gap-1">
		<label for="filter-to" class="text-xs font-medium text-[var(--color-text-secondary)]">
			Hasta
		</label>
		<input
			id="filter-to"
			type="date"
			bind:value={to}
			class="px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-card)]
			       text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30
			       focus:border-[var(--color-primary)] transition-colors"
		/>
	</div>

	<!-- Selector de cajero (admin only) -->
	{#if user.role === 'admin' && cashiers.length > 0}
		<div class="flex flex-col gap-1">
			<label for="filter-cashier" class="text-xs font-medium text-[var(--color-text-secondary)]">
				Cajero
			</label>
			<select
				id="filter-cashier"
				bind:value={selectedCashier}
				class="px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-card)]
				       text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30
				       focus:border-[var(--color-primary)] transition-colors min-w-[160px]"
			>
				<option value="">Todos los cajeros</option>
				{#each cashiers as c}
					<option value={c.id}>{c.name}</option>
				{/each}
			</select>
		</div>
	{/if}

	<!-- Botones -->
	<div class="flex items-center gap-2">
		<button
			onclick={apply}
			class="px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white text-sm font-medium
			       hover:bg-[var(--color-primary-dark)] transition-colors"
		>
			Filtrar
		</button>
		<button
			onclick={clear}
			class="px-4 py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)]
			       text-sm font-medium hover:bg-[var(--color-surface-alt)] transition-colors"
		>
			Limpiar
		</button>
	</div>
</div>
