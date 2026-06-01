<script lang="ts">
	import { enhance } from '$app/forms';
	import { applyAction } from '$app/forms';

	let { form } = $props();

	let file: File | null = $state(null);
	let previewData: string[][] = $state([]);
	let previewHeaders: string[] = $state([]);
	let uploading = $state(false);
	let result = $state<{
		summary: { total: number; imported: number; skipped: number; errors: number };
		imported: string[];
		skipped: string[];
		errors: Array<{ row: number; reason: string }>;
	} | null>(null);
	let submitError = $state('');

	function handleFileChange(e: Event) {
		const input = e.target as HTMLInputElement;
		if (input.files && input.files[0]) {
			file = input.files[0];
			result = null;
			submitError = '';

			// Leer preview
			const reader = new FileReader();
			reader.onload = () => {
				const text = reader.result as string;
				const lines = text.split('\n').filter((l) => l.trim());
				if (lines.length > 0) {
					previewHeaders = lines[0].split(',').map((h) => h.trim());
					previewData = lines.slice(1, 6).map((line) =>
						line.split(',').map((v) => v.trim())
					);
				}
			};
			reader.readAsText(file);
		}
	}

	function downloadTemplate() {
		const headers = 'name,sku,description,category,purchasePrice,salePrice,stock,minStock';
		const sample = 'Arroz Integral 2kg,ALI-010,Arroz integral de grano largo,Alimentos,28.00,42.00,30,5';
		const csv = `${headers}\n${sample}\n`;
		const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
		const a = document.createElement('a');
		a.href = URL.createObjectURL(blob);
		a.download = 'plantilla_importar.csv';
		a.click();
		URL.revokeObjectURL(a.href);
	}

	function handleSubmit() {
		uploading = true;
		result = null;
		submitError = '';

		if (!file) {
			submitError = 'Selecciona un archivo CSV';
			uploading = false;
			return;
		}

		// Usar FormData manual para poder leer la respuesta
		const formData = new FormData();
		formData.append('file', file);

		fetch('/import?/upload', {
			method: 'POST',
			body: formData
		})
			.then(async (resp) => {
				const data = await resp.json();
				if (!resp.ok) {
					submitError = data.error || 'Error al importar';
					return;
				}
				result = data;
			})
			.catch((err) => {
				submitError = 'Error de conexión: ' + err.message;
			})
			.finally(() => {
				uploading = false;
			});
	}
</script>

