export function validateEmail(email: string): string | null {
	if (!email || email.trim().length === 0) return 'El email es requerido';
	const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!re.test(email)) return 'Email inválido';
	return null;
}

export function validatePassword(password: string): string | null {
	if (!password || password.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
	return null;
}

export function validateProduct(data: {
	name: string;
	sku: string;
	purchasePrice: number;
	salePrice: number;
	stock: number;
}): Record<string, string> {
	const errors: Record<string, string> = {};

	if (!data.name || data.name.trim().length === 0) {
		errors.name = 'El nombre es requerido';
	}

	if (!data.sku || data.sku.trim().length === 0) {
		errors.sku = 'El SKU es requerido';
	}

	if (data.purchasePrice < 0) {
		errors.purchasePrice = 'El precio de compra no puede ser negativo';
	}

	if (data.salePrice <= 0) {
		errors.salePrice = 'El precio de venta debe ser mayor a 0';
	}

	if (data.purchasePrice >= data.salePrice) {
		errors.salePrice = 'El precio de venta debe ser mayor al precio de compra';
	}

	if (!Number.isInteger(data.stock) || data.stock < 0) {
		errors.stock = 'El stock debe ser un entero >= 0';
	}

	return errors;
}

export function validateInvoice(items: { productId: string; quantity: number }[]): Record<string, string> {
	const errors: Record<string, string> = {};

	if (!items || items.length === 0) {
		errors.items = 'Debe agregar al menos un producto';
	}

	for (let i = 0; i < (items?.length || 0); i++) {
		if (!items[i].productId) {
			errors[`items.${i}.productId`] = 'Producto inválido';
		}
		if (!Number.isInteger(items[i].quantity) || items[i].quantity <= 0) {
			errors[`items.${i}.quantity`] = 'Cantidad inválida';
		}
	}

	return errors;
}

export function validateCSVRow(row: Record<string, string>, index: number): { errors: string[]; data?: Record<string, unknown> } {
	const errs: string[] = [];

	if (!row.name || row.name.trim() === '') errs.push('nombre requerido');
	if (!row.sku || row.sku.trim() === '') errs.push('SKU requerido');

	const purchasePrice = parseFloat(row.purchasePrice);
	if (isNaN(purchasePrice) || purchasePrice < 0) errs.push('precio de compra inválido');

	const salePrice = parseFloat(row.salePrice);
	if (isNaN(salePrice) || salePrice <= 0) errs.push('precio de venta inválido');

	const stock = parseInt(row.stock);
	if (isNaN(stock) || stock < 0) errs.push('stock inválido');

	if (errs.length > 0) return { errors: errs };

	return {
		errors: [],
		data: {
			name: row.name.trim(),
			sku: row.sku.trim(),
			description: (row.description || '').trim(),
			categoryName: (row.category || '').trim(),
			purchasePrice,
			salePrice,
			stock
		}
	};
}
