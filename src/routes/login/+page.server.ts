import { login, setSessionCookie } from '$lib/server/auth';
import { redirect, fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async (event) => {
		const data = await event.request.formData();
		const email = (data.get('email') as string)?.trim().toLowerCase();
		const password = data.get('password') as string;

		if (!email || !password) {
			return fail(400, { error: 'Todos los campos son requeridos' });
		}

		const result = await login(email, password);

		if ('error' in result) {
			return fail(401, { error: result.error });
		}

		setSessionCookie(event, result.token);
		throw redirect(303, '/dashboard');
	}
};
