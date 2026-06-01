<script lang="ts">
	import type { PageData } from './$types';
	import type { Category } from '$lib/types';
	import ProductFilters from '$lib/components/products/ProductFilters.svelte';
	import ProductCard from '$lib/components/products/ProductCard.svelte';
	import { useToast } from '$lib/stores/toast.svelte';
	import { formatCurrency, formatStock, formatDate } from '$lib/utils/format';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	let { data } = $props<{ data: PageData }>();

	let toast = useToast();

	let products = $derived(data.products);
	let categories = $derived(data.categories);
	let user = $derived(data.user);
	let isAdmin = $derived(user?.role === 'admin');

	// Category map for display
	let categoryMap = $derived<Record<string, string>>(
		Object.fromEntries((categories as Category[]).map((c) => [c._id.toString(), c.name]))
	);

	function getCategoryName(catId: string): string {
		return categoryMap[catId] || catId || 'Sin categoría';
	}

	// Filtros locales para navegación client-side
	let search = $state(($page.url).searchParams.get('q') || '');
	let category = $state(($page.url).searchParams.get('category') || '');
	let lowStock = $state(($page.url).searchParams.get('lowStock') === 'true');

	// Debounce para búsqueda
	let debounceTimer: ReturnType<typeof setTimeout> | undefined;

	function applyFilters() {
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			const params = new URLSearchParams();
			if (search) params.set('q', search);
			if (category) params.set('category', category);
			if (lowStock) params.set('lowStock', 'true');
			params.set('page', '1');
			const qs = params.toString();
			goto(qs ? `/products?${qs}` : '/products', { replaceState: true, keepFocus: true });
		}, 400);
	}

	function clearFilters() {
		search = '';
		category = '';
		lowStock = false;
		goto('/products', { replaceState: true });
	}

	function goToPage(p: number) {
		const params = new URLSearchParams(($page.url).searchParams);
		params.set('page', p.toString());
		goto(`/products?${params.toString()}`, { keepFocus: true });
	}

	let loading = $state(false);

	// Sincronizar filtros con URL
	$effect(() => {
		const url = $page.url;
		search = url.searchParams.get('q') || '';
		category = url.searchParams.get('category') || '';
		lowStock = url.searchParams.get('lowStock') === 'true';
	});

	// Stock badge class
	function stockBadgeClass(stock: number, minStock: number): string {
		if (stock <= 0) return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
		if (stock <= minStock) return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
		return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
	}
</script>

<svelte:head>
	<title>Productos - Dalvin</title>
</svelte:head>

