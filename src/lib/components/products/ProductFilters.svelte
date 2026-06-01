<script lang="ts">
	import type { Category } from '$lib/types';

	let {
		categories = [] as Category[],
		search = $bindable(''),
		category = $bindable(''),
		lowStock = $bindable(false),
		onClear
	}: {
		categories: Category[];
		search?: string;
		category?: string;
		lowStock?: boolean;
		onClear?: () => void;
	} = $props();

	let searchValue = $state(search);
	let categoryValue = $state(category);
	let lowStockValue = $state(lowStock);

	// Sincronizar bindings
	$effect(() => {
		search = searchValue;
	});
	$effect(() => {
		category = categoryValue;
	});
	$effect(() => {
		lowStock = lowStockValue;
	});

	function handleClear() {
		searchValue = '';
		categoryValue = '';
		lowStockValue = false;
		onClear?.();
	}

	const hasFilters = $derived(searchValue || categoryValue || lowStockValue);
</script>

<div class="flex flex-col sm:flex-row gap-3 flex-wrap items-start sm:items-end">
	<!-- Search -->
	<div class="flex-1 min-w-[200px]">
		<label for="product-search" class="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">
			Buscar
		</label>
		<div class="relative">
			<svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
			</svg>
			<input
				id="product-search"
				type="text"
				placeholder="Nombre, SKU o descripción..."
				bind:value={searchValue}
				class="w-full pl-9 pr-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-card)]
				       text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]
				       focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent
				       transition-colors"
			/>
		</div>
	</div>

	<!-- Category dropdown -->
	<div class="w-full sm:w-48">
		<label for="category-filter" class="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">
			Categoría
		</label>
		<select
			id="category-filter"
			bind:value={categoryValue}
			class="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-card)]
			       text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]
			       focus:border-transparent transition-colors"
		>
			<option value="">Todas las categorías</option>
			{#each categories as cat}
				<option value={cat._id.toString()}>{cat.name}</option>
			{/each}
		</select>
	</div>

	<!-- Low stock toggle -->
	<label class="flex items-center gap-2 py-2 cursor-pointer">
		<input
			type="checkbox"
			bind:checked={lowStockValue}
			class="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-primary)]
			       focus:ring-[var(--color-primary)] focus:ring-2"
		/>
		<span class="text-sm text-[var(--color-text-secondary)] font-medium">Stock bajo</span>
	</label>

	<!-- Clear button -->
	{#if hasFilters}
		<button
			onclick={handleClear}
			class="px-3 py-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]
			       hover:bg-[var(--color-surface-alt)] rounded-lg transition-colors"
		>
			Limpiar filtros
		</button>
	{/if}
</div>
