<script lang="ts">
	import type { PageData } from './$types';
	import { formatCurrency, formatDate } from '$lib/utils/format';
	import InvoiceFilters from '$lib/components/invoices/InvoiceFilters.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	let { data } = $props<{ data: PageData }>();

	let invoices = $derived(data.invoices);
	let user = $derived(data.user);
	let cashiers = $derived(data.cashiers || []);
	let filters = $derived(data.filters || { from: '', to: '', cashierId: '' });

	let loading = $state(false);
	let error = $state('');

	function handleFilter(f: { from: string; to: string; cashierId: string }) {
		loading = true;
		error = '';

		const params = new URLSearchParams();
		if (f.from) params.set('from', f.from);
		if (f.to) params.set('to', f.to);
		if (f.cashierId) params.set('cashierId', f.cashierId);
		params.set('page', '1');

		const qs = params.toString();
		goto(qs ? `/invoices?${qs}` : '/invoices', { replaceState: true })
			.then(() => { loading = false; })
			.catch(() => { loading = false; error = 'Error al aplicar filtros'; });
	}

	function goToPage(p: number) {
		loading = true;
		const params = new URLSearchParams($page.url.searchParams);
		params.set('page', String(p));
		goto(`/invoices?${params.toString()}`, { replaceState: true })
			.then(() => { loading = false; })
			.catch(() => { loading = false; error = 'Error al cambiar de página'; });
	}

	function paymentMethodLabel(method: string): string {
		const labels: Record<string, string> = {
			cash: 'Efectivo',
			card: 'Tarjeta',
			transfer: 'Transferencia'
		};
		return labels[method] || method;
	}

	function paymentMethodColor(method: string): string {
		const colors: Record<string, string> = {
			cash: 'text-[var(--color-success)]',
			card: 'text-[var(--color-primary)]',
			transfer: 'text-[var(--color-warning)]'
		};
		return colors[method] || '';
	}

	// Helper para navegación con teclado
	function handleRowKeydown(e: KeyboardEvent, id: string) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			goto(`/invoices/${id}`);
		}
	}

	// Generar números de página para la paginación
	function getPageNumbers(current: number, total: number): (number | string)[] {
		if (total <= 7) {
			return Array.from({ length: total }, (_, i) => i + 1);
		}

		const pages: (number | string)[] = [];

		if (current <= 4) {
			for (let i = 1; i <= 5; i++) pages.push(i);
			pages.push('...');
			pages.push(total);
		} else if (current >= total - 3) {
			pages.push(1);
			pages.push('...');
			for (let i = total - 4; i <= total; i++) pages.push(i);
		} else {
			pages.push(1);
			pages.push('...');
			for (let i = current - 1; i <= current + 1; i++) pages.push(i);
			pages.push('...');
			pages.push(total);
		}

		return pages;
	}

	let pageNumbers = $derived(getPageNumbers(invoices.page, invoices.totalPages));
</script>

<svelte:head>
	<title>Facturas - Dalvin</title>
</svelte:head>

