<script lang="ts">
	import { page } from '$app/stores';

	let { currentRoute = $derived($page.url.pathname) } = $props();

	const adminLinks = [
		{ href: '/dashboard', label: 'Dashboard', icon: '📊' },
		{ href: '/products', label: 'Productos', icon: '📦' },
		{ href: '/invoices', label: 'Facturas', icon: '🧾' },
		{ href: '/reports', label: 'Reportes', icon: '📈' },
		{ href: '/import', label: 'Importar', icon: '📥' }
	];

	const cajeroLinks = [
		{ href: '/dashboard', label: 'Dashboard', icon: '📊' },
		{ href: '/invoices/new', label: 'Nueva Venta', icon: '➕' },
		{ href: '/products', label: 'Almacén', icon: '📦' },
		{ href: '/invoices', label: 'Mis Facturas', icon: '🧾' }
	];

	let { user, open, onClose } = $props<{
		user: { name: string; role: string } | null;
		open: boolean;
		onClose: () => void;
	}>();

	const links = $derived(user?.role === 'admin' ? adminLinks : cajeroLinks);

	function isActive(href: string): boolean {
		if (href === '/dashboard') return currentRoute === '/dashboard';
		return currentRoute.startsWith(href);
	}
</script>

<!-- Mobile overlay -->
{#if open}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div
		class="fixed inset-0 bg-black/50 z-30 lg:hidden"
		onclick={onClose}
		role="presentation"
	></div>
{/if}

<aside
	class="fixed top-0 left-0 h-screen w-64 bg-[var(--color-sidebar)] z-40
	       transition-transform duration-200 ease-out
	       {open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
	       flex flex-col"
>
	<!-- Logo -->
	<div class="flex items-center gap-3 px-6 py-5 border-b border-white/10">
		<div class="w-8 h-8 rounded-lg bg-[var(--color-primary)] flex items-center justify-center text-white font-bold text-sm">D</div>
		<div>
			<h1 class="text-white font-heading font-semibold text-base">Dalvin</h1>
			<p class="text-[var(--color-sidebar-text)] text-xs">Gestión</p>
		</div>
	</div>

	<!-- Navigation -->
	<nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto" role="navigation" aria-label="Navegación principal">
		{#each links as link}
			<a
				href={link.href}
				class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150
				       {isActive(link.href)
				         ? 'bg-[var(--color-sidebar-active)] text-white'
				         : 'text-[var(--color-sidebar-text)] hover:bg-white/10 hover:text-white'}"
				aria-current={isActive(link.href) ? 'page' : undefined}
			>
				<span class="text-lg" aria-hidden="true">{link.icon}</span>
				<span>{link.label}</span>
			</a>
		{/each}
	</nav>

	<!-- User info footer -->
	<div class="px-4 py-4 border-t border-white/10">
		<div class="flex items-center gap-3">
			<div class="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white text-xs font-bold uppercase">
				{user?.name?.charAt(0) || 'U'}
			</div>
			<div class="flex-1 min-w-0">
				<p class="text-white text-sm font-medium truncate">{user?.name || 'Usuario'}</p>
				<p class="text-[var(--color-sidebar-text)] text-xs capitalize">{user?.role || ''}</p>
			</div>
		</div>
		<a
			href="/logout"
			class="mt-3 flex items-center gap-2 px-3 py-2 text-[var(--color-sidebar-text)] text-sm rounded-lg hover:bg-white/10 hover:text-white transition-colors"
		>
			<span aria-hidden="true">🚪</span>
			<span>Cerrar sesión</span>
		</a>
	</div>
</aside>
