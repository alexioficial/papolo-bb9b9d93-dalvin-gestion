<script lang="ts">
	import { formatCurrency, formatDate } from '$lib/utils/format';
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';

	let { data } = $props();
	let d = $derived(data!);

	let fromDate = $state(d.filters.from);
	let toDate = $state(d.filters.to);
	let cashierId = $state(d.filters.cashierId);
	let exporting = $state(false);

	function applyFilters() {
		const params = new URLSearchParams();
		if (fromDate) params.set('from', fromDate);
		if (toDate) params.set('to', toDate);
		if (cashierId) params.set('cashierId', cashierId);
		const qs = params.toString();
		const url = qs ? `/reports?${qs}` : '/reports';
		window.location.href = url;
	}

	function resetFilters() {
		fromDate = '';
		toDate = '';
		cashierId = '';
		window.location.href = '/reports';
	}

	function formatParamDate(dateStr: string): string {
		if (!dateStr) return '—';
		const d = new Date(dateStr);
		return d.toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' });
	}

	async function exportCSV() {
		exporting = true;
		try {
			const params = new URLSearchParams();
			if (fromDate) params.set('from', fromDate);
			if (toDate) params.set('to', toDate);
			const url = `/api/invoices/export.csv?${params.toString()}`;
			const resp = await fetch(url);
			if (!resp.ok) throw new Error('Error al exportar');
			const blob = await resp.blob();
			const a = document.createElement('a');
			a.href = URL.createObjectURL(blob);
			a.download = `facturas_${fromDate || 'inicio'}_a_${toDate || 'hoy'}.csv`;
			a.click();
			URL.revokeObjectURL(a.href);
		} catch (e) {
			alert('Error al exportar: ' + (e instanceof Error ? e.message : 'error'));
		} finally {
			exporting = false;
		}
	}
