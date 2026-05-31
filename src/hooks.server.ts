import type { Handle } from '@sveltejs/kit';
import { getSessionUser } from '$lib/server/auth';

export const handle: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get('session');
	event.locals.user = await getSessionUser(token);

	const response = await resolve(event);
	return response;
};
