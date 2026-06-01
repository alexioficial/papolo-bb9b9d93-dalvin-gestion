import type { PageServerLoad } from './$types';
import { requireAuth, requireRole } from '$lib/server/auth';
import { getDb } from '$lib/server/db';
import { ObjectId } from 'mongodb';
import type { Invoice, PaginatedResult } from '$lib/types';

export const load: PageServerLoad = async ({ url, locals }) => {
	const user = requireAuth(locals);
	const db = await getDb();

	const from = url.searchParams.get('from') || '';
	const to = url.searchParams.get('to') || '';
	const cashierId = url.searchParams.get('cashierId') || '';
	const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
	const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '20', 10)));
	const skip = (page - 1) * limit;

	// Build filter
	const filter: Record<string, unknown> = {};

	// Admin ve todas, cajero solo las suyas
	if (user.role === 'cajero') {
		filter.cashierId = user.id;
	} else if (cashierId) {
		// Admin puede filtrar por cajero
		filter.cashierId = cashierId;
	}

	// Filtro por rango de fechas
	if (from || to) {
		const dateFilter: Record<string, unknown> = {};
		if (from) {
			const fromDate = new Date(from);
			if (!isNaN(fromDate.getTime())) {
				dateFilter.$gte = fromDate;
			}
		}
		if (to) {
			const toDate = new Date(to);
			if (!isNaN(toDate.getTime())) {
				// Incluir todo el día del "to"
				toDate.setHours(23, 59, 59, 999);
				dateFilter.$lte = toDate;
			}
		}
		if (Object.keys(dateFilter).length > 0) {
			filter.createdAt = dateFilter;
		}
	}

	const [total, invoices, cashiers] = await Promise.all([
		db.collection('invoices').countDocuments(filter),
		db.collection('invoices')
			.find(filter)
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit)
			.toArray() as Promise<Invoice[]>,
		// Solo admin necesita lista de cajeros para filtrar
		user.role === 'admin'
			? db.collection('users')
				.find(
					{ role: 'cajero', isActive: true },
					{ projection: { _id: 1, name: 1, email: 1 } }
				)
				.sort({ name: 1 })
				.toArray()
			: Promise.resolve([])
	]);

	const totalPages = Math.max(1, Math.ceil(total / limit));

	const result: PaginatedResult<Invoice> = {
		items: invoices.map((inv) => ({
			...inv,
			_id: inv._id
		})),
		total,
		page,
		totalPages
	};

	return {
		invoices: result,
		cashiers: cashiers.map((c) => ({
			id: c._id.toString(),
			name: c.name,
			email: c.email
		})),
		user,
		filters: { from, to, cashierId }
	};
};
