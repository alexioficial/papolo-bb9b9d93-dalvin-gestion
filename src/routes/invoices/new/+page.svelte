<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { formatCurrency } from '$lib/utils/format';
	import { useToast } from '$lib/stores/toast.svelte';

	let { data } = $props<{ data: PageData }>();

	let toast = useToast();
	let user = $derived(data.user);

	// --- Estado del formulario ---
	let items = $state<Array<{
		productId: string;
		productName: string;
		quantity: number;
		unitPrice: number;
		purchasePrice: number;
	}>>([]);

	let paymentMethod = $state<'cash' | 'card' | 'transfer'>('cash');

	// --- Búsqueda de productos ---
	let searchQuery = $state('');
	let searchResults = $state<Array<{
		_id: string;
		name: string;
		sku: string;
		salePrice: number;
		purchasePrice: number;
		stock: number;
	}>>([]);
	let searchOpen = $state(false);
	let searching = $state(false);
	let searchTimeout: ReturnType<typeof setTimeout> | null = null;
	let searchInputEl = $state<HTMLInputElement | null>(null);

	// --- Totales calculados ---
	let total = $derived(
		items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
	);
	let totalProfit = $derived(
		items.reduce((sum, item) => sum + (item.unitPrice - item.purchasePrice) * item.quantity, 0)
	);

	// --- Búsqueda debounced ---
	function onSearchInput(e: Event) {
		const target = e.target as HTMLInputElement;
		searchQuery = target.value;

		if (searchTimeout) clearTimeout(searchTimeout);

		if (searchQuery.length < 1) {
			searchResults = [];
			searchOpen = false;
			return;
		}

		searchTimeout = setTimeout(async () => {
			searching = true;
			try {
				const res = await fetch(`/api/products/search?q=${encodeURIComponent(searchQuery)}`);
				if (res.ok) {
					const json = await res.json();
					searchResults = json.items;
					searchOpen = json.items.length > 0;
				} else {
					searchResults = [];
					searchOpen = false;
				}
			} catch {
				searchResults = [];
				searchOpen = false;
			} finally {
				searching = false;
			}
		}, 300);
	}

	function selectProduct(product: {
		_id: string;
		name: string;
		sku: string;
		salePrice: number;
		purchasePrice: number;
		stock: number;
	}) {
		// Verificar si ya está agregado
		const exists = items.find((i) => i.productId === product._id);
		if (exists) {
			toast.warning(`"${product.name}" ya está en la factura`);
			searchQuery = '';
			searchResults = [];
			searchOpen = false;
			return;
		}

		items = [
			...items,
			{
				productId: product._id,
				productName: product.name,
				quantity: 1,
				unitPrice: product.salePrice,
				purchasePrice: product.purchasePrice
			}
		];
		searchQuery = '';
		searchResults = [];
		searchOpen = false;
		if (searchInputEl) searchInputEl.focus();
	}

	function removeItem(index: number) {
		items = items.filter((_, i) => i !== index);
	}

	function updateQuantity(index: number, qty: number) {
		if (qty < 1) qty = 1;
		items = items.map((item, i) =>
			i === index ? { ...item, quantity: qty } : item
		);
	}

	// --- Confirmación antes de enviar ---
	let confirming = $state(false);
	let submitting = $state(false);

	function handleSubmit(e: SubmitEvent) {
		if (items.length === 0) {
			e.preventDefault();
			toast.error('Agrega al menos un producto');
			return;
		}
		submitting = true;
	}

	function handleCancel() {
		if (items.length > 0) {
			confirming = true;
		} else {
			goto('/invoices');
		}
	}

	function confirmCancel() {
		confirming = false;
		goto('/invoices');
	}
</script>

<svelte:head>
	<title>Nueva Factura - Dalvin</title>
</svelte:head>