<div class="space-y-6">
	<!-- Header -->
	<div>
		<h1 class="text-2xl font-heading font-semibold text-[var(--color-text)]">Importar Productos</h1>
		<p class="text-sm text-[var(--color-text-secondary)] mt-1">Carga masiva de productos desde archivo CSV</p>
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
		<!-- Formulario de importación -->
		<div class="lg:col-span-2 space-y-6">
			<!-- Upload area -->
			<div class="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-xl p-6">
				<form method="POST" action="?/upload" enctype="multipart/form-data" use:enhance>
					<div class="space-y-4">
						<div>
							<label for="file" class="block text-sm font-medium text-[var(--color-text)] mb-2">Archivo CSV</label>
							<div
								class="border-2 border-dashed border-[var(--color-border)] rounded-xl p-8 text-center
								       hover:border-[var(--color-primary-light)] transition-colors cursor-pointer"
								onclick={() => document.getElementById('file-input')?.click()}
								onkeydown={(e) => { if (e.key === 'Enter') document.getElementById('file-input')?.click(); }}
								role="button"
								tabindex="0"
								aria-label="Seleccionar archivo CSV"
							>
								<input
									id="file-input"
									name="file"
									type="file"
									accept=".csv"
									class="hidden"
									onchange={handleFileChange}
								/>
								{#if file}
									<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mx-auto mb-3"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
									<p class="text-sm font-medium text-[var(--color-text)]">{file.name}</p>
									<p class="text-xs text-[var(--color-text-muted)] mt-1">{(file.size / 1024).toFixed(1)} KB · Haz clic para cambiar</p>
								{:else}
									<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mx-auto mb-3"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
									<p class="text-sm text-[var(--color-text-muted)]">Arrastra un archivo CSV o haz clic para seleccionar</p>
									<p class="text-xs text-[var(--color-text-muted)] mt-1">Columnas: name, sku, description, category, purchasePrice, salePrice, stock, minStock</p>
								{/if}
							</div>
						</div>

						{#if submitError}
							<div class="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800" role="alert">
								<p class="text-sm text-[var(--color-error)]">{submitError}</p>
							</div>
						{/if}

						<button
							type="button"
							onclick={handleSubmit}
							disabled={!file || uploading}
							class="w-full px-4 py-2.5 bg-[var(--color-primary)] text-white font-medium rounded-lg hover:bg-[var(--color-primary-dark)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
						>
							{uploading ? 'Importando...' : 'Importar Productos'}
						</button>
					</div>
				</form>
			</div>

			<!-- Preview -->
			{#if previewHeaders.length > 0}
				<div class="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-xl overflow-hidden">
					<div class="px-5 py-4 border-b border-[var(--color-border)]">
						<h2 class="font-heading font-semibold text-[var(--color-text)]">Vista Previa</h2>
						<p class="text-xs text-[var(--color-text-muted)] mt-1">Primeras {previewData.length} filas de {file?.name}</p>
					</div>
					<div class="overflow-x-auto">
						<table class="w-full text-sm">
							<thead>
								<tr class="text-left text-[var(--color-text-muted)] text-xs uppercase tracking-wider">
									{#each previewHeaders as h}
										<th class="px-4 py-3 font-medium whitespace-nowrap">{h}</th>
									{/each}
								</tr>
							</thead>
							<tbody class="divide-y divide-[var(--color-border-light)]">
								{#each previewData as row}
									<tr class="hover:bg-[var(--color-surface-alt)]">
										{#each row as cell}
											<td class="px-4 py-2 text-[var(--color-text)] whitespace-nowrap max-w-40 truncate">{cell}</td>
										{/each}
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>
			{/if}

			<!-- Resultados -->
			{#if result}
				<div class="space-y-4">
					{#if result.errors.length > 0 || result.skipped.length > 0}
						<div class="bg-[var(--color-surface-card)] border border-amber-200 dark:border-amber-800 rounded-xl overflow-hidden">
							<div class="px-5 py-4 border-b border-amber-200 dark:border-amber-800">
								<h2 class="font-heading font-semibold text-amber-600 dark:text-amber-400">Resultado de Importación</h2>
							</div>
							<div class="p-5 space-y-3 text-sm">
								<div class="grid grid-cols-3 gap-4">
									<div class="text-center p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
										<p class="text-2xl font-bold text-green-600 dark:text-green-400">{result.summary.imported}</p>
										<p class="text-xs text-[var(--color-text-secondary)]">Importados</p>
									</div>
									<div class="text-center p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20">
										<p class="text-2xl font-bold text-amber-600 dark:text-amber-400">{result.summary.skipped}</p>
										<p class="text-xs text-[var(--color-text-secondary)]">Saltados (duplicados)</p>
									</div>
									<div class="text-center p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
										<p class="text-2xl font-bold text-red-600 dark:text-red-400">{result.summary.errors}</p>
										<p class="text-xs text-[var(--color-text-secondary)]">Errores</p>
									</div>
								</div>

								{#if result.skipped.length > 0}
									<div>
										<p class="font-medium text-[var(--color-text)] mb-1">Productos saltados (SKU duplicados):</p>
										<div class="flex flex-wrap gap-1">
											{#each result.skipped as sku}
												<span class="inline-flex px-2 py-0.5 rounded text-xs bg-[var(--color-surface-alt)] text-[var(--color-text-secondary)]">{sku}</span>
											{/each}
										</div>
									</div>
								{/if}

								{#if result.errors.length > 0}
									<div>
										<p class="font-medium text-[var(--color-text)] mb-1">Errores por fila:</p>
										<div class="max-h-40 overflow-y-auto space-y-1">
											{#each result.errors as err}
												<p class="text-xs text-[var(--color-error)]">Fila {err.row}: {err.reason}</p>
											{/each}
										</div>
									</div>
								{/if}
							</div>
						</div>
					{:else}
						<div class="bg-[var(--color-surface-card)] border border-green-200 dark:border-green-800 rounded-xl p-6 text-center">
							<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mx-auto mb-3"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
							<p class="text-lg font-semibold text-green-600 dark:text-green-400">¡Importación Exitosa!</p>
							<p class="text-sm text-[var(--color-text-secondary)] mt-1">{result.summary.imported} productos importados correctamente</p>
						</div>
					{/if}
				</div>
			{/if}
		</div>

		<!-- Sidebar: instrucciones -->
		<div class="space-y-4">
			<div class="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-xl p-5">
				<h3 class="font-heading font-semibold text-[var(--color-text)] mb-3">Instrucciones</h3>
				<ul class="space-y-2 text-sm text-[var(--color-text-secondary)]">
					<li class="flex gap-2">
						<span class="text-[var(--color-primary)] font-bold">1.</span>
						<span>Descarga la plantilla CSV</span>
					</li>
					<li class="flex gap-2">
						<span class="text-[var(--color-primary)] font-bold">2.</span>
						<span>Completa los datos de tus productos</span>
					</li>
					<li class="flex gap-2">
						<span class="text-[var(--color-primary)] font-bold">3.</span>
						<span>Guarda como CSV (UTF-8)</span>
					</li>
					<li class="flex gap-2">
						<span class="text-[var(--color-primary)] font-bold">4.</span>
						<span>Sube el archivo y presiona Importar</span>
					</li>
				</ul>
			</div>

			<div class="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-xl p-5">
				<h3 class="font-heading font-semibold text-[var(--color-text)] mb-3">Columnas</h3>
				<div class="space-y-2 text-sm">
					<div class="flex justify-between">
						<span class="text-[var(--color-text)] font-medium">name</span>
						<span class="text-[var(--color-text-muted)]">Requerido</span>
					</div>
					<div class="flex justify-between">
						<span class="text-[var(--color-text)] font-medium">sku</span>
						<span class="text-[var(--color-text-muted)]">Requerido (único)</span>
					</div>
					<div class="flex justify-between">
						<span class="text-[var(--color-text)] font-medium">purchasePrice</span>
						<span class="text-[var(--color-text-muted)]">Requerido</span>
					</div>
					<div class="flex justify-between">
						<span class="text-[var(--color-text)] font-medium">salePrice</span>
						<span class="text-[var(--color-text-muted)]">Requerido</span>
					</div>
					<div class="flex justify-between">
						<span class="text-[var(--color-text)] font-medium">stock</span>
						<span class="text-[var(--color-text-muted)]">Requerido</span>
					</div>
					<div class="flex justify-between">
						<span class="text-[var(--color-text)] font-medium">description</span>
						<span class="text-[var(--color-text-muted)]">Opcional</span>
					</div>
					<div class="flex justify-between">
						<span class="text-[var(--color-text)] font-medium">category</span>
						<span class="text-[var(--color-text-muted)]">Opcional</span>
					</div>
					<div class="flex justify-between">
						<span class="text-[var(--color-text)] font-medium">minStock</span>
						<span class="text-[var(--color-text-muted)]">Opcional</span>
					</div>
				</div>
			</div>

			<button
				onclick={downloadTemplate}
				class="w-full px-4 py-2.5 border border-[var(--color-border)] text-[var(--color-text)] font-medium rounded-lg hover:bg-[var(--color-surface-alt)] transition-all text-sm flex items-center justify-center gap-2"
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
				Descargar Plantilla CSV
			</button>
		</div>
	</div>
</div>
