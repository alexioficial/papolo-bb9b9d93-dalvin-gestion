import type { PageServerLoad } from './$types';
import { requireAuth } from '$lib/server/auth';
import { getDb } from '$lib/server/db';
import type { Product, Category, PaginatedResult } from '$lib/types';

export const load: PageServerLoad = async ({ url, locals }) => {
	const user = requireAuth(locals);
	const db = await getDb();

	const search = url.searchParams.get('q') || '';
	const categoryId = url.searchParams.get('category') || '';
	const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
	const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '20', 10)));
	const skip = (page - 1) * limit;

	// Build simple filter
	const filter: Record<string, unknown> = {};

	if (search) {
		filter.$or = [
			{ name: { $regex: search, $options: 'i' } },
			{ sku: { $regex: search, $options: 'i' } }
		];
	}

	if (categoryId) {
		filter.categoryId = categoryId;
	}

	const [total, products, categories] = await Promise.all([
		db.collection('products').countDocuments(filter),
		db.collection('products')
			.find(filter)
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit)
			.toArray() as Promise<Product[]>,
		db.collection('categories').find().sort({ name: 1 }).toArray() as Promise<Category[]>
	]);

	const totalPages = Math.max(1, Math.ceil(total / limit));

	const result: PaginatedResult<Product> = {
		items: products,
		total,
		page,
		totalPages
	};

	return { products: result, categories, user };
};
