<script lang="ts">
	import type { Category, Product } from '$lib/types';
	import { validateProduct } from '$lib/utils/validation';
	import { formatCurrency } from '$lib/utils/format';

	let {
		categories = [] as Category[],
		initialData = null as Product | null,
		onSubmit,
		onCancel,
		isSubmitting = false,
		submitLabel = 'Guardar'
	}: {
		categories: Category[];
		initialData?: Product | null;
		onSubmit: (data: Record<string, unknown>) => void;
		onCancel: () => void;
		isSubmitting?: boolean;
		submitLabel?: string;
	} = $props();

	// Form state
	let name = $state(initialData?.name || '');
	let sku = $state(initialData?.sku || '');
	let description = $state(initialData?.description || '');
	let categoryId = $state(initialData?.categoryId?.toString() || '');
	let purchasePrice = $state(initialData?.purchasePrice?.toString() || '');
	let salePrice = $state(initialData?.salePrice?.toString() || '');
	let stock = $state(initialData?.stock?.toString() || '0');
	let minStock = $state(initialData?.minStock?.toString() || '5');

	// Validation state
	let errors = $state<Record<string, string>>({});
	let touched = $state<Record<string, boolean>>({});

	function validateField(field: string, value: string) {
		const numericValue = ['purchasePrice', 'salePrice', 'stock', 'minStock'].includes(field)
			? parseFloat(value) || 0
			: value;

		const data: Record<string, unknown> = {
			name,
			sku,
			purchasePrice: parseFloat(purchasePrice) || 0,
			salePrice: parseFloat(salePrice) || 0,
			stock: parseInt(stock) || 0
		};

		const allErrors = validateProduct(data as any);

		if (field === 'name' && !name.trim()) {
			errors = { ...errors, name: 'El nombre es requerido' };
		} else if (field === 'sku' && !sku.trim()) {
			errors = { ...errors, sku: 'El SKU es requerido' };
		} else if (field === 'purchasePrice' && (parseFloat(purchasePrice) < 0)) {
			errors = { ...errors, purchasePrice: 'No puede ser negativo' };
		} else if (field === 'salePrice' && parseFloat(salePrice) <= 0) {
			errors = { ...errors, salePrice: 'Debe ser mayor a 0' };
		} else if (field === 'salePrice' && parseFloat(salePrice) <= parseFloat(purchasePrice)) {
			errors = { ...errors, salePrice: 'Debe ser mayor al precio de compra' };
		} else if ((field === 'stock' || field === 'minStock') && (!Number.isInteger(parseInt(stock)) || parseInt(stock) < 0)) {
			errors = { ...errors, stock: 'Debe ser un entero >= 0' };
		} else {
			const newErrors = { ...errors };
			delete newErrors[field];
			errors = newErrors;
		}
	}

	function handleBlur(field: string) {
		touched = { ...touched, [field]: true };
		const value = field === 'name' ? name : field === 'sku' ? sku : field === 'description' ? description : field === 'categoryId' ? categoryId : field === 'purchasePrice' ? purchasePrice : field === 'salePrice' ? salePrice : field === 'stock' ? stock : minStock;
		validateField(field, value);
	}

	function validateAll(): boolean {
		const data = {
			name: name.trim(),
			sku: sku.trim(),
			purchasePrice: parseFloat(purchasePrice) || 0,
			salePrice: parseFloat(salePrice) || 0,
			stock: parseInt(stock) || 0
		};

		const allErrors = validateProduct(data);

		if (description && description.length > 500) {
			allErrors.description = 'La descripción no puede exceder 500 caracteres';
		}
		if (!categoryId && categories.length > 0) {
			allErrors.categoryId = 'Selecciona una categoría';
		}

		errors = allErrors;
		touched = { name: true, sku: true, description: true, categoryId: true, purchasePrice: true, salePrice: true, stock: true, minStock: true };
		return Object.keys(allErrors).length === 0;
	}

	function handleSubmit(e: Event) {
		e.preventDefault();
		if (!validateAll()) return;

		onSubmit({
			name: name.trim(),
			sku: sku.trim(),
			description: description.trim(),
			categoryId,
			purchasePrice: parseFloat(purchasePrice),
			salePrice: parseFloat(salePrice),
			stock: parseInt(stock),
			minStock: parseInt(minStock) || 5
		});
	}

	const hasErrors = $derived(Object.keys(errors).length > 0);

	$effect(() => {
		if (initialData) {
			name = initialData.name;
			sku = initialData.sku;
			description = initialData.description;
			categoryId = initialData.categoryId?.toString() || '';
			purchasePrice = initialData.purchasePrice.toString();
			salePrice = initialData.salePrice.toString();
			stock = initialData.stock.toString();
			minStock = initialData.minStock.toString();
			errors = {};
			touched = {};
		}
	});