<div class="max-w-4xl mx-auto space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-heading font-semibold text-[var(--color-text)]">Nueva Factura</h1>
			<p class="text-sm text-[var(--color-text-muted)] mt-1">Cajero: {user.name}</p>
		</div>
	</div>

	<!-- Confirmación de cancelación -->
	{#if confirming}
		<div class="bg-[var(--color-surface-card)] rounded-xl border border-[var(--color-border)] p-6">
			<div class="text-center">
				<div class="text-4xl mb-4">❓</div>
				<h2 class="text-lg font-semibold text-[var(--color-text)] mb-2">¿Cancelar factura?</h2>
				<p class="text-sm text-[var(--color-text-muted)] mb-6">
					Se perderán los {items.length} producto{items.length !== 1 ? 's' : ''} agregado{items.length !== 1 ? 's' : ''}.
				</p>
				<div class="flex items-center justify-center gap-3">
					<button
						onclick={() => confirming = false}
						class="px-4 py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)]
						       text-sm font-medium hover:bg-[var(--color-surface-alt)] transition-colors"
					>
						Seguir editando
					</button>
					<button
						onclick={confirmCancel}
						class="px-4 py-2 rounded-lg bg-[var(--color-error)] text-white text-sm font-medium
						       hover:opacity-90 transition-colors"
					>
						Sí, cancelar
					</button>
				</div>
			</div>
		</div>
	{/if}

	<!-- Formulario -->
	<form
		method="POST"
		action="/invoices/new"
		onsubmit={handleSubmit}
		use:enhance={({ formData }) => {
			formData.set('items', JSON.stringify(items));

			return async ({ result, update }) => {
				submitting = false;

				if (result.type === 'error') {
					toast.error('Error del servidor');
					return;
				}

				if (result.type === 'redirect') {
					toast.success('Factura creada exitosamente');
					return;
				}

				// result.type === 'success' — el form action devolvió datos
				const resultData = result.data as Record<string, unknown> | undefined;
				if (resultData?.error) {
					toast.error(resultData.error as string);
				} else {
					toast.success('Factura creada exitosamente');
				}
			};
		}}
		class="space-y-6"
	>
		<!-- Búsqueda de productos -->
		<div class="bg-[var(--color-surface-card)] rounded-xl border border-[var(--color-border)] p-4">
			<h2 class="text-sm font-semibold text-[var(--color-text)] mb-3">Agregar Producto</h2>
			<div class="relative">
				<div class="relative">
					<input
						bind:this={searchInputEl}
						type="text"
						placeholder="Buscar producto por nombre o SKU..."
						value={searchQuery}
						oninput={onSearchInput}
						onfocus={() => { if (searchResults.length > 0) searchOpen = true; }}
						onblur={() => setTimeout(() => { searchOpen = false; }, 200)}
						class="w-full px-4 py-2.5 pl-10 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]
						       text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]
						       focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30
						       focus:border-[var(--color-primary)] transition-colors"
					/>
					<div class="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
					</div>
					{#if searching}
						<div class="absolute right-3 top-1/2 -translate-y-1/2">
							<div class="w-4 h-4 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
						</div>
					{/if}
				</div>

				<!-- Dropdown de resultados -->
				{#if searchOpen && searchResults.length > 0}
					<div class="absolute z-10 mt-1 w-full bg-[var(--color-surface-card)] border border-[var(--color-border)]
					            rounded-lg shadow-lg overflow-hidden max-h-64 overflow-y-auto">
						{#each searchResults as product}
							<button
								type="button"
								onclick={() => selectProduct(product)}
								class="w-full flex items-center justify-between px-4 py-3 text-sm
								       hover:bg-[var(--color-surface-alt)] transition-colors text-left border-b
								       border-[var(--color-border-light)] last:border-b-0"
							>
								<div class="flex-1 min-w-0">
									<p class="font-medium text-[var(--color-text)] truncate">{product.name}</p>
									<p class="text-xs text-[var(--color-text-muted)]">
										SKU: {product.sku} · Stock: {product.stock}
									</p>
								</div>
								<div class="text-right ml-4">
									<p class="font-mono font-medium text-[var(--color-text)]">{formatCurrency(product.salePrice)}</p>
									<p class="text-xs text-[var(--color-text-muted)]">c/u</p>
								</div>
							</button>
						{/each}
					</div>
				{/if}

				{#if searchQuery && searchResults.length === 0 && !searching}
					<div class="absolute z-10 mt-1 w-full bg-[var(--color-surface-card)] border border-[var(--color-border)]
					            rounded-lg shadow-lg p-4 text-center text-sm text-[var(--color-text-muted)]">
						No se encontraron productos disponibles
					</div>
				{/if}
			</div>
		</div>

		<!-- Items agregados -->
		<div class="bg-[var(--color-surface-card)] rounded-xl border border-[var(--color-border)] overflow-hidden">
			{#if items.length === 0}
				<div class="text-center py-12">
					<div class="text-4xl mb-4">🛒</div>
					<h3 class="text-sm font-medium text-[var(--color-text-secondary)] mb-1">Carrito vacío</h3>
					<p class="text-xs text-[var(--color-text-muted)]">Busca y agrega productos arriba</p>
				</div>
			{:else}
				<div class="overflow-x-auto">
					<table class="w-full text-sm">
						<thead>
							<tr class="border-b border-[var(--color-border)] bg-[var(--color-surface-alt)]">
								<th class="text-left px-4 py-3 font-medium text-[var(--color-text-secondary)]">Producto</th>
								<th class="text-center px-4 py-3 font-medium text-[var(--color-text-secondary)]">Cant.</th>
								<th class="text-right px-4 py-3 font-medium text-[var(--color-text-secondary)]">Precio</th>
								<th class="text-right px-4 py-3 font-medium text-[var(--color-text-secondary)]">Subtotal</th>
								<th class="text-right px-4 py-3 font-medium text-[var(--color-text-secondary)]">Ganancia</th>
								<th class="text-center px-4 py-3 w-12"></th>
							</tr>
						</thead>
						<tbody>
							{#each items as item, i}
								<tr class="border-b border-[var(--color-border-light)] last:border-b-0">
									<td class="px-4 py-3">
										<p class="font-medium text-[var(--color-text)]">{item.productName}</p>
									</td>
									<td class="px-4 py-3 text-center">
										<input
											type="number"
											min="1"
											value={item.quantity}
											oninput={(e) => updateQuantity(i, parseInt((e.target as HTMLInputElement).value) || 1)}
											class="w-16 text-center px-2 py-1 rounded-lg border border-[var(--color-border)]
											       bg-[var(--color-surface)] text-sm text-[var(--color-text)]
											       focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30
											       focus:border-[var(--color-primary)] transition-colors"
										/>
									</td>
									<td class="px-4 py-3 text-right font-mono text-[var(--color-text)]">
										{formatCurrency(item.unitPrice)}
									</td>
									<td class="px-4 py-3 text-right font-mono font-medium text-[var(--color-text)]">
										{formatCurrency(item.unitPrice * item.quantity)}
									</td>
									<td class="px-4 py-3 text-right font-mono text-[var(--color-success)]">
										{formatCurrency((item.unitPrice - item.purchasePrice) * item.quantity)}
									</td>
									<td class="px-4 py-3 text-center">
										<button
											type="button"
											onclick={() => removeItem(i)}
											class="p-1 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-error)]
											       hover:bg-[var(--color-error)]/10 transition-colors"
											aria-label="Eliminar {item.productName}"
										>
											<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
										</button>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>

				<!-- Totales -->
				<div class="border-t border-[var(--color-border)] px-4 py-4 space-y-2">
					<div class="flex justify-end items-center gap-4">
						<span class="text-sm text-[var(--color-text-secondary)]">Ganancia total:</span>
						<span class="font-mono font-medium text-[var(--color-success)] text-lg">
							{formatCurrency(totalProfit)}
						</span>
					</div>
					<div class="flex justify-end items-center gap-4">
						<span class="text-sm font-medium text-[var(--color-text-secondary)]">Total:</span>
						<span class="font-mono font-bold text-[var(--color-text)] text-2xl">
							{formatCurrency(total)}
						</span>
					</div>
				</div>
			{/if}
		</div>

		<!-- Método de pago y acciones -->
		<div class="bg-[var(--color-surface-card)] rounded-xl border border-[var(--color-border)] p-4">
			<div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
				<!-- Método de pago -->
				<div class="flex items-center gap-3">
					<span class="text-sm font-medium text-[var(--color-text-secondary)]">Método de pago:</span>
					<div class="flex gap-2">
						<label class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--color-border)]
						            text-sm cursor-pointer transition-colors
						            {paymentMethod === 'cash'
						              ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
						              : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-alt)]'}">
							<input type="radio" name="paymentMethod" value="cash" bind:group={paymentMethod} class="sr-only" />
							Efectivo
						</label>
						<label class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--color-border)]
						            text-sm cursor-pointer transition-colors
						            {paymentMethod === 'card'
						              ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
						              : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-alt)]'}">
							<input type="radio" name="paymentMethod" value="card" bind:group={paymentMethod} class="sr-only" />
							Tarjeta
						</label>
						<label class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--color-border)]
						            text-sm cursor-pointer transition-colors
						            {paymentMethod === 'transfer'
						              ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
						              : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-alt)]'}">
							<input type="radio" name="paymentMethod" value="transfer" bind:group={paymentMethod} class="sr-only" />
							Transferencia
						</label>
					</div>
				</div>

				<!-- Botones -->
				<div class="flex items-center gap-3 w-full sm:w-auto">
					<button
						type="button"
						onclick={handleCancel}
						class="flex-1 sm:flex-none px-6 py-2.5 rounded-lg border border-[var(--color-border)]
						       text-[var(--color-text-secondary)] text-sm font-medium
						       hover:bg-[var(--color-surface-alt)] transition-colors"
					>
						Cancelar
					</button>
					<button
						type="submit"
						disabled={items.length === 0 || submitting}
						class="flex-1 sm:flex-none px-6 py-2.5 rounded-lg bg-[var(--color-primary)] text-white text-sm font-medium
						       hover:bg-[var(--color-primary-dark)] disabled:opacity-50 disabled:cursor-not-allowed
						       transition-colors inline-flex items-center justify-center gap-2"
					>
						{#if submitting}
							<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
							Facturando...
						{:else}
							Facturar
						{/if}
					</button>
				</div>
			</div>
		</div>
	</form>
</div>
