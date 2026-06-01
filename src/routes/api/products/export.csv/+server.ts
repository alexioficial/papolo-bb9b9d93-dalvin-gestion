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

export const GET: RequestHandler = async ({ locals }) => {
	requireRole(locals, ['admin']);
	const db = await getDb();

	const products = await db.collection('products')
		.aggregate([
			{ $match: { isActive: true } },
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
			{ $sort: { name: 1 } },
			{
				$project: {
					_id: 0,
					sku: 1,
					name: 1,
					description: 1,
					categoryName: '$category.name',
					purchasePrice: 1,
					salePrice: 1,
					stock: 1,
					minStock: 1
				}
			}
		])
		.toArray();

	const headers = ['SKU', 'Nombre', 'Descripción', 'Categoría', 'PrecioCompra', 'PrecioVenta', 'Stock', 'StockMinimo'];
	const rows = products.map((p) => [
		p.sku,
		p.name,
		p.description || '',
		p.categoryName || 'Sin categoría',
		p.purchasePrice,
		p.salePrice,
		p.stock,
		p.minStock
	]);

	const csvContent = [
		headers.join(','),
		...rows.map((row) => row.map((v) => escapeCSV(v)).join(','))
	].join('\n');

	// BOM para Excel con UTF-8
	const bom = '\uFEFF';

	return new Response(bom + csvContent, {
		headers: {
			'Content-Type': 'text/csv; charset=utf-8',
			'Content-Disposition': `attachment; filename="productos_${new Date().toISOString().split('T')[0]}.csv"`
		}
	});
};
