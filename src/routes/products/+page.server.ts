import type { PageServerLoad } from './$types';
import { requireAuth } from '$lib/server/auth';
import { getDb } from '$lib/server/db';
import { ObjectId } from 'mongodb';
import type { Product, Category, PaginatedResult } from '$lib/types';

export const load: PageServerLoad = async ({ url, locals }) => {
	const user = requireAuth(locals);
	const db = await getDb();

	const search = url.searchParams.get('q') || '';
	const categoryId = url.searchParams.get('category') || '';
	const lowStock = url.searchParams.get('lowStock') === 'true';
	const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
	const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '20', 10)));
	const skip = (page - 1) * limit;

	try {
		// Build pipeline stages
		const pipeline: Record<string, unknown>[] = [];

		// Match stage
		const match: Record<string, unknown> = {};

		if (categoryId) {
			try {
				match.categoryId = new ObjectId(categoryId);
			} catch {
				match.categoryId = categoryId;
			}
		}

		if (lowStock) {
			match.$expr = { $lt: ['$stock', '$minStock'] };
		}

		if (search) {
			match.$or = [
				{ name: { $regex: search, $options: 'i' } },
				{ sku: { $regex: search, $options: 'i' } },
				{ description: { $regex: search, $options: 'i' } }
			];
		}

		if (Object.keys(match).length > 0) {
			pipeline.push({ $match: match });
		}

		// Sort and paginate
		pipeline.push({ $sort: { createdAt: -1 } });
		pipeline.push({ $skip: skip });
		pipeline.push({ $limit: limit });

		// Run count and find in parallel
		const [products, total, categories] = await Promise.all([
			db.collection('products').aggregate(pipeline).toArray() as Promise<Product[]>,
			db.collection('products').countDocuments(match),
			db.collection('categories').find().sort({ name: 1 }).toArray() as Promise<Category[]>
		]);

		const totalPages = Math.max(1, Math.ceil(total / limit));

		const result: PaginatedResult<Product> = {
			items: products as Product[],
			total,
			page,
			totalPages
		};

		return { products: result, categories, user };
	} catch (err) {
		console.error('Error loading products:', err);
		throw new Error('Error al cargar productos');
	}
};
