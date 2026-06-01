// GET /api/health — health check endpoint
import { json } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';

export async function GET() {
	try {
		const db = await getDb();
		await db.command({ ping: 1 });
		return json({ status: 'ok', db: 'connected' });
	} catch (e) {
		return json({ status: 'error', message: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 });
	}
}