</script>

<form onsubmit={handleSubmit} novalidate class="space-y-6">
	<!-- Name & SKU row -->
	<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
		<div>
			<label for="product-name" class="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
				Nombre <span class="text-[var(--color-error)]">*</span>
			</label>
			<input
				id="product-name"
				type="text"
				bind:value={name}
				onblur={() => handleBlur('name')}
				class="w-full px-3 py-2.5 rounded-lg border text-sm bg-[var(--color-surface-card)] text-[var(--color-text)]
				       placeholder:text-[var(--color-text-muted)] transition-colors
				       {touched.name && errors.name
				         ? 'border-[var(--color-error)] focus:ring-[var(--color-error)]'
				         : 'border-[var(--color-border)] focus:ring-[var(--color-primary)]'}
				       focus:outline-none focus:ring-2 focus:border-transparent"
				placeholder="Nombre del producto"
			/>
			{#if touched.name && errors.name}
				<p class="mt-1 text-xs text-[var(--color-error)]">{errors.name}</p>
			{/if}
		</div>

		<div>
			<label for="product-sku" class="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
				SKU <span class="text-[var(--color-error)]">*</span>
			</label>
			<input
				id="product-sku"
				type="text"
				bind:value={sku}
				onblur={() => handleBlur('sku')}
				class="w-full px-3 py-2.5 rounded-lg border text-sm bg-[var(--color-surface-card)] text-[var(--color-text)]
				       placeholder:text-[var(--color-text-muted)] transition-colors
				       {touched.sku && errors.sku
				         ? 'border-[var(--color-error)] focus:ring-[var(--color-error)]'
				         : 'border-[var(--color-border)] focus:ring-[var(--color-primary)]'}
				       focus:outline-none focus:ring-2 focus:border-transparent"
				placeholder="PROD-001"
			/>
			{#if touched.sku && errors.sku}
				<p class="mt-1 text-xs text-[var(--color-error)]">{errors.sku}</p>
			{/if}
		</div>
	</div>

	<!-- Description -->
	<div>
		<label for="product-description" class="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
			Descripción
		</label>
		<textarea
			id="product-description"
			bind:value={description}
			onblur={() => handleBlur('description')}
			rows="3"
			class="w-full px-3 py-2.5 rounded-lg border text-sm bg-[var(--color-surface-card)] text-[var(--color-text)]
			       placeholder:text-[var(--color-text-muted)] border-[var(--color-border)]
			       focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent
			       transition-colors resize-vertical"
			placeholder="Descripción del producto (opcional)"
		></textarea>
		{#if errors.description}
			<p class="mt-1 text-xs text-[var(--color-error)]">{errors.description}</p>
		{/if}
	</div>

	<!-- Category -->
	<div>
		<label for="product-category" class="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
			Categoría {#if categories.length > 0}<span class="text-[var(--color-error)]">*</span>{/if}
		</label>
		<select
			id="product-category"
			bind:value={categoryId}
			onblur={() => handleBlur('categoryId')}
			class="w-full px-3 py-2.5 rounded-lg border text-sm bg-[var(--color-surface-card)] text-[var(--color-text)]
			       {touched.categoryId && errors.categoryId
			         ? 'border-[var(--color-error)] focus:ring-[var(--color-error)]'
			         : 'border-[var(--color-border)] focus:ring-[var(--color-primary)]'}
			       focus:outline-none focus:ring-2 focus:border-transparent transition-colors"
		>
			<option value="">Seleccionar categoría...</option>
			{#each categories as cat}
				<option value={cat._id.toString()}>{cat.name}</option>
			{/each}
		</select>
		{#if touched.categoryId && errors.categoryId}
			<p class="mt-1 text-xs text-[var(--color-error)]">{errors.categoryId}</p>
		{/if}
	</div>

	<!-- Prices row -->
	<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
		<div>
			<label for="product-purchase-price" class="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
				Precio de compra
			</label>
			<div class="relative">
				<span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-muted)]">$</span>
				<input
					id="product-purchase-price"
					type="number"
					step="0.01"
					min="0"
					bind:value={purchasePrice}
					onblur={() => handleBlur('purchasePrice')}
					class="w-full pl-7 pr-3 py-2.5 rounded-lg border text-sm bg-[var(--color-surface-card)] text-[var(--color-text)]
					       {touched.purchasePrice && errors.purchasePrice
					         ? 'border-[var(--color-error)] focus:ring-[var(--color-error)]'
					         : 'border-[var(--color-border)] focus:ring-[var(--color-primary)]'}
					       focus:outline-none focus:ring-2 focus:border-transparent transition-colors"
					placeholder="0.00"
				/>
			</div>
			{#if touched.purchasePrice && errors.purchasePrice}
				<p class="mt-1 text-xs text-[var(--color-error)]">{errors.purchasePrice}</p>
			{/if}
		</div>

		<div>
			<label for="product-sale-price" class="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
				Precio de venta <span class="text-[var(--color-error)]">*</span>
			</label>
			<div class="relative">
				<span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-muted)]">$</span>
				<input
					id="product-sale-price"
					type="number"
					step="0.01"
					min="0.01"
					bind:value={salePrice}
					onblur={() => handleBlur('salePrice')}
					class="w-full pl-7 pr-3 py-2.5 rounded-lg border text-sm bg-[var(--color-surface-card)] text-[var(--color-text)]
					       {touched.salePrice && errors.salePrice
					         ? 'border-[var(--color-error)] focus:ring-[var(--color-error)]'
					         : 'border-[var(--color-border)] focus:ring-[var(--color-primary)]'}
					       focus:outline-none focus:ring-2 focus:border-transparent transition-colors"
					placeholder="0.00"
				/>
			</div>
			{#if touched.salePrice && errors.salePrice}
				<p class="mt-1 text-xs text-[var(--color-error)]">{errors.salePrice}</p>
			{/if}
		</div>
	</div>

	<!-- Stock row -->
	<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
		<div>
			<label for="product-stock" class="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
				Stock actual <span class="text-[var(--color-error)]">*</span>
			</label>
			<input
				id="product-stock"
				type="number"
				min="0"
				step="1"
				bind:value={stock}
				onblur={() => handleBlur('stock')}
				class="w-full px-3 py-2.5 rounded-lg border text-sm bg-[var(--color-surface-card)] text-[var(--color-text)]
				       {touched.stock && errors.stock
				         ? 'border-[var(--color-error)] focus:ring-[var(--color-error)]'
				         : 'border-[var(--color-border)] focus:ring-[var(--color-primary)]'}
				       focus:outline-none focus:ring-2 focus:border-transparent transition-colors"
				placeholder="0"
			/>
			{#if touched.stock && errors.stock}
				<p class="mt-1 text-xs text-[var(--color-error)]">{errors.stock}</p>
			{/if}
		</div>

		<div>
			<label for="product-min-stock" class="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
				Stock mínimo
			</label>
			<input
				id="product-min-stock"
				type="number"
				min="0"
				step="1"
				bind:value={minStock}
				onblur={() => handleBlur('minStock')}
				class="w-full px-3 py-2.5 rounded-lg border text-sm bg-[var(--color-surface-card)] text-[var(--color-text)]
				       border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]
				       focus:border-transparent transition-colors"
				placeholder="5"
			/>
			<p class="mt-1 text-xs text-[var(--color-text-muted)]">Alerta cuando el stock baje de este valor</p>
		</div>
	</div>

	<!-- Summary preview -->
	{#if salePrice && purchasePrice}
		{@const margin = parseFloat(salePrice) - parseFloat(purchasePrice)}
		{@const marginPercent = parseFloat(purchasePrice) > 0 ? ((margin / parseFloat(purchasePrice)) * 100).toFixed(1) : '—'}
		<div class="p-3 rounded-lg bg-[var(--color-surface-alt)] border border-[var(--color-border-light)]">
			<p class="text-xs font-medium text-[var(--color-text-secondary)]">Resumen</p>
			<div class="mt-1 flex gap-4 text-sm">
				<span class="text-[var(--color-text-secondary)]">
					Margen: <strong class="text-[var(--color-success)]">{formatCurrency(margin)}</strong>
				</span>
				{#if marginPercent !== '—'}
					<span class="text-[var(--color-text-secondary)]">
						Rentabilidad: <strong class="text-[var(--color-primary)]">{marginPercent}%</strong>
					</span>
				{/if}
			</div>
		</div>
	{/if}

	<!-- Actions -->
	<div class="flex items-center justify-end gap-3 pt-4 border-t border-[var(--color-border-light)]">
		<button
			type="button"
			onclick={onCancel}
			class="px-4 py-2.5 rounded-lg text-sm font-medium text-[var(--color-text-secondary)]
			       hover:bg-[var(--color-surface-alt)] transition-colors"
		>
			Cancelar
		</button>
		<button
			type="submit"
			disabled={isSubmitting}
			class="px-6 py-2.5 rounded-lg text-sm font-medium text-white bg-[var(--color-primary)]
			       hover:bg-[var(--color-primary-dark)] disabled:opacity-50 disabled:cursor-not-allowed
			       transition-colors flex items-center gap-2"
		>
			{#if isSubmitting}
				<svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
					<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
					<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
				</svg>
				Guardando...
			{:else}
				{submitLabel}
			{/if}
		</button>
	</div>
</form>
