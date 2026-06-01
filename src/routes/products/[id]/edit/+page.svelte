<script lang="ts">
	import type { PageData } from './$types';
	import { useToast } from '$lib/stores/toast.svelte';
	import ProductForm from '$lib/components/products/ProductForm.svelte';
	import { goto } from '$app/navigation';

	let { data } = $props<{ data: PageData }>();

	let toast = useToast();
	let isSubmitting = $state(false);

	let product = $derived(data.product);

	function handleSubmit(formData: Record<string, unknown>) {
		isSubmitting = true;

		const fd = new FormData();
		Object.entries(formData).forEach(([key, value]) => {
			fd.append(key, String(value));
		});

		fetch(`/products/${product._id.toString()}/edit`, {
			method: 'POST',
			body: fd
		}).then(async (res) => {
			if (res.redirected) {
				toast.success('Producto actualizado exitosamente');
				goto(res.url);
			} else {
				const result = await res.json().catch(() => ({}));
				if (result?.errors) {
					toast.error('Error al actualizar el producto');
				} else {
					toast.error('Error al actualizar el producto');
				}
				isSubmitting = false;
			}
		}).catch(() => {
			toast.error('Error de conexión al actualizar el producto');
			isSubmitting = false;
		});
	}

	function handleCancel() {
		goto(`/products/${product._id.toString()}`);
	}
</script>

<svelte:head>
	<title>Editar {product.name} - Dalvin</title>
</svelte:head>

<div class="max-w-3xl mx-auto">
	<!-- Breadcrumb -->
	<div class="mb-6">
		<nav class="flex items-center gap-2 text-sm text-[var(--color-text-muted)] mb-2">
			<a href="/products" class="hover:text-[var(--color-primary)] transition-colors">Productos</a>
			<span>/</span>
			<a href="/products/{product._id.toString()}" class="hover:text-[var(--color-primary)] transition-colors truncate max-w-[150px]">{product.name}</a>
			<span>/</span>
			<span class="text-[var(--color-text-secondary)]">Editar</span>
		</nav>
		<h1 class="text-xl font-heading font-bold text-[var(--color-text)]">Editar Producto</h1>
		<p class="text-sm text-[var(--color-text-muted)] mt-0.5">Actualiza los datos del producto</p>
	</div>

	<!-- Form -->
	<div class="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-card)] p-6">
		<ProductForm
			categories={data.categories}
			initialData={product}
			onSubmit={handleSubmit}
			onCancel={handleCancel}
			{isSubmitting}
			submitLabel="Guardar Cambios"
		/>
	</div>
</div>
