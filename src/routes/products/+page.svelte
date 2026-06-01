<script lang="ts">
	import type { PageData } from './$types';
	import { formatCurrency, formatStock } from '$lib/utils/format';

	let { data } = $props<{ data: PageData }>();

	let products = data.products;
	let categories = data.categories;
	let user = data.user;
	let isAdmin = user?.role === 'admin';
</script>

<svelte:head>
	<title>Productos - Dalvin</title>
</svelte:head>

<div class="max-w-7xl mx-auto">
	<div class="flex items-center justify-between mb-6">
		<div>
			<h1 class="text-xl font-heading font-bold text-[var(--color-text)]">Productos</h1>
			<p class="text-sm text-[var(--color-text-muted)] mt-0.5">
				{products.total} producto{products.total !== 1 ? 's' : ''}
			</p>
		</div>
		{#if isAdmin}
			<a href="/products/new" class="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] transition-colors">
				+ Nuevo Producto
			</a>
		{/if}
	</div>

	{#if products.items.length === 0}
		<div class="text-center py-16">
			<p class="text-[var(--color-text-muted)]">No hay productos</p>
			{#if isAdmin}
				<a href="/products/new" class="mt-4 inline-block px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg">Crear primer producto</a>
			{/if}
		</div>
	{:else}
		<div class="overflow-x-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-card)]">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b border-[var(--color-border)] bg-[var(--color-surface-alt)]">
						<th class="text-left px-4 py-3 font-medium text-[var(--color-text-secondary)] text-xs uppercase">Nombre</th>
						<th class="text-left px-4 py-3 font-medium text-[var(--color-text-secondary)] text-xs uppercase">SKU</th>
						<th class="text-right px-4 py-3 font-medium text-[var(--color-text-secondary)] text-xs uppercase">Precio</th>
						<th class="text-right px-4 py-3 font-medium text-[var(--color-text-secondary)] text-xs uppercase">Stock</th>
						{#if isAdmin}
							<th class="text-right px-4 py-3 font-medium text-[var(--color-text-secondary)] text-xs uppercase">Acción</th>
						{/if}
					</tr>
				</thead>
				<tbody class="divide-y divide-[var(--color-border-light)]">
					{#each products.items as product}
						<tr class="hover:bg-[var(--color-surface-alt)] transition-colors">
							<td class="px-4 py-3 font-medium text-[var(--color-text)]">{product.name}</td>
							<td class="px-4 py-3 font-mono text-xs text-[var(--color-text-muted)]">{product.sku}</td>
							<td class="px-4 py-3 text-right">{formatCurrency(product.salePrice)}</td>
							<td class="px-4 py-3 text-right">{formatStock(product.stock)}</td>
							{#if isAdmin}
								<td class="px-4 py-3 text-right">
									<a href="/products/{product._id}/edit" class="text-[var(--color-primary)] text-xs">Editar</a>
								</td>
							{/if}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
