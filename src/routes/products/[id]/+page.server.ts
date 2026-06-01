import type { PageServerLoad } from './$types';
import { requireAuth } from '$lib/server/auth';
import { getDb } from '$lib/server/db';
import { ObjectId } from 'mongodb';
import { error } from '@sveltejs/kit';
import type { Product, Category } from '$lib/types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const user = requireAuth(locals);

	const { id } = params;

	if (!ObjectId.isValid(id)) {
		throw error(404, 'Producto no encontrado');
	}

	const db = await getDb();

	const product = await db.collection('products').findOne({
		_id: new ObjectId(id)
	}) as Product | null;

	if (!product) {
		throw error(404, 'Producto no encontrado');
	}

	// Obtener categoría relacionada
	let category: Category | null = null;
	if (product.categoryId) {
		try {
			category = await db.collection('categories').findOne({
				_id: new ObjectId(product.categoryId)
			}) as Category | null;
		} catch {
			// categoryId podría ser string no-ObjectId
			category = await db.collection('categories').findOne({
				name: product.categoryId
			}) as Category | null;
		}
	}

	// Obtener creador
	let createdByName = '—';
	if (product.createdBy) {
		try {
			const creator = await db.collection('users').findOne(
				{ _id: new ObjectId(product.createdBy) },
				{ projection: { name: 1 } }
			);
			if (creator) createdByName = creator.name;
		} catch {
			// ignorar
		}
	}

	return {
		product,
		category,
		createdByName,
		user
	};
};
