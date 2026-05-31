import type { AppUser } from '$lib/types';

declare global {
	namespace App {
		interface Locals {
			user: AppUser | null;
		}
		interface PageData {
			user: AppUser | null;
		}
	}
}

export {};
