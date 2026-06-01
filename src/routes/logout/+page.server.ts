import { redirect } from '@sveltejs/kit';
import { destroySession, clearSessionCookie } from '$lib/server/auth';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const token = event.cookies.get('session');
	if (token) {
		await destroySession(token);
	}
	clearSessionCookie(event);
	throw redirect(303, '/login');
};
