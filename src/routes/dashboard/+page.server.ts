import { requireAuth } from '$lib/server/auth';
import { getDb } from '$lib/server/db';
import { ObjectId } from 'mongodb';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const user = requireAuth(locals);
	const db = await getDb();

	const todayStart = new Date();
	todayStart.setHours(0, 0, 0, 0);
	const todayEnd = new Date();
	todayEnd.setHours(23, 59, 59, 999);

	// --- Cargar stats según el rol ---
	if (user.role === 'admin') {
		// Total de productos activos
		const totalProducts = await db.collection('products').countDocuments({ isActive: true });

		// Total de facturas
		const totalInvoices = await db.collection('invoices').countDocuments();

		// Ventas de hoy (suma de totales)
		const todaySalesAgg = await db.collection('invoices')
			.aggregate([
				{ $match: { createdAt: { $gte: todayStart, $lte: todayEnd } } },
				{ $group: { _id: null, total: { $sum: '$total' }, profit: { $sum: '$totalProfit' }, count: { $sum: 1 } } }
			])
			.toArray();

		const todaySales = todaySalesAgg[0]?.total ?? 0;
		const todayProfit = todaySalesAgg[0]?.profit ?? 0;
		const todayInvoices = todaySalesAgg[0]?.count ?? 0;

		// Productos con stock bajo (< minStock y activos)
		const lowStockProducts = await db.collection('products')
			.aggregate([
				{ $match: { isActive: true, $expr: { $lte: ['$stock', '$minStock'] } } },
				{ $sort: { stock: 1 } },
				{ $limit: 5 },
				{
					$lookup: {
						from: 'categories',
						localField: 'categoryId',
						foreignField: '_id',
						pipeline: [{ $project: { name: 1 } }],
						as: 'category'
					}
				},
				{ $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
				{ $project: { name: 1, sku: 1, stock: 1, minStock: 1, salePrice: 1, categoryName: '$category.name' } }
			])
			.toArray();

		// Últimas 5 facturas con datos completos
		const recentInvoices = await db.collection('invoices')
			.find({})
			.sort({ createdAt: -1 })
			.limit(5)
			.project({
				invoiceNumber: 1,
				total: 1,
				totalProfit: 1,
				paymentMethod: 1,
				cashierName: 1,
				items: { $slice: 3 },
				itemCount: { $size: '$items' },
				createdAt: 1
			})
			.toArray();

		// Ganancia total acumulada
		const totalProfitAgg = await db.collection('invoices')
			.aggregate([
				{ $group: { _id: null, total: { $sum: '$totalProfit' } } }
			])
			.toArray();
		const totalProfit = totalProfitAgg[0]?.total ?? 0;

		return {
			role: 'admin' as const,
			stats: {
				totalProducts,
				totalInvoices,
				todaySales,
				todayProfit,
				todayInvoices,
				totalProfit
			},
			lowStockProducts: JSON.parse(JSON.stringify(lowStockProducts)),
			recentInvoices: JSON.parse(JSON.stringify(recentInvoices))
		};
	} else {
		// Cajero: solo sus facturas de hoy
		const todayInvoicesAgg = await db.collection('invoices')
			.aggregate([
				{ $match: { cashierId: user.id, createdAt: { $gte: todayStart, $lte: todayEnd } } },
				{ $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 }, profit: { $sum: '$totalProfit' } } }
			])
			.toArray();

		const todaySales = todayInvoicesAgg[0]?.total ?? 0;
		const todayInvoices = todayInvoicesAgg[0]?.count ?? 0;
		const todayProfit = todayInvoicesAgg[0]?.profit ?? 0;

		// Últimas 5 facturas del cajero
		const recentInvoices = await db.collection('invoices')
			.find({ cashierId: user.id })
			.sort({ createdAt: -1 })
			.limit(5)
			.project({
				invoiceNumber: 1,
				total: 1,
				totalProfit: 1,
				paymentMethod: 1,
				items: { $slice: 3 },
				itemCount: { $size: '$items' },
				createdAt: 1
			})
			.toArray();

		return {
			role: 'cajero' as const,
			stats: {
				todaySales,
				todayInvoices,
				todayProfit
			},
			recentInvoices: JSON.parse(JSON.stringify(recentInvoices))
		};
	}
};
