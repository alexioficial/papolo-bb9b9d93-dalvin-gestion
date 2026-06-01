import { json } from '@sveltejs/kit';
import { requireAuth } from '$lib/server/auth';
import { getDb } from '$lib/server/db';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals, url }) => {
	const user = requireAuth(locals);
	const db = await getDb();

	const q = url.searchParams.get('q')?.trim() || '';
	const limit = Math.min(parseInt(url.searchParams.get('limit') || '10', 10) || 10, 50);

	if (!q || q.length < 1) {
		return json([]);
	}

	try {
		// Búsqueda textual (índice text) o por regex si el texto index no funciona
		const products = await db.collection('products')
			.find({
				isActive: true,
				$or: [
					{ name: { $regex: q, $options: 'i' } },
					{ sku: { $regex: q, $options: 'i' } }
				]
			})
			.sort({ stock: -1 })
			.limit(limit)
			.project({
				_id: { $toString: '$_id' },
				name: 1,
				sku: 1,
				salePrice: 1,
				purchasePrice: 1,
				stock: 1
			})
			.toArray();

		return json(products);
	} catch (err) {
		console.error('Error en búsqueda de productos:', err);
		return json([]);
	}
};
