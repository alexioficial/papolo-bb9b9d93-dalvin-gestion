<script lang="ts">
	import type { PageData } from './$types';
	import { useToast } from '$lib/stores/toast.svelte';
	import { formatCurrency, formatStock, formatDate } from '$lib/utils/format';
	import { goto } from '$app/navigation';

	let { data } = $props<{ data: PageData }>();

	let toast = useToast();

	let product = $derived(data.product);
	let category = $derived(data.category);
	let user = $derived(data.user);
	let isAdmin = $derived(user?.role === 'admin');
	let createdByName = $derived(data.createdByName);

	let showDeleteModal = $state(false);
	let isDeleting = $state(false);

	function handleDelete() {
		showDeleteModal = true;
	}

	async function confirmDelete() {
		isDeleting = true;
		try {
			const res = await fetch(`/products/${product._id.toString()}/edit`, {
				method: 'DELETE'
			});
			if (res.ok || res.redirected) {
				toast.success('Producto eliminado exitosamente');
				goto('/products');
			} else {
				const body = await res.json().catch(() => ({}));
				toast.error((body as any)?.error || 'Error al eliminar el producto');
				isDeleting = false;
				showDeleteModal = false;
			}
		} catch {
			toast.error('Error de conexión al eliminar el producto');
			isDeleting = false;
			showDeleteModal = false;
		}
	}

	function cancelDelete() {
		showDeleteModal = false;
	}

	// Stock badge class
	let stockClass = $derived(
		product.stock <= 0
			? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
			: product.stock <= product.minStock
				? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
				: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
	);

	let margin = $derived(product.salePrice - product.purchasePrice);
	let marginPercent = $derived(
		product.purchasePrice > 0 ? ((margin / product.purchasePrice) * 100).toFixed(1) : '—'
	);
</script>

<svelte:head>
	<title>{product.name} - Dalvin</title>
</svelte:head>