<div class="max-w-7xl mx-auto space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-heading font-semibold text-[var(--color-text)]">
				{user.role === 'admin' ? 'Facturas' : 'Mis Facturas'}
			</h1>
			<p class="text-sm text-[var(--color-text-muted)] mt-1">
				{invoices.total} factura{invoices.total !== 1 ? 's' : ''} encontrada{invoices.total !== 1 ? 's' : ''}
			</p>
		</div>
		<a
			href="/invoices/new"
			class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white
			       text-sm font-medium hover:bg-[var(--color-primary-dark)] transition-colors"
		>
			<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
			Nueva Factura
		</a>
	</div>

	<!-- Filtros -->
	<div class="bg-[var(--color-surface-card)] rounded-xl border border-[var(--color-border)] p-4">
		<InvoiceFilters {user} {cashiers} {filters} onFilter={handleFilter} />
	</div>

	<!-- Estado: Loading -->
	{#if loading}
		<div class="space-y-3">
			{#each { length: 5 } as _}
				<div class="skeleton h-16 rounded-xl"></div>
			{/each}
		</div>

	<!-- Estado: Error -->
	{:else if error}
		<div class="text-center py-12">
			<div class="text-4xl mb-4">⚠️</div>
			<h2 class="text-lg font-semibold text-[var(--color-text)] mb-2">Error al cargar facturas</h2>
			<p class="text-sm text-[var(--color-text-muted)] mb-4">{error}</p>
			<button
				onclick={() => window.location.reload()}
				class="px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white text-sm font-medium
				       hover:bg-[var(--color-primary-dark)] transition-colors"
			>
				Reintentar
			</button>
		</div>

	<!-- Estado: Empty -->
	{:else if invoices.items.length === 0}
		<div class="text-center py-16">
			<div class="text-5xl mb-4">🧾</div>
			<h2 class="text-lg font-semibold text-[var(--color-text)] mb-2">
				No hay facturas aún
			</h2>
			<p class="text-sm text-[var(--color-text-muted)] mb-6">
				{user.role === 'cajero'
					? 'No has realizado ninguna venta. Crea tu primera factura.'
					: 'No se encontraron facturas con los filtros seleccionados.'}
			</p>
			<a
				href="/invoices/new"
				class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white
				       text-sm font-medium hover:bg-[var(--color-primary-dark)] transition-colors"
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
				Nueva Factura
			</a>
		</div>

	<!-- Tabla -->
	{:else}
		<div class="bg-[var(--color-surface-card)] rounded-xl border border-[var(--color-border)] overflow-hidden">
			<div class="overflow-x-auto">
				<table class="w-full text-sm">
					<thead>
						<tr class="border-b border-[var(--color-border)] bg-[var(--color-surface-alt)]">
							<th class="text-left px-4 py-3 font-medium text-[var(--color-text-secondary)]">N° Factura</th>
							<th class="text-left px-4 py-3 font-medium text-[var(--color-text-secondary)]">Fecha</th>
							<th class="text-left px-4 py-3 font-medium text-[var(--color-text-secondary)]">Cajero</th>
							<th class="text-right px-4 py-3 font-medium text-[var(--color-text-secondary)]">Total</th>
							<th class="text-right px-4 py-3 font-medium text-[var(--color-text-secondary)]">Ganancia</th>
							<th class="text-center px-4 py-3 font-medium text-[var(--color-text-secondary)]">Método Pago</th>
						</tr>
					</thead>
					<tbody>
						{#each invoices.items as inv (inv._id.toString())}
							<tr
								class="border-b border-[var(--color-border-light)] hover:bg-[var(--color-surface-alt)]/50
								       transition-colors cursor-pointer"
								role="button"
								tabindex="0"
								aria-label="Ver factura #{inv.invoiceNumber}"
								onclick={() => goto(`/invoices/${inv._id}`)}
								onkeydown={(e) => handleRowKeydown(e, inv._id.toString())}
							>
								<td class="px-4 py-3 font-medium text-[var(--color-text)]">
									#{inv.invoiceNumber}
								</td>
								<td class="px-4 py-3 text-[var(--color-text-secondary)] whitespace-nowrap">
									{formatDate(inv.createdAt)}
								</td>
								<td class="px-4 py-3 text-[var(--color-text)]">
									{inv.cashierName}
								</td>
								<td class="px-4 py-3 text-right font-mono font-medium text-[var(--color-text)]">
									{formatCurrency(inv.total)}
								</td>
								<td class="px-4 py-3 text-right font-mono text-[var(--color-success)]">
									{formatCurrency(inv.totalProfit)}
								</td>
								<td class="px-4 py-3 text-center">
									<span class="inline-flex items-center gap-1 text-xs font-medium {paymentMethodColor(inv.paymentMethod)}">
										{paymentMethodLabel(inv.paymentMethod)}
									</span>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>

			<!-- Paginación -->
			{#if invoices.totalPages > 1}
				<div class="flex items-center justify-between px-4 py-3 border-t border-[var(--color-border)]">
					<p class="text-sm text-[var(--color-text-muted)]">
						Página {invoices.page} de {invoices.totalPages}
					</p>
					<div class="flex items-center gap-2">
						<button
							onclick={() => goToPage(invoices.page - 1)}
							disabled={invoices.page <= 1}
							class="px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-sm font-medium
							       text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-alt)]
							       disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
						>
							Anterior
						</button>

						{#each pageNumbers as p}
							{#if p === '...'}
								<span class="text-[var(--color-text-muted)] px-1">...</span>
							{:else}
								<button
									onclick={() => goToPage(p as number)}
									class="w-8 h-8 rounded-lg text-sm font-medium transition-colors
									       {p === invoices.page
									         ? 'bg-[var(--color-primary)] text-white'
									         : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-alt)]'}"
								>
									{p}
								</button>
							{/if}
						{/each}

						<button
							onclick={() => goToPage(invoices.page + 1)}
							disabled={invoices.page >= invoices.totalPages}
							class="px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-sm font-medium
							       text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-alt)]
							       disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
						>
							Siguiente
						</button>
					</div>
				</div>
			{/if}
		</div>
	{/if}
</div>
