import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireAuth } from '$lib/server/auth';
import { getDb } from '$lib/server/db';
import type { Product } from '$lib/types';

export const GET: RequestHandler = async ({ url, locals }) => {
	const user = requireAuth(locals);
	const db = await getDb();

	const q = url.searchParams.get('q') || '';
	if (!q || q.length < 1) {
		return json({ items: [] });
	}

	// Buscar productos activos con stock > 0
	const filter: Record<string, unknown> = {
		isActive: true,
		stock: { $gt: 0 }
	};

	// Búsqueda textual
	if (q.length > 0) {
		filter.$or = [
			{ name: { $regex: q, $options: 'i' } },
			{ sku: { $regex: q, $options: 'i' } }
		];
	}

	const products = await db.collection('products')
		.find(filter)
		.sort({ name: 1 })
		.limit(10)
		.toArray() as Product[];

	return json({
		items: products.map((p) => ({
			_id: p._id.toString(),
			name: p.name,
			sku: p.sku,
			salePrice: p.salePrice,
			purchasePrice: p.purchasePrice,
			stock: p.stock
		}))
	});
};
