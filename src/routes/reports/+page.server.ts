import { requireRole } from '$lib/server/auth';
import { getDb } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const user = requireRole(locals, ['admin']);
	const db = await getDb();

	// Filtros desde query params
	const fromParam = url.searchParams.get('from');
	const toParam = url.searchParams.get('to');
	const cashierIdParam = url.searchParams.get('cashierId');

	const fromDate = fromParam ? new Date(fromParam) : new Date(new Date().setDate(new Date().getDate() - 30));
	const toDate = toParam ? new Date(toParam + 'T23:59:59.999Z') : new Date();

	if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
		return {
			error: 'Fechas inválidas',
			summary: null,
			invoices: [],
			topProducts: [],
			cashiers: []
		};
	}

	const matchStage: Record<string, unknown> = {
		createdAt: { $gte: fromDate, $lte: toDate }
	};

	if (cashierIdParam) {
		matchStage.cashierId = cashierIdParam;
	}

	try {
		// ---- Resumen ----
		const summaryAgg = await db.collection('invoices')
			.aggregate([
				{ $match: matchStage },
				{
					$group: {
						_id: null,
						totalSales: { $sum: '$total' },
						totalProfit: { $sum: '$totalProfit' },
						count: { $sum: 1 },
						avgTicket: { $avg: '$total' }
					}
				}
			])
			.toArray();

		const summary = summaryAgg[0] ?? { totalSales: 0, totalProfit: 0, count: 0, avgTicket: 0 };

		// ---- Facturas filtradas ----
		const invoices = await db.collection('invoices')
			.find(matchStage)
			.sort({ createdAt: -1 })
			.project({
				invoiceNumber: 1,
				total: 1,
				totalProfit: 1,
				paymentMethod: 1,
				cashierName: 1,
				cashierId: 1,
				items: {
					$map: {
						input: { $slice: ['$items', 5] },
						as: 'item',
						in: {
							productName: '$$item.productName',
							quantity: '$$item.quantity',
							unitPrice: '$$item.unitPrice',
							subtotal: '$$item.subtotal',
							profit: '$$item.profit'
						}
					}
				},
				itemCount: { $size: '$items' },
				createdAt: 1
			})
			.toArray();

		// ---- Top 10 productos más vendidos ----
		const topProducts = await db.collection('invoices')
			.aggregate([
				{ $match: matchStage },
				{ $unwind: '$items' },
				{
					$group: {
						_id: { id: '$items.productId', name: '$items.productName' },
						totalQuantity: { $sum: '$items.quantity' },
						totalSales: { $sum: '$items.subtotal' },
						totalProfit: { $sum: '$items.profit' }
					}
				},
				{ $sort: { totalQuantity: -1 } },
				{ $limit: 10 },
				{
					$project: {
						_id: 0,
						productName: '$_id.name',
						totalQuantity: 1,
						totalSales: 1,
						totalProfit: 1
					}
				}
			])
			.toArray();

		// ---- Ventas por día (para gráfica) ----
		const salesByDay = await db.collection('invoices')
			.aggregate([
				{ $match: matchStage },
				{
					$group: {
						_id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
						total: { $sum: '$total' },
						profit: { $sum: '$totalProfit' },
						count: { $sum: 1 }
					}
				},
				{ $sort: { _id: 1 } },
				{
					$project: {
						_id: 0,
						date: '$_id',
						total: 1,
						profit: 1,
						count: 1
					}
				}
			])
			.toArray();

		// ---- Facturas por cajero ----
		const salesByCashier = await db.collection('invoices')
			.aggregate([
				{ $match: matchStage },
				{
					$group: {
						_id: { id: '$cashierId', name: '$cashierName' },
						count: { $sum: 1 },
						totalSales: { $sum: '$total' },
						totalProfit: { $sum: '$totalProfit' }
					}
				},
				{ $sort: { totalSales: -1 } },
				{
					$project: {
						_id: 0,
						cashierId: '$_id.id',
						cashierName: '$_id.name',
						count: 1,
						totalSales: 1,
						totalProfit: 1
					}
				}
			])
			.toArray();

		// ---- Lista de cajeros para el selector ----
		const cashiers = await db.collection('users')
			.find({ role: 'cajero', isActive: true })
			.project({ _id: { $toString: '$_id' }, name: 1 })
			.toArray();

		const cashierOptions = cashiers.map((c) => ({
			id: c._id.toString(),
			name: c.name
		}));

		return {
			error: null,
			summary: {
				totalSales: Math.round(summary.totalSales * 100) / 100,
				totalProfit: Math.round(summary.totalProfit * 100) / 100,
				count: summary.count,
				avgTicket: Math.round(summary.avgTicket * 100) / 100
			},
			invoices: JSON.parse(JSON.stringify(invoices)),
			topProducts: JSON.parse(JSON.stringify(topProducts)),
			salesByDay: JSON.parse(JSON.stringify(salesByDay)),
			salesByCashier: JSON.parse(JSON.stringify(salesByCashier)),
			cashiers: cashierOptions,
			filters: {
				from: fromParam || '',
				to: toParam || '',
				cashierId: cashierIdParam || ''
			}
		};
	} catch (err) {
		console.error('Error en reportes:', err);
		return {
			error: 'Error al cargar reportes',
			summary: null,
			invoices: [],
			topProducts: [],
			salesByDay: [],
			salesByCashier: [],
			cashiers: [],
			filters: { from: '', to: '', cashierId: '' }
		};
	}
};
