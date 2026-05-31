export function formatCurrency(amount: number): string {
	return new Intl.NumberFormat('es-MX', {
		style: 'currency',
		currency: 'MXN',
		minimumFractionDigits: 2
	}).format(amount);
}

export function formatDate(date: Date | string): string {
	if (typeof date === 'string') date = new Date(date);
	return new Intl.DateTimeFormat('es-MX', {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit'
	}).format(date);
}

export function formatDateShort(date: Date | string): string {
	if (typeof date === 'string') date = new Date(date);
	return new Intl.DateTimeFormat('es-MX', {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit'
	}).format(date);
}

export function formatStock(stock: number): string {
	if (stock <= 0) return 'Sin stock';
	if (stock <= 5) return `Stock bajo (${stock})`;
	return stock.toString();
}
