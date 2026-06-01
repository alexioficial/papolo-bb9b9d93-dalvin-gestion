import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { requireAuth } from '$lib/server/auth';
import { getDb } from '$lib/server/db';
import { ObjectId } from 'mongodb';
import type { Invoice } from '$lib/types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const user = requireAuth(locals);
	const db = await getDb();

	let invoiceId: ObjectId;
	try {
		invoiceId = new ObjectId(params.id);
	} catch {
		throw error(400, 'ID de factura inválido');
	}

	const invoice = await db.collection('invoices').findOne({ _id: invoiceId }) as Invoice | null;

	if (!invoice) {
		throw error(404, 'Factura no encontrada');
	}

	// Cajero solo puede ver sus propias facturas
	if (user.role === 'cajero' && invoice.cashierId !== user.id) {
		throw error(403, 'No autorizado');
	}

	return {
		invoice: {
			...invoice,
			_id: invoice._id
		},
		user
	};
};