<div class="max-w-7xl mx-auto">
	<!-- Header -->
	<div class="flex items-center justify-between mb-6">
		<div>
			<h1 class="text-xl font-heading font-bold text-[var(--color-text)]">Productos</h1>
			<p class="text-sm text-[var(--color-text-muted)] mt-0.5">
				{products.total} producto{products.total !== 1 ? 's' : ''} • Página {products.page} de {products.totalPages}
			</p>
		</div>
		{#if isAdmin}
			<a
				href="/products/new"
				class="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white
				       bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] transition-colors"
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
				</svg>
				Nuevo Producto
			</a>
		{/if}
	</div>

	<!-- Filters -->
	<div class="mb-6">
		<ProductFilters
			{categories}
			bind:search
			bind:category
			bind:lowStock
			onClear={clearFilters}
		/>
	</div>

	<!-- Loading skeleton -->
	{#if loading}
		<div class="space-y-3">
			{#each Array(5) as _}
				<div class="skeleton h-16 w-full"></div>
			{/each}
		</div>

	<!-- Empty state -->
	{:else if products.items.length === 0}
		<div class="text-center py-16">
			<div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-surface-alt)] mb-4">
				<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-[var(--color-text-muted)]">
					<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
					<polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
				</svg>
			</div>
			<h3 class="text-base font-semibold text-[var(--color-text)] mb-1">No hay productos</h3>
			<p class="text-sm text-[var(--color-text-muted)] mb-4">
				{search || category || lowStock
					? 'No se encontraron productos con los filtros actuales. Intenta con otros términos.'
					: 'Comienza agregando tu primer producto al catálogo.'}
			</p>
			{#if search || category || lowStock}
				<button
					onclick={clearFilters}
					class="px-4 py-2 text-sm font-medium text-[var(--color-primary)] hover:bg-[var(--color-surface-alt)] rounded-lg transition-colors"
				>
					Limpiar filtros
				</button>
			{:else if isAdmin}
				<a
					href="/products/new"
					class="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white
					       bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] transition-colors"
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
					</svg>
					Crear primer producto
				</a>
			{/if}
		</div>

	<!-- Admin: Table view -->
	{:else if isAdmin}
		<div class="overflow-x-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-card)]">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b border-[var(--color-border)] bg-[var(--color-surface-alt)]">
						<th class="text-left px-4 py-3 font-medium text-[var(--color-text-secondary)] text-xs uppercase tracking-wider">SKU</th>
						<th class="text-left px-4 py-3 font-medium text-[var(--color-text-secondary)] text-xs uppercase tracking-wider">Nombre</th>
						<th class="text-left px-4 py-3 font-medium text-[var(--color-text-secondary)] text-xs uppercase tracking-wider">Categoría</th>
						<th class="text-right px-4 py-3 font-medium text-[var(--color-text-secondary)] text-xs uppercase tracking-wider">Precio Venta</th>
						<th class="text-right px-4 py-3 font-medium text-[var(--color-text-secondary)] text-xs uppercase tracking-wider">Stock</th>
						<th class="text-right px-4 py-3 font-medium text-[var(--color-text-secondary)] text-xs uppercase tracking-wider">Acciones</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-[var(--color-border-light)]">
					{#each products.items as product (product._id.toString())}
						<tr class="hover:bg-[var(--color-surface-alt)] transition-colors">
							<td class="px-4 py-3 font-mono text-xs text-[var(--color-text-muted)] whitespace-nowrap">{product.sku}</td>
							<td class="px-4 py-3">
								<a
									href="/products/{product._id.toString()}"
									class="font-medium text-[var(--color-text)] hover:text-[var(--color-primary)] transition-colors"
								>
									{product.name}
								</a>
							</td>
							<td class="px-4 py-3 text-[var(--color-text-secondary)] whitespace-nowrap">
								{getCategoryName(product.categoryId?.toString() || '')}
							</td>
							<td class="px-4 py-3 text-right font-medium text-[var(--color-text)] whitespace-nowrap">
								{formatCurrency(product.salePrice)}
							</td>
							<td class="px-4 py-3 text-right whitespace-nowrap">
								<span class="inline-block px-2 py-0.5 rounded-full text-xs font-medium {stockBadgeClass(product.stock, product.minStock)}">
									{formatStock(product.stock)}
								</span>
							</td>
							<td class="px-4 py-3 text-right whitespace-nowrap">
								<a
									href="/products/{product._id.toString()}/edit"
									class="px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--color-primary)]
									       hover:bg-[var(--color-primary)] hover:text-white transition-colors"
								>
									Editar
								</a>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

	<!-- Cajero: Card view -->
	{:else}
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
			{#each products.items as product (product._id.toString())}
				<ProductCard {product} />
			{/each}
		</div>
	{/if}

	<!-- Pagination -->
	{#if products && products.totalPages > 1}
		<nav class="mt-6 flex items-center justify-between" aria-label="Paginación">
			<p class="text-sm text-[var(--color-text-muted)]">
				Mostrando {((products.page - 1) * 20) + 1}–{Math.min(products.page * 20, products.total)} de {products.total}
			</p>
			<div class="flex items-center gap-2">
				<button
					onclick={() => goToPage(products.page - 1)}
					disabled={products.page <= 1}
					class="px-3 py-2 rounded-lg text-sm font-medium transition-colors
					       {products.page <= 1
					         ? 'text-[var(--color-text-muted)] cursor-not-allowed'
					         : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-alt)]'}"
				>
					Anterior
				</button>

				{#each Array(products.totalPages) as _, i}
					{@const p = i + 1}
					{#if p === 1 || p === products.totalPages || (p >= products.page - 1 && p <= products.page + 1)}
						<button
							onclick={() => goToPage(p)}
							class="w-8 h-8 rounded-lg text-sm font-medium transition-colors
							       {p === products.page
							         ? 'bg-[var(--color-primary)] text-white'
							         : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-alt)]'}"
						>
							{p}
						</button>
					{:else if p === products.page - 2 || p === products.page + 2}
						<span class="text-[var(--color-text-muted)]">…</span>
					{/if}
				{/each}

				<button
					onclick={() => goToPage(products.page + 1)}
					disabled={products.page >= products.totalPages}
					class="px-3 py-2 rounded-lg text-sm font-medium transition-colors
					       {products.page >= products.totalPages
					         ? 'text-[var(--color-text-muted)] cursor-not-allowed'
					         : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-alt)]'}"
				>
					Siguiente
				</button>
			</div>
		</nav>
	{/if}
</div>
