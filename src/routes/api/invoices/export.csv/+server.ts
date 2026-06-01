import { requireRole } from '$lib/server/auth';
import { getDb } from '$lib/server/db';
import type { RequestHandler } from './$types';

function escapeCSV(value: string | number | boolean | undefined | null): string {
	if (value === undefined || value === null) return '';
	const str = String(value);
	if (str.includes(',') || str.includes('"') || str.includes('\n')) {
		return `"${str.replace(/"/g, '""')}"`;
	}
	return str;
}

export const GET: RequestHandler = async ({ locals, url }) => {
	requireRole(locals, ['admin']);
	const db = await getDb();

	const fromParam = url.searchParams.get('from');
	const toParam = url.searchParams.get('to');

	// Por defecto: últimos 30 días
	const fromDate = fromParam ? new Date(fromParam) : new Date(new Date().setDate(new Date().getDate() - 30));
	const toDate = toParam ? new Date(toParam + 'T23:59:59.999Z') : new Date();

	const matchStage = {
		createdAt: { $gte: fromDate, $lte: toDate }
	};

	const invoices = await db.collection('invoices')
		.find(matchStage)
		.sort({ createdAt: -1 })
		.project({
			invoiceNumber: 1,
			createdAt: 1,
			cashierName: 1,
			items: {
				$map: {
					input: '$items',
					as: 'item',
					in: {
						$concat: [
							'$$item.productName',
							' x',
							{ $toString: '$$item.quantity' }
						]
					}
				}
			},
			total: 1,
			totalProfit: 1,
			paymentMethod: 1
		})
		.toArray();

	const headers = ['NroFactura', 'Fecha', 'Cajero', 'Items', 'Total', 'Ganancia', 'MetodoPago'];

	const rows = invoices.map((inv) => [
		inv.invoiceNumber,
		inv.createdAt ? new Date(inv.createdAt).toISOString() : '',
		inv.cashierName,
		(inv.items as string[]).join(' / '),
		inv.total,
		inv.totalProfit,
		inv.paymentMethod === 'card' ? 'Tarjeta' : inv.paymentMethod === 'transfer' ? 'Transferencia' : 'Efectivo'
	]);

	const csvContent = [
		headers.join(','),
		...rows.map((row) => row.map((v) => escapeCSV(v)).join(','))
	].join('\n');

	const bom = '\uFEFF';

	return new Response(bom + csvContent, {
		headers: {
			'Content-Type': 'text/csv; charset=utf-8',
			'Content-Disposition': `attachment; filename="facturas_${new Date().toISOString().split('T')[0]}.csv"`
		}
	});
};
