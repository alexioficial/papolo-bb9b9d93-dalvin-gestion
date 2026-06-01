import { json } from '@sveltejs/kit';
import { seed } from '$lib/server/seed';
import { getDb } from '$lib/server/db';
import { requireAuth } from '$lib/server/auth';
import type { RequestHandler } from './$types';

/**
 * Endpoint para seed de datos de prueba.
 * GET: Ejecuta seed si no hay datos, o fuerza si force=true
 * Solo accesible por admin o en desarrollo (sin auth requirement en dev)
 */
export const GET: RequestHandler = async ({ locals, url }) => {
	// En producción, requiere admin
	if (process.env.NODE_ENV === 'production') {
		try {
			requireAuth(locals);
			if (locals.user?.role !== 'admin') {
				return json({ error: 'Se requieren permisos de administrador' }, { status: 403 });
			}
		} catch {
			return json({ error: 'No autorizado' }, { status: 401 });
		}
	}

	const force = url.searchParams.get('force') === 'true';

	try {
		const db = await getDb();

		if (!force) {
			const userCount = await db.collection('users').countDocuments();
			if (userCount > 0) {
				return json({
					message: 'Los datos ya existen. Usa ?force=true para resetear (borra todo primero).',
					seeded: false
				});
			}
		}

		if (force) {
			// Limpiar colecciones
			await db.collection('users').deleteMany({});
			await db.collection('sessions').deleteMany({});
			await db.collection('categories').deleteMany({});
			await db.collection('products').deleteMany({});
			await db.collection('invoices').deleteMany({});
			await db.collection('counters').deleteMany({});
		}

		await seed();

		return json({
			message: 'Seed ejecutado correctamente',
			seeded: true,
			credentials: {
				admin: { email: 'admin@dalvin.com', password: 'admin123' },
				cajero1: { email: 'carlos@dalvin.com', password: 'cajero123' },
				cajero2: { email: 'maria@dalvin.com', password: 'cajero123' }
			}
		});
	} catch (err) {
		console.error('Error en seed endpoint:', err);
		return json({
			error: 'Error al ejecutar seed',
			detail: err instanceof Error ? err.message : String(err)
		}, { status: 500 });
	}
};
