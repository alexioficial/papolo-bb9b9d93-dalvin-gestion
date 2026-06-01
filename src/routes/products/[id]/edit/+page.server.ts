import type { PageServerLoad, Actions } from './$types';
import { requireRole } from '$lib/server/auth';
import { getDb } from '$lib/server/db';
import { validateProduct } from '$lib/utils/validation';
import { ObjectId } from 'mongodb';
import { fail, redirect, error } from '@sveltejs/kit';
import type { Product, Category } from '$lib/types';

export const load: PageServerLoad = async ({ params, locals }) => {
	requireRole(locals, ['admin']);

	const { id } = params;

	if (!ObjectId.isValid(id)) {
		throw error(404, 'Producto no encontrado');
	}

	const db = await getDb();

	const [product, categories] = await Promise.all([
		db.collection('products').findOne({ _id: new ObjectId(id) }) as Promise<Product | null>,
		db.collection('categories').find().sort({ name: 1 }).toArray() as Promise<Category[]>
	]);

	if (!product) {
		throw error(404, 'Producto no encontrado');
	}

	return { product, categories };
};

export const actions: Actions = {
	default: async ({ request, params, locals }) => {
		requireRole(locals, ['admin']);

		const { id } = params;

		if (!ObjectId.isValid(id)) {
			throw error(404, 'Producto no encontrado');
		}

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

		// Check SKU uniqueness (excluyendo el producto actual)
		const existingSku = await db.collection('products').findOne({
			sku,
			_id: { $ne: new ObjectId(id) }
		});
		if (existingSku) {
			return fail(400, {
				errors: { sku: 'Ya existe otro producto con este SKU' },
				values: { name, sku, description, categoryId, purchasePrice, salePrice, stock, minStock }
			});
		}

		// Resolve categoryId
		let resolvedCategoryId: string | null = null;
		if (categoryId) {
			try {
				const catObjId = new ObjectId(categoryId);
				const cat = await db.collection('categories').findOne({ _id: catObjId });
				if (cat) {
					resolvedCategoryId = cat._id.toString();
				} else {
					return fail(400, {
						errors: { categoryId: 'Categoría no encontrada' },
						values: { name, sku, description, categoryId, purchasePrice, salePrice, stock, minStock }
					});
				}
			} catch {
				// Intentar por nombre
				const cat = await db.collection('categories').findOne({ name: categoryId });
				if (cat) {
					resolvedCategoryId = cat._id.toString();
				} else {
					return fail(400, {
						errors: { categoryId: 'Categoría no encontrada' },
						values: { name, sku, description, categoryId, purchasePrice, salePrice, stock, minStock }
					});
				}
			}
		}

		// Update product
		const updateData: Record<string, unknown> = {
			name,
			sku,
			description,
			purchasePrice,
			salePrice,
			stock,
			minStock,
			updatedAt: new Date()
		};

		if (resolvedCategoryId !== null) {
			updateData.categoryId = resolvedCategoryId;
		}

		await db.collection('products').updateOne(
			{ _id: new ObjectId(id) },
			{ $set: updateData }
		);

		throw redirect(303, `/products/${id}`);
	}
};
