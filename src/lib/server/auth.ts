import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { getDb } from './db';
import type { AppUser } from '$lib/types';
import { ObjectId } from 'mongodb';
import { redirect, error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

const SALT_ROUNDS = 10;
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 días

export async function hashPassword(password: string): Promise<string> {
	return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
	return bcrypt.compare(password, hash);
}

export async function createSession(userId: string): Promise<string> {
	const db = await getDb();
	const token = crypto.randomUUID();
	const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

	await db.collection('sessions').insertOne({
		token,
		userId,
		expiresAt,
		createdAt: new Date()
	});

	return token;
}

export async function getSessionUser(token: string | undefined): Promise<AppUser | null> {
	if (!token) return null;

	try {
		const db = await getDb();
		const session = await db.collection('sessions').findOne({
			token,
			expiresAt: { $gt: new Date() }
		});

		if (!session) return null;

		const user = await db.collection('users').findOne({
			_id: new ObjectId(session.userId),
			isActive: true
		});

		if (!user) return null;

		return {
			id: user._id.toString(),
			name: user.name,
			email: user.email,
			role: user.role
		};
	} catch {
		return null;
	}
}

export async function destroySession(token: string): Promise<void> {
	try {
		const db = await getDb();
		await db.collection('sessions').deleteOne({ token });
	} catch {
		// ignorar errores de logout
	}
}

export function requireAuth(locals: App.Locals): AppUser {
	const user = locals.user;
	if (!user) {
		throw redirect(303, '/login');
	}
	return user;
}

export function requireRole(locals: App.Locals, roles: string[]): AppUser {
	const user = requireAuth(locals);
	if (!roles.includes(user.role)) {
		throw error(403, 'No autorizado');
	}
	return user;
}

export async function login(email: string, password: string): Promise<{ user: AppUser; token: string } | { error: string }> {
	const db = await getDb();
	const user = await db.collection('users').findOne({ email, isActive: true });

	if (!user) {
		return { error: 'Credenciales inválidas' };
	}

	const valid = await verifyPassword(password, user.passwordHash);
	if (!valid) {
		return { error: 'Credenciales inválidas' };
	}

	const token = await createSession(user._id.toString());

	return {
		user: {
			id: user._id.toString(),
			name: user.name,
			email: user.email,
			role: user.role
		},
		token
	};
}

export function setSessionCookie(event: RequestEvent, token: string): void {
	event.cookies.set('session', token, {
		httpOnly: true,
		sameSite: 'strict',
		secure: process.env.NODE_ENV === 'production',
		path: '/',
		maxAge: 7 * 24 * 60 * 60
	});
}

export function clearSessionCookie(event: RequestEvent): void {
	event.cookies.delete('session', {
		httpOnly: true,
		sameSite: 'strict',
		secure: process.env.NODE_ENV === 'production',
		path: '/'
	});
}
