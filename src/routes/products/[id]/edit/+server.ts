import type { RequestHandler } from './$types';
import { requireRole } from '$lib/server/auth';
import { getDb } from '$lib/server/db';
import { ObjectId } from 'mongodb';
import { error, json } from '@sveltejs/kit';

export const DELETE: RequestHandler = async ({ params, locals }) => {
	requireRole(locals, ['admin']);

	const { id } = params;

	if (!ObjectId.isValid(id)) {
		throw error(404, 'Producto no encontrado');
	}

	const db = await getDb();

	const result = await db.collection('products').deleteOne({
		_id: new ObjectId(id)
	});

	if (result.deletedCount === 0) {
		throw error(404, 'Producto no encontrado');
	}

	return json({ success: true });
};
