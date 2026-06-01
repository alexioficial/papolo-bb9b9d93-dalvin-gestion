import { requireRole } from '$lib/server/auth';
import { getDb } from '$lib/server/db';
import { validateCSVRow } from '$lib/utils/validation';
import { error, fail } from '@sveltejs/kit';
import { ObjectId } from 'mongodb';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	requireRole(locals, ['admin']);
	return {};
};

export const actions: Actions = {
	upload: async ({ locals, request }) => {
		requireRole(locals, ['admin']);
		const db = await getDb();

		const formData = await request.formData();
		const file = formData.get('file') as File | null;

		if (!file) {
			return fail(400, { error: 'No se recibió ningún archivo' });
		}

		if (!file.name.endsWith('.csv')) {
			return fail(400, { error: 'El archivo debe ser CSV' });
		}

		// Leer contenido del CSV
		const text = await file.text();
		const lines = text.split('\n').filter((line) => line.trim());

		if (lines.length < 2) {
			return fail(400, { error: 'El CSV debe tener al menos un encabezado y una fila de datos' });
		}

		// Parsear encabezados
		const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
		const requiredHeaders = ['name', 'sku', 'purchaseprice', 'saleprice', 'stock'];
		const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h));

		if (missingHeaders.length > 0) {
			return fail(400, {
				error: `Faltan columnas requeridas: ${missingHeaders.join(', ')}. Requeridas: ${requiredHeaders.join(', ')}`
			});
		}

		// Buscar índice de cada columna
		const idxName = headers.indexOf('name');
		const idxSku = headers.indexOf('sku');
		const idxDesc = headers.indexOf('description');
		const idxCategory = headers.indexOf('category');
		const idxPurchasePrice = headers.indexOf('purchaseprice');
		const idxSalePrice = headers.indexOf('saleprice');
		const idxStock = headers.indexOf('stock');
		const idxMinStock = headers.indexOf('minstock');

		const imported: string[] = [];
		const skipped: string[] = [];
		const errors: Array<{ row: number; reason: string }> = [];

		// Cache de categorías: name -> ObjectId string
		const categoryCache: Record<string, string> = {};
		const existingCats = await db.collection('categories').find({}).project({ name: 1 }).toArray();
		for (const cat of existingCats) {
			categoryCache[cat.name.toLowerCase()] = cat._id.toString();
		}

		for (let i = 1; i < lines.length; i++) {
			const values = lines[i].split(',').map((v) => v.trim());

			if (values.length < headers.length) {
				errors.push({ row: i + 1, reason: `Número incorrecto de columnas (${values.length}, esperado ${headers.length})` });
				continue;
			}

			// Construir objeto fila
			const row: Record<string, string> = {
				name: values[idxName] || '',
				sku: values[idxSku] || '',
				description: idxDesc >= 0 ? (values[idxDesc] || '') : '',
				category: idxCategory >= 0 ? (values[idxCategory] || '') : '',
				purchasePrice: values[idxPurchasePrice] || '0',
				salePrice: values[idxSalePrice] || '0',
				stock: values[idxStock] || '0',
				minStock: idxMinStock >= 0 ? (values[idxMinStock] || '0') : '0'
			};

			// Validar fila
			const validation = validateCSVRow(row, i);
			if (validation.errors.length > 0) {
				errors.push({ row: i + 1, reason: validation.errors.join('; ') });
				continue;
			}

			const data = validation.data!;

			// Verificar duplicado por SKU
			const existing = await db.collection('products').findOne({ sku: data.sku as string });
			if (existing) {
				skipped.push(data.sku as string);
				continue;
			}

			// Buscar/crear categoría
			const catName = (data.categoryName as string) || 'General';
			let catId = categoryCache[catName.toLowerCase()];
			if (!catId) {
				const result = await db.collection('categories').insertOne({
					name: catName,
					description: '',
					createdAt: new Date(),
					updatedAt: new Date()
				});
				catId = result.insertedId.toString();
				categoryCache[catName.toLowerCase()] = catId;
			}

			// Insertar producto
			await db.collection('products').insertOne({
				_id: new ObjectId(),
				name: data.name as string,
				sku: data.sku as string,
				description: (data.description as string) || '',
				categoryId: catId,
				purchasePrice: data.purchasePrice as number,
				salePrice: data.salePrice as number,
				stock: data.stock as number,
				minStock: (data.minStock as number) || 0,
				isActive: true,
				createdBy: locals.user!.id,
				createdAt: new Date(),
				updatedAt: new Date()
			});

			imported.push(data.sku as string);
		}

		return {
			success: true,
			summary: {
				total: lines.length - 1,
				imported: imported.length,
				skipped: skipped.length,
				errors: errors.length
			},
			imported,
			skipped,
			errors
		};
	}
};
