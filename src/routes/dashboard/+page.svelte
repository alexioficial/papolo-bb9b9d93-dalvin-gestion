<script lang="ts">
	import { formatCurrency, formatDate, formatStock } from '$lib/utils/format';
	import { page } from '$app/stores';

	let { data } = $props();
	let d = $derived(data!);

	type AdminData = { role: 'admin'; stats: { totalProducts: number; totalInvoices: number; todaySales: number; todayProfit: number; todayInvoices: number; totalProfit: number }; lowStockProducts: Array<{ name: string; sku: string; stock: number; minStock: number; salePrice: number; categoryName: string }>; recentInvoices: Array<{ invoiceNumber: number; total: number; totalProfit: number; paymentMethod: string; cashierName: string; itemCount: number; createdAt: string }> };
	type CajeroData = { role: 'cajero'; stats: { todaySales: number; todayInvoices: number; todayProfit: number }; recentInvoices: Array<{ invoiceNumber: number; total: number; totalProfit: number; paymentMethod: string; itemCount: number; createdAt: string }> };
</script>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-heading font-semibold text-[var(--color-text)]">Dashboard</h1>
			<p class="text-sm text-[var(--color-text-secondary)] mt-1">Resumen del sistema</p>
		</div>
		<p class="text-sm text-[var(--color-text-muted)]">
			{new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
		</p>
	</div>

	{#if d.role === 'admin'}
		{@const admin = d as AdminData}
		<!-- Stats cards -->
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
			<div class="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-xl p-5">
				<div class="flex items-center gap-3">
					<div class="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
					</div>
					<div>
						<p class="text-sm text-[var(--color-text-secondary)]">Productos</p>
						<p class="text-2xl font-heading font-semibold text-[var(--color-text)]">{admin.stats.totalProducts}</p>
					</div>
				</div>
			</div>

			<div class="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-xl p-5">
				<div class="flex items-center gap-3">
					<div class="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
					</div>
					<div>
						<p class="text-sm text-[var(--color-text-secondary)]">Facturas Totales</p>
						<p class="text-2xl font-heading font-semibold text-[var(--color-text)]">{admin.stats.totalInvoices}</p>
					</div>
				</div>
			</div>

			<div class="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-xl p-5">
				<div class="flex items-center gap-3">
					<div class="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
					</div>
					<div>
						<p class="text-sm text-[var(--color-text-secondary)]">Ventas Hoy</p>
						<p class="text-2xl font-heading font-semibold text-[var(--color-text)]">{formatCurrency(admin.stats.todaySales)}</p>
					</div>
				</div>
			</div>

			<div class="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-xl p-5">
				<div class="flex items-center gap-3">
					<div class="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
					</div>
					<div>
						<p class="text-sm text-[var(--color-text-secondary)]">Ganancia Total</p>
						<p class="text-2xl font-heading font-semibold text-[var(--color-text)]">{formatCurrency(admin.stats.totalProfit)}</p>
					</div>
				</div>
			</div>
		</div>

		<!-- Ventas hoy + Facturas hoy -->
		<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
			<div class="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-xl p-5">
				<p class="text-sm text-[var(--color-text-secondary)]">Facturas Hoy</p>
				<p class="text-2xl font-heading font-semibold text-[var(--color-text)]">{admin.stats.todayInvoices}</p>
			</div>
			<div class="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-xl p-5">
				<p class="text-sm text-[var(--color-text-secondary)]">Ganancia Hoy</p>
				<p class="text-2xl font-heading font-semibold text-[var(--color-text)]">{formatCurrency(admin.stats.todayProfit)}</p>
			</div>
		</div>

		<!-- Low stock + Recent invoices -->
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<!-- Productos con stock bajo -->
			<div class="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-xl overflow-hidden">
				<div class="px-5 py-4 border-b border-[var(--color-border)]">
					<h2 class="font-heading font-semibold text-[var(--color-text)]">Productos con Stock Bajo</h2>
				</div>
				{#if admin.lowStockProducts.length > 0}
					<div class="overflow-x-auto">
						<table class="w-full text-sm">
							<thead>
								<tr class="text-left text-[var(--color-text-muted)] text-xs uppercase tracking-wider">
									<th class="px-5 py-3 font-medium">Producto</th>
									<th class="px-5 py-3 font-medium">SKU</th>
									<th class="px-5 py-3 font-medium">Categoría</th>
									<th class="px-5 py-3 font-medium text-right">Stock</th>
									<th class="px-5 py-3 font-medium text-right">Precio</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-[var(--color-border-light)]">
								{#each admin.lowStockProducts as p}
									<tr class="hover:bg-[var(--color-surface-alt)] transition-colors">
										<td class="px-5 py-3 text-[var(--color-text)] font-medium">{p.name}</td>
										<td class="px-5 py-3 text-[var(--color-text-secondary)]">{p.sku}</td>
										<td class="px-5 py-3 text-[var(--color-text-secondary)]">{p.categoryName || '—'}</td>
										<td class="px-5 py-3 text-right">
											<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
												{p.stock} / {p.minStock}
											</span>
										</td>
										<td class="px-5 py-3 text-right text-[var(--color-text)]">{formatCurrency(p.salePrice)}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{:else}
					<div class="p-8 text-center text-sm text-[var(--color-text-muted)]">
						<p>✅ Todos los productos tienen stock suficiente</p>
					</div>
				{/if}
			</div>

			<!-- Últimas facturas -->
			<div class="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-xl overflow-hidden">
				<div class="px-5 py-4 border-b border-[var(--color-border)]">
					<h2 class="font-heading font-semibold text-[var(--color-text)]">Últimas Facturas</h2>
				</div>
				{#if admin.recentInvoices.length > 0}
					<div class="divide-y divide-[var(--color-border-light)]">
						{#each admin.recentInvoices as inv}
							<div class="px-5 py-3 flex items-center justify-between hover:bg-[var(--color-surface-alt)] transition-colors">
								<div class="flex-1 min-w-0">
									<p class="text-sm font-medium text-[var(--color-text)]">#{inv.invoiceNumber}</p>
									<p class="text-xs text-[var(--color-text-secondary)]">
										{inv.cashierName} · {inv.itemCount} ítems · {formatDate(inv.createdAt)}
									</p>
								</div>
								<div class="text-right flex-shrink-0 ml-4">
									<p class="text-sm font-semibold text-[var(--color-text)]">{formatCurrency(inv.total)}</p>
									<p class="text-xs text-green-600 dark:text-green-400">+{formatCurrency(inv.totalProfit)}</p>
								</div>
							</div>
						{/each}
					</div>
				{:else}
					<div class="p-8 text-center text-sm text-[var(--color-text-muted)]">
						<p>No hay facturas registradas</p>
					</div>
				{/if}
			</div>
		</div>
	{:else}
		{@const cajero = d as CajeroData}
		<!-- Stats cards para cajero -->
		<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
			<div class="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-xl p-5">
				<div class="flex items-center gap-3">
					<div class="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
					</div>
					<div>
						<p class="text-sm text-[var(--color-text-secondary)]">Mis Ventas Hoy</p>
						<p class="text-2xl font-heading font-semibold text-[var(--color-text)]">{formatCurrency(cajero.stats.todaySales)}</p>
					</div>
				</div>
			</div>

			<div class="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-xl p-5">
				<div class="flex items-center gap-3">
					<div class="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
					</div>
					<div>
						<p class="text-sm text-[var(--color-text-secondary)]">Mis Facturas Hoy</p>
						<p class="text-2xl font-heading font-semibold text-[var(--color-text)]">{cajero.stats.todayInvoices}</p>
					</div>
				</div>
			</div>

			<div class="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-xl p-5">
				<div class="flex items-center gap-3">
					<div class="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
					</div>
					<div>
						<p class="text-sm text-[var(--color-text-secondary)]">Mi Ganancia Hoy</p>
						<p class="text-2xl font-heading font-semibold text-[var(--color-text)]">{formatCurrency(cajero.stats.todayProfit)}</p>
					</div>
				</div>
			</div>
		</div>

		<!-- Últimas facturas del cajero -->
		<div class="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-xl overflow-hidden">
			<div class="px-5 py-4 border-b border-[var(--color-border)]">
				<h2 class="font-heading font-semibold text-[var(--color-text)]">Mis Últimas Facturas</h2>
			</div>
			{#if cajero.recentInvoices.length > 0}
				<div class="divide-y divide-[var(--color-border-light)]">
					{#each cajero.recentInvoices as inv}
						<div class="px-5 py-3 flex items-center justify-between hover:bg-[var(--color-surface-alt)] transition-colors">
							<div class="flex-1 min-w-0">
								<p class="text-sm font-medium text-[var(--color-text)]">#{inv.invoiceNumber}</p>
								<p class="text-xs text-[var(--color-text-secondary)]">
									{inv.itemCount} ítems · {formatDate(inv.createdAt)}
								</p>
							</div>
							<div class="text-right flex-shrink-0 ml-4">
								<p class="text-sm font-semibold text-[var(--color-text)]">{formatCurrency(inv.total)}</p>
								<p class="text-xs text-green-600 dark:text-green-400">+{formatCurrency(inv.totalProfit)}</p>
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<div class="p-8 text-center text-sm text-[var(--color-text-muted)]">
					<p>No tienes facturas hoy. ¡Crea tu primera venta!</p>
				</div>
			{/if}
		</div>
	{/if}
</div>