</script>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-heading font-semibold text-[var(--color-text)]">Reportes</h1>
			<p class="text-sm text-[var(--color-text-secondary)] mt-1">Análisis detallado de ventas</p>
		</div>
		{#if d.summary}
			<button
				onclick={exportCSV}
				disabled={exporting}
				class="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white text-sm font-medium rounded-lg hover:bg-[var(--color-primary-dark)] disabled:opacity-50 transition-all"
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
				{exporting ? 'Exportando...' : 'Exportar CSV'}
			</button>
		{/if}
	</div>

	<!-- Filtros -->
	<div class="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-xl p-5">
		<div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
			<div>
				<label for="from" class="block text-sm font-medium text-[var(--color-text)] mb-1.5">Desde</label>
				<input
					id="from"
					type="date"
					bind:value={fromDate}
					class="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface-card)] text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-primary-light)] focus:border-transparent outline-none transition-all text-sm"
				/>
			</div>
			<div>
				<label for="to" class="block text-sm font-medium text-[var(--color-text)] mb-1.5">Hasta</label>
				<input
					id="to"
					type="date"
					bind:value={toDate}
					class="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface-card)] text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-primary-light)] focus:border-transparent outline-none transition-all text-sm"
				/>
			</div>
			<div>
				<label for="cashier" class="block text-sm font-medium text-[var(--color-text)] mb-1.5">Cajero</label>
				<select
					id="cashier"
					bind:value={cashierId}
					class="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface-card)] text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-primary-light)] focus:border-transparent outline-none transition-all text-sm"
				>
					<option value="">Todos</option>
					{#each d.cashiers as c}
						<option value={c.id}>{c.name}</option>
					{/each}
				</select>
			</div>
			<div class="flex items-end gap-2">
				<button
					onclick={applyFilters}
					class="flex-1 px-4 py-2 bg-[var(--color-primary)] text-white text-sm font-medium rounded-lg hover:bg-[var(--color-primary-dark)] transition-all"
				>
					Filtrar
				</button>
				<button
					onclick={resetFilters}
					class="px-4 py-2 border border-[var(--color-border)] text-[var(--color-text-secondary)] text-sm font-medium rounded-lg hover:bg-[var(--color-surface-alt)] transition-all"
				>
					Limpiar
				</button>
			</div>
		</div>
	</div>

	{#if d.error}
		<!-- Error state -->
		<div class="bg-[var(--color-surface-card)] border border-red-200 dark:border-red-800 rounded-xl p-8 text-center">
			<p class="text-[var(--color-error)] font-medium">{d.error}</p>
		</div>
	{:else if d.summary}
		<!-- Summary Cards -->
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
			<div class="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-xl p-5">
				<p class="text-sm text-[var(--color-text-secondary)]">Total Ventas</p>
				<p class="text-2xl font-heading font-semibold text-[var(--color-text)] mt-1">{formatCurrency(d.summary.totalSales)}</p>
			</div>
			<div class="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-xl p-5">
				<p class="text-sm text-[var(--color-text-secondary)]">Ganancia Total</p>
				<p class="text-2xl font-heading font-semibold text-green-600 dark:text-green-400 mt-1">{formatCurrency(d.summary.totalProfit)}</p>
			</div>
			<div class="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-xl p-5">
				<p class="text-sm text-[var(--color-text-secondary)]">Facturas</p>
				<p class="text-2xl font-heading font-semibold text-[var(--color-text)] mt-1">{d.summary.count}</p>
			</div>
			<div class="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-xl p-5">
				<p class="text-sm text-[var(--color-text-secondary)]">Ticket Promedio</p>
				<p class="text-2xl font-heading font-semibold text-[var(--color-text)] mt-1">{formatCurrency(d.summary.avgTicket)}</p>
			</div>
		</div>

		<!-- Ventas por día -->
		{#if d.salesByDay && d.salesByDay.length > 0}
			<div class="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-xl overflow-hidden">
				<div class="px-5 py-4 border-b border-[var(--color-border)]">
					<h2 class="font-heading font-semibold text-[var(--color-text)]">Ventas por Día</h2>
				</div>
				<div class="overflow-x-auto">
					<table class="w-full text-sm">
						<thead>
							<tr class="text-left text-[var(--color-text-muted)] text-xs uppercase tracking-wider">
								<th class="px-5 py-3 font-medium">Fecha</th>
								<th class="px-5 py-3 font-medium text-right">Facturas</th>
								<th class="px-5 py-3 font-medium text-right">Ventas</th>
								<th class="px-5 py-3 font-medium text-right">Ganancia</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-[var(--color-border-light)]">
							{#each d.salesByDay as day}
								<tr class="hover:bg-[var(--color-surface-alt)] transition-colors">
									<td class="px-5 py-3 text-[var(--color-text)]">{formatParamDate(day.date)}</td>
									<td class="px-5 py-3 text-right text-[var(--color-text)]">{day.count}</td>
									<td class="px-5 py-3 text-right text-[var(--color-text)] font-medium">{formatCurrency(day.total)}</td>
									<td class="px-5 py-3 text-right text-green-600 dark:text-green-400">{formatCurrency(day.profit)}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		{/if}

		<!-- Ventas por cajero -->
		{#if d.salesByCashier && d.salesByCashier.length > 0}
			<div class="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-xl overflow-hidden">
				<div class="px-5 py-4 border-b border-[var(--color-border)]">
					<h2 class="font-heading font-semibold text-[var(--color-text)]">Ventas por Cajero</h2>
				</div>
				<div class="overflow-x-auto">
					<table class="w-full text-sm">
						<thead>
							<tr class="text-left text-[var(--color-text-muted)] text-xs uppercase tracking-wider">
								<th class="px-5 py-3 font-medium">Cajero</th>
								<th class="px-5 py-3 font-medium text-right">Facturas</th>
								<th class="px-5 py-3 font-medium text-right">Ventas</th>
								<th class="px-5 py-3 font-medium text-right">Ganancia</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-[var(--color-border-light)]">
							{#each d.salesByCashier as c}
								<tr class="hover:bg-[var(--color-surface-alt)] transition-colors">
									<td class="px-5 py-3 text-[var(--color-text)] font-medium">{c.cashierName}</td>
									<td class="px-5 py-3 text-right text-[var(--color-text)]">{c.count}</td>
									<td class="px-5 py-3 text-right text-[var(--color-text)] font-medium">{formatCurrency(c.totalSales)}</td>
									<td class="px-5 py-3 text-right text-green-600 dark:text-green-400">{formatCurrency(c.totalProfit)}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		{/if}

		<!-- Top Productos -->
		{#if d.topProducts && d.topProducts.length > 0}
			<div class="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-xl overflow-hidden">
				<div class="px-5 py-4 border-b border-[var(--color-border)]">
					<h2 class="font-heading font-semibold text-[var(--color-text)]">Top 10 Productos Más Vendidos</h2>
				</div>
				<div class="overflow-x-auto">
					<table class="w-full text-sm">
						<thead>
							<tr class="text-left text-[var(--color-text-muted)] text-xs uppercase tracking-wider">
								<th class="px-5 py-3 font-medium">#</th>
								<th class="px-5 py-3 font-medium">Producto</th>
								<th class="px-5 py-3 font-medium text-right">Cantidad</th>
								<th class="px-5 py-3 font-medium text-right">Ventas</th>
								<th class="px-5 py-3 font-medium text-right">Ganancia</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-[var(--color-border-light)]">
							{#each d.topProducts as p, i}
								<tr class="hover:bg-[var(--color-surface-alt)] transition-colors">
									<td class="px-5 py-3 text-[var(--color-text-muted)]">{i + 1}</td>
									<td class="px-5 py-3 text-[var(--color-text)] font-medium">{p.productName}</td>
									<td class="px-5 py-3 text-right text-[var(--color-text)]">{p.totalQuantity}</td>
									<td class="px-5 py-3 text-right text-[var(--color-text)] font-medium">{formatCurrency(p.totalSales)}</td>
									<td class="px-5 py-3 text-right text-green-600 dark:text-green-400">{formatCurrency(p.totalProfit)}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		{/if}

		<!-- Facturas filtradas -->
		{#if d.invoices && d.invoices.length > 0}
			<div class="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-xl overflow-hidden">
				<div class="px-5 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
					<h2 class="font-heading font-semibold text-[var(--color-text)]">Facturas ({d.invoices.length})</h2>
				</div>
				<div class="overflow-x-auto">
					<table class="w-full text-sm">
						<thead>
							<tr class="text-left text-[var(--color-text-muted)] text-xs uppercase tracking-wider">
								<th class="px-5 py-3 font-medium">#</th>
								<th class="px-5 py-3 font-medium">Fecha</th>
								<th class="px-5 py-3 font-medium">Cajero</th>
								<th class="px-5 py-3 font-medium">Items</th>
								<th class="px-5 py-3 font-medium">Método</th>
								<th class="px-5 py-3 font-medium text-right">Total</th>
								<th class="px-5 py-3 font-medium text-right">Ganancia</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-[var(--color-border-light)]">
							{#each d.invoices as inv}
								<tr class="hover:bg-[var(--color-surface-alt)] transition-colors">
									<td class="px-5 py-3 text-[var(--color-text)] font-medium">#{inv.invoiceNumber}</td>
									<td class="px-5 py-3 text-[var(--color-text-secondary)]">{formatDate(inv.createdAt)}</td>
									<td class="px-5 py-3 text-[var(--color-text)]">{inv.cashierName}</td>
									<td class="px-5 py-3 text-[var(--color-text-secondary)]">
										{#if inv.items && inv.items.length > 0}
											<span title={(inv.items as Array<{productName: string; quantity: number}>).map((i: {productName: string; quantity: number}) => `${i.productName} x${i.quantity}`).join(', ')}>
												{inv.itemCount} ítems
											</span>
										{:else}
											{inv.itemCount} ítems
										{/if}
									</td>
									<td class="px-5 py-3">
										<span class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--color-surface-alt)] text-[var(--color-text-secondary)] capitalize">
											{inv.paymentMethod === 'card' ? 'Tarjeta' : inv.paymentMethod === 'transfer' ? 'Transferencia' : 'Efectivo'}
										</span>
									</td>
									<td class="px-5 py-3 text-right text-[var(--color-text)] font-medium">{formatCurrency(inv.total)}</td>
									<td class="px-5 py-3 text-right text-green-600 dark:text-green-400">{formatCurrency(inv.totalProfit)}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		{:else}
			<div class="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-xl p-8 text-center">
				<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mx-auto text-[var(--color-text-muted)] mb-3"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
				<p class="text-[var(--color-text-muted)]">No hay facturas en el período seleccionado</p>
			</div>
		{/if}
	{/if}
</div>
