<script lang="ts">
	import type { Product } from '$lib/types';
	import { formatCurrency, formatStock } from '$lib/utils/format';

	let {
		product
	}: {
		product: Product;
	} = $props();

	let stockClass = $derived(
		product.stock <= 0 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
		product.stock <= product.minStock ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
		'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
	);

	let descriptionPreview = $derived(
		product.description?.length > 80
			? product.description.slice(0, 80) + '...'
			: product.description || 'Sin descripción'
	);
</script>

<a
	href="/products/{product._id.toString()}"
	class="block p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-card)]
	       hover:border-[var(--color-primary-light)] hover:shadow-md transition-all duration-200
	       group"
>
	<div class="flex items-start justify-between gap-3">
		<div class="flex-1 min-w-0">
			<h3 class="text-sm font-semibold text-[var(--color-text)] truncate group-hover:text-[var(--color-primary)] transition-colors">
				{product.name}
			</h3>
			<p class="text-xs text-[var(--color-text-muted)] mt-0.5">SKU: {product.sku}</p>
		</div>
		<span class="shrink-0 px-2 py-0.5 rounded-full text-xs font-medium {stockClass}">
			{formatStock(product.stock)}
		</span>
	</div>

	<p class="mt-2 text-xs text-[var(--color-text-secondary)] leading-relaxed line-clamp-2">
		{descriptionPreview}
	</p>

	<div class="mt-3 flex items-center justify-between">
		<span class="text-base font-bold text-[var(--color-text)]">
			{formatCurrency(product.salePrice)}
		</span>
		<span class="text-xs text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] transition-colors">
			Ver detalle →
		</span>
	</div>
</a>
