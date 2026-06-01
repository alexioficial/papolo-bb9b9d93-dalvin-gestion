import type { PageServerLoad } from './$types';
import { requireAuth } from '$lib/server/auth';
import { getDb } from '$lib/server/db';
import { ObjectId } from 'mongodb';
import type { Product, Category, PaginatedResult } from '$lib/types';

export const load: PageServerLoad = async ({ url, locals }) => {
	const user = requireAuth(locals);

	const db = await getDb();

	// Query params
	const search = url.searchParams.get('q') || '';
	const categoryId = url.searchParams.get('category') || '';
	const lowStock = url.searchParams.get('lowStock') === 'true';
	const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
	const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '20', 10)));
	const skip = (page - 1) * limit;

	// Build filter
	const filter: Record<string, unknown> = {};

	if (categoryId) {
		try {
			filter.categoryId = new ObjectId(categoryId);
		} catch {
			// Si no es un ObjectId válido, buscamos por nombre de categoría
			filter.categoryId = categoryId;
		}
	}

	if (lowStock) {
		filter.$expr = { $lt: ['$stock', '$minStock'] };
	}

	if (search) {
		try {
			// Intentar $text search primero
			filter.$text = { $search: search };
		} catch {
			// Fallback a $regex
			filter.$or = [
				{ name: { $regex: search, $options: 'i' } },
				{ sku: { $regex: search, $options: 'i' } },
				{ description: { $regex: search, $options: 'i' } }
			];
		}
	}

	// Si usamos $text, no podemos mezclar con $or fácilmente, así que re-hacemos
	let finalFilter: Record<string, unknown> = { ...filter };
	if (search && !filter.$text) {
		finalFilter.$or = [
			{ name: { $regex: search, $options: 'i' } },
			{ sku: { $regex: search, $options: 'i' } },
			{ description: { $regex: search, $options: 'i' } }
		];
	} else if (search && filter.$text) {
		finalFilter = { $text: { $search: search } };
		if (categoryId) {
			try {
				finalFilter.categoryId = new ObjectId(categoryId);
			} catch {
				finalFilter.categoryId = categoryId;
			}
		}
		if (lowStock) {
			finalFilter.$expr = { $lt: ['$stock', '$minStock'] };
		}
	}

	const [total, products, categories] = await Promise.all([
		db.collection('products').countDocuments(finalFilter),
		db.collection('products')
			.find(finalFilter)
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit)
			.toArray() as Promise<Product[]>,
		db.collection('categories').find().sort({ name: 1 }).toArray() as Promise<Category[]>
	]);

	const totalPages = Math.max(1, Math.ceil(total / limit));

	const result: PaginatedResult<Product> = {
		items: products.map(p => ({ ...p, _id: p._id })),
		total,
		page,
		totalPages
	};

	return {
		products: result,
		categories,
		user
	};
};
