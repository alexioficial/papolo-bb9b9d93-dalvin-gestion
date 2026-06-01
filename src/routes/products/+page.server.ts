import type { PageServerLoad } from './$types';
import { requireAuth } from '$lib/server/auth';
import { getDb } from '$lib/server/db';
import type { Product, Category, PaginatedResult } from '$lib/types';

export const load: PageServerLoad = async ({ url, locals }) => {
	const user = requireAuth(locals);
	const db = await getDb();

	try {
		// Ultra simple test - just count and list
		const total = await db.collection('products').countDocuments({});
		const products = await db.collection('products')
			.find({})
			.sort({ createdAt: -1 })
			.limit(20)
			.toArray() as Product[];

		const categories = await db.collection('categories')
			.find()
			.sort({ name: 1 })
			.toArray() as Category[];

		const result: PaginatedResult<Product> = {
			items: products,
			total,
			page: 1,
			totalPages: Math.max(1, Math.ceil(total / 20))
		};

		return { products: result, categories, user };
	} catch (err) {
		console.error('PRODUCTS ERROR:', err);
		throw err;
	}
};
