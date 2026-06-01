<script lang="ts">
	import type { PageData } from './$types';
	import { formatCurrency, formatDate } from '$lib/utils/format';
	import { goto } from '$app/navigation';

	let { data } = $props<{ data: PageData }>();

	let invoice = $derived(data.invoice);
	let user = $derived(data.user);

	function paymentMethodLabel(method: string): string {
		const labels: Record<string, string> = {
			cash: 'Efectivo',
			card: 'Tarjeta',
			transfer: 'Transferencia'
		};
		return labels[method] || method;
	}

	function handlePrint() {
		window.print();
	}
</script>

<svelte:head>
	<title>Factura #{invoice.invoiceNumber} - Dalvin</title>
</svelte:head>

<div class="max-w-2xl mx-auto space-y-6">
	<!-- Botón volver (no-print) -->
	<div class="no-print">
		<button
			onclick={() => goto('/invoices')}
			class="inline-flex items-center gap-2 text-sm text-[var(--color-text-secondary)]
			       hover:text-[var(--color-text)] transition-colors"
		>
			<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
			Volver a facturas
		</button>
	</div>

	<!-- Ticket/Factura -->
	<div class="bg-[var(--color-surface-card)] rounded-xl border border-[var(--color-border)] overflow-hidden">
		<!-- Header del ticket -->
		<div class="text-center px-6 py-6 border-b border-[var(--color-border)]">
			<div class="w-12 h-12 rounded-xl bg-[var(--color-primary)] flex items-center justify-center text-white font-bold text-lg mx-auto mb-3">D</div>
			<h1 class="text-xl font-heading font-semibold text-[var(--color-text)]">Dalvin</h1>
			<p class="text-sm text-[var(--color-text-muted)] mt-1">Sistema de Gestión</p>

			<div class="mt-4 space-y-1">
				<p class="text-lg font-mono font-bold text-[var(--color-text)]">
					Factura #{invoice.invoiceNumber}
				</p>
				<p class="text-sm text-[var(--color-text-secondary)]">
					{formatDate(invoice.createdAt)}
				</p>
				<p class="text-sm text-[var(--color-text-muted)]">
					Cajero: {invoice.cashierName}
				</p>
			</div>
		</div>

		<!-- Items -->
		<div class="px-6 py-4">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b border-[var(--color-border-light)]">
						<th class="text-left pb-2 font-medium text-[var(--color-text-secondary)]">Producto</th>
						<th class="text-center pb-2 font-medium text-[var(--color-text-secondary)]">Cant.</th>
						<th class="text-right pb-2 font-medium text-[var(--color-text-secondary)]">Precio</th>
						<th class="text-right pb-2 font-medium text-[var(--color-text-secondary)]">Subtotal</th>
					</tr>
				</thead>
				<tbody>
					{#each invoice.items as item}
						<tr class="border-b border-[var(--color-border-light)] last:border-b-0">
							<td class="py-3 pr-4">
								<p class="font-medium text-[var(--color-text)]">{item.productName}</p>
								<p class="text-xs text-[var(--color-text-muted)]">P. compra: {formatCurrency(item.purchasePrice)}</p>
							</td>
							<td class="py-3 text-center text-[var(--color-text)] font-mono">
								{item.quantity}
							</td>
							<td class="py-3 text-right text-[var(--color-text)] font-mono">
								{formatCurrency(item.unitPrice)}
							</td>
							<td class="py-3 text-right font-mono font-medium text-[var(--color-text)]">
								{formatCurrency(item.subtotal)}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<!-- Totales -->
		<div class="px-6 py-4 border-t border-[var(--color-border)] space-y-2">
			<div class="flex justify-between items-center text-sm">
				<span class="text-[var(--color-text-secondary)]">Ganancia total</span>
				<span class="font-mono font-medium text-[var(--color-success)]">
					{formatCurrency(invoice.totalProfit)}
				</span>
			</div>
			{#each invoice.items as item}
				<div class="flex justify-between items-center text-xs text-[var(--color-text-muted)] pl-4">
					<span>{item.productName}</span>
					<span class="font-mono">{formatCurrency(item.profit)}</span>
				</div>
			{/each}
			<div class="flex justify-between items-center pt-2 border-t border-[var(--color-border)]">
				<span class="font-semibold text-[var(--color-text)]">Total</span>
				<span class="font-mono font-bold text-[var(--color-text)] text-xl">
					{formatCurrency(invoice.total)}
				</span>
			</div>
		</div>

		<!-- Método de pago -->
		<div class="px-6 py-4 border-t border-[var(--color-border)] flex items-center justify-between">
			<span class="text-sm text-[var(--color-text-secondary)]">Método de pago</span>
			<span class="text-sm font-medium text-[var(--color-text)]">
				{paymentMethodLabel(invoice.paymentMethod)}
			</span>
		</div>

		<!-- Footer -->
		<div class="px-6 py-4 border-t border-[var(--color-border)] text-center text-xs text-[var(--color-text-muted)]">
			<p>Gracias por su preferencia</p>
			<p class="mt-1">Factura generada electrónicamente</p>
		</div>
	</div>

	<!-- Acciones (no-print) -->
	<div class="no-print flex items-center gap-3">
		<button
			onclick={handlePrint}
			class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white
			       text-sm font-medium hover:bg-[var(--color-primary-dark)] transition-colors"
		>
			<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
			Imprimir Ticket
		</button>
		<a
			href="/invoices"
			class="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--color-border)]
			       text-[var(--color-text-secondary)] text-sm font-medium hover:bg-[var(--color-surface-alt)] transition-colors"
		>
			Volver a facturas
		</a>
	</div>
</div>

<style>
	@media print {
		/* Ocultar header y sidebar globales al imprimir */
		:global(.no-print) {
			display: none !important;
		}

		/* Fondo blanco para impresión */
		:global(body) {
			background: white !important;
			color: black !important;
		}

		/* El contenedor principal sin márgenes extra */
		:global(main) {
			padding: 0 !important;
		}

		/* La tarjeta sin borde ni sombra */
		:global(.rounded-xl) {
			border: none !important;
			box-shadow: none !important;
		}
	}
</style>
