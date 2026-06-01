import type { PageServerLoad, Actions } from './$types';
import { requireRole } from '$lib/server/auth';
import { getDb } from '$lib/server/db';
import { validateProduct } from '$lib/utils/validation';
import { ObjectId } from 'mongodb';
import { fail, redirect } from '@sveltejs/kit';
import type { Category } from '$lib/types';

export const load: PageServerLoad = async ({ locals }) => {
	requireRole(locals, ['admin']);

	const db = await getDb();
	const categories = await db.collection('categories')
		.find()
		.sort({ name: 1 })
		.toArray() as Category[];

	return { categories };
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const user = requireRole(locals, ['admin']);

		const data = await request.formData();
		const name = (data.get('name') as string)?.trim() || '';
		const sku = (data.get('sku') as string)?.trim() || '';
		const description = (data.get('description') as string)?.trim() || '';
		const categoryId = (data.get('categoryId') as string) || '';
		const purchasePrice = parseFloat(data.get('purchasePrice') as string) || 0;
		const salePrice = parseFloat(data.get('salePrice') as string) || 0;
		const stock = parseInt(data.get('stock') as string) || 0;
		const minStock = parseInt(data.get('minStock') as string) || 5;

		// Server-side validation
		const validationErrors = validateProduct({ name, sku, purchasePrice, salePrice, stock });
		if (Object.keys(validationErrors).length > 0) {
			return fail(400, {
				errors: validationErrors,
				values: { name, sku, description, categoryId, purchasePrice, salePrice, stock, minStock }
			});
		}

		if (description.length > 500) {
			return fail(400, {
				errors: { description: 'La descripción no puede exceder 500 caracteres' },
				values: { name, sku, description, categoryId, purchasePrice, salePrice, stock, minStock }
			});
		}

		const db = await getDb();

		// Check SKU uniqueness
		const existingSku = await db.collection('products').findOne({ sku });
		if (existingSku) {
			return fail(400, {
				errors: { sku: 'Ya existe un producto con este SKU' },
				values: { name, sku, description, categoryId, purchasePrice, salePrice, stock, minStock }
			});
		}

		// Resolve categoryId - if it's a valid ObjectId string use it, otherwise try by name
		let resolvedCategoryId: ObjectId | string = categoryId;
		if (categoryId) {
			try {
				resolvedCategoryId = new ObjectId(categoryId);
			} catch {
				// Buscar categoría por nombre
				const cat = await db.collection('categories').findOne({ name: categoryId });
				if (cat) {
					resolvedCategoryId = cat._id;
				} else {
					return fail(400, {
						errors: { categoryId: 'Categoría no encontrada' },
						values: { name, sku, description, categoryId, purchasePrice, salePrice, stock, minStock }
					});
				}
			}
		}

		// Insert product
		const product = {
			name,
			sku,
			description,
			categoryId: resolvedCategoryId.toString(),
			purchasePrice,
			salePrice,
			stock,
			minStock,
			isActive: true,
			createdBy: user.id,
			createdAt: new Date(),
			updatedAt: new Date()
		};

		await db.collection('products').insertOne(product);

		throw redirect(303, '/products');
	}
};