<div class="max-w-4xl mx-auto">
	<!-- Breadcrumb -->
	<nav class="flex items-center gap-2 text-sm text-[var(--color-text-muted)] mb-4">
		<a href="/products" class="hover:text-[var(--color-primary)] transition-colors">Productos</a>
		<span>/</span>
		<span class="text-[var(--color-text-secondary)] truncate max-w-[200px]">{product.name}</span>
	</nav>

	<!-- Main card -->
	<div class="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-card)] overflow-hidden">
		<!-- Header -->
		<div class="px-6 py-5 border-b border-[var(--color-border-light)] flex items-start justify-between gap-4">
			<div>
				<h1 class="text-xl font-heading font-bold text-[var(--color-text)]">{product.name}</h1>
				<p class="text-sm text-[var(--color-text-muted)] mt-0.5">SKU: <span class="font-mono">{product.sku}</span></p>
			</div>
			<div class="flex items-center gap-2 shrink-0">
				<span class="px-3 py-1 rounded-full text-xs font-medium {stockClass}">
					{formatStock(product.stock)}
				</span>
				{#if !product.isActive}
					<span class="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
						Inactivo
					</span>
				{/if}
			</div>
		</div>

		<!-- Content -->
		<div class="p-6">
			<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
				<!-- Left column: Details -->
				<div class="space-y-5">
					<div>
						<h3 class="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Información General</h3>
						<dl class="space-y-3">
							<div>
								<dt class="text-xs text-[var(--color-text-muted)]">Nombre</dt>
								<dd class="text-sm font-medium text-[var(--color-text)]">{product.name}</dd>
							</div>
							<div>
								<dt class="text-xs text-[var(--color-text-muted)]">SKU</dt>
								<dd class="text-sm font-mono text-[var(--color-text)]">{product.sku}</dd>
							</div>
							<div>
								<dt class="text-xs text-[var(--color-text-muted)]">Categoría</dt>
								<dd class="text-sm text-[var(--color-text)]">
									{category?.name || product.categoryId || 'Sin categoría'}
								</dd>
							</div>
							<div>
								<dt class="text-xs text-[var(--color-text-muted)]">Descripción</dt>
								<dd class="text-sm text-[var(--color-text-secondary)] leading-relaxed">
									{product.description || 'Sin descripción'}
								</dd>
							</div>
							<div>
								<dt class="text-xs text-[var(--color-text-muted)]">Estado</dt>
								<dd class="text-sm text-[var(--color-text)]">
									{product.isActive ? 'Activo' : 'Inactivo'}
								</dd>
							</div>
						</dl>
					</div>

					<div>
						<h3 class="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Stock</h3>
						<dl class="space-y-3">
							<div class="flex items-center gap-4">
								<div>
									<dt class="text-xs text-[var(--color-text-muted)]">Actual</dt>
									<dd class="text-lg font-bold text-[var(--color-text)]">{product.stock}</dd>
								</div>
								<div>
									<dt class="text-xs text-[var(--color-text-muted)]">Mínimo</dt>
									<dd class="text-lg font-bold text-[var(--color-text)]">{product.minStock}</dd>
								</div>
							</div>
						</dl>
					</div>
				</div>

				<!-- Right column: Pricing -->
				<div class="space-y-5">
					<div>
						<h3 class="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Precios</h3>
						<div class="p-4 rounded-lg bg-[var(--color-surface-alt)] border border-[var(--color-border-light)] space-y-3">
							<div class="flex justify-between items-center">
								<span class="text-sm text-[var(--color-text-secondary)]">Precio de compra</span>
								<span class="text-sm font-medium text-[var(--color-text)]">{formatCurrency(product.purchasePrice)}</span>
							</div>
							<div class="border-t border-[var(--color-border-light)]"></div>
							<div class="flex justify-between items-center">
								<span class="text-sm text-[var(--color-text-secondary)]">Precio de venta</span>
								<span class="text-lg font-bold text-[var(--color-text)]">{formatCurrency(product.salePrice)}</span>
							</div>
							<div class="border-t border-[var(--color-border-light)]"></div>
							<div class="flex justify-between items-center">
								<span class="text-sm text-[var(--color-text-secondary)]">Margen</span>
								<span class="text-sm font-semibold text-[var(--color-success)]">+{formatCurrency(margin)}</span>
							</div>
							{#if marginPercent !== '—'}
								<div class="flex justify-between items-center">
									<span class="text-sm text-[var(--color-text-secondary)]">Rentabilidad</span>
									<span class="text-sm font-semibold text-[var(--color-primary)]">{marginPercent}%</span>
								</div>
							{/if}
						</div>
					</div>

					<div>
						<h3 class="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Auditoría</h3>
						<dl class="space-y-2">
							<div>
								<dt class="text-xs text-[var(--color-text-muted)]">Creado por</dt>
								<dd class="text-sm text-[var(--color-text)]">{createdByName}</dd>
							</div>
							<div>
								<dt class="text-xs text-[var(--color-text-muted)]">Fecha de creación</dt>
								<dd class="text-sm text-[var(--color-text)]">{formatDate(product.createdAt)}</dd>
							</div>
							<div>
								<dt class="text-xs text-[var(--color-text-muted)]">Última actualización</dt>
								<dd class="text-sm text-[var(--color-text)]">{formatDate(product.updatedAt)}</dd>
							</div>
						</dl>
					</div>
				</div>
			</div>
		</div>

		<!-- Footer: Actions -->
		{#if isAdmin}
			<div class="px-6 py-4 border-t border-[var(--color-border-light)] bg-[var(--color-surface-alt)] flex items-center justify-end gap-3">
				<button
					onclick={handleDelete}
					class="px-4 py-2 rounded-lg text-sm font-medium text-[var(--color-error)]
					       hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
				>
					Eliminar
				</button>
				<a
					href="/products/{product._id.toString()}/edit"
					class="px-4 py-2 rounded-lg text-sm font-medium text-white bg-[var(--color-primary)]
					       hover:bg-[var(--color-primary-dark)] transition-colors"
				>
					Editar Producto
				</a>
			</div>
		{/if}
	</div>
</div>

<!-- Delete Confirmation Modal -->
{#if showDeleteModal}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div
		class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
		onclick={cancelDelete}
		role="presentation"
	>
		<!-- svelte-ignore a11y_interactive_supports_focus -->
		<div
			class="bg-[var(--color-surface-card)] rounded-xl border border-[var(--color-border)] p-6 max-w-md w-full shadow-xl"
			onclick={(e) => e.stopPropagation()}
			role="dialog"
			aria-modal="true"
			aria-labelledby="delete-modal-title"
			tabindex="-1"
		>
			<div class="flex items-center gap-3 mb-4">
				<div class="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-[var(--color-error)]">
						<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
						<line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
					</svg>
				</div>
				<div>
					<h3 id="delete-modal-title" class="text-base font-semibold text-[var(--color-text)]">Eliminar Producto</h3>
					<p class="text-sm text-[var(--color-text-muted)]">Esta acción no se puede deshacer</p>
				</div>
			</div>

			<p class="text-sm text-[var(--color-text-secondary)] mb-6">
				¿Estás seguro de que deseas eliminar <strong>"{product.name}"</strong> (SKU: {product.sku})?
				Este producto se eliminará permanentemente del catálogo.
			</p>

			<div class="flex items-center justify-end gap-3">
				<button
					onclick={cancelDelete}
					disabled={isDeleting}
					class="px-4 py-2 rounded-lg text-sm font-medium text-[var(--color-text-secondary)]
					       hover:bg-[var(--color-surface-alt)] disabled:opacity-50 transition-colors"
				>
					Cancelar
				</button>
				<button
					onclick={confirmDelete}
					disabled={isDeleting}
					class="px-4 py-2 rounded-lg text-sm font-medium text-white bg-[var(--color-error)]
					       hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors
					       flex items-center gap-2"
				>
					{#if isDeleting}
						<svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
						</svg>
						Eliminando...
					{:else}
						Sí, eliminar
					{/if}
				</button>
			</div>
		</div>
	</div>
{/if}
