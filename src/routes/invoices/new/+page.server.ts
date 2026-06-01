import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { requireAuth } from '$lib/server/auth';
import { getDb } from '$lib/server/db';
import { ObjectId } from 'mongodb';
import type { InvoiceItem } from '$lib/types';

export const load: PageServerLoad = async ({ locals }) => {
	const user = requireAuth(locals);
	return { user };
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const user = requireAuth(locals);
		const db = await getDb();

		const formData = await request.formData();

		// Parsear items del form
		const itemsRaw = formData.get('items');
		const paymentMethod = formData.get('paymentMethod') as string;

		// Validar método de pago
		if (!paymentMethod || !['cash', 'card', 'transfer'].includes(paymentMethod)) {
			return { error: 'Selecciona un método de pago válido' };
		}

		// Parsear items JSON
		let items: Array<{
			productId: string;
			productName: string;
			quantity: number;
			unitPrice: number;
			purchasePrice: number;
		}>;

		try {
			items = JSON.parse(itemsRaw as string);
		} catch {
			return { error: 'Error al procesar los productos' };
		}

		// Validar items
		if (!items || items.length === 0) {
			return { error: 'Agrega al menos un producto a la factura' };
		}

		// Validar cada item
		for (const item of items) {
			if (!item.productId || !item.productName) {
				return { error: 'Producto inválido' };
			}
			if (!item.quantity || item.quantity < 1 || !Number.isInteger(item.quantity)) {
				return { error: `Cantidad inválida para "${item.productName}"` };
			}
			if (item.unitPrice < 0) {
				return { error: `Precio inválido para "${item.productName}"` };
			}
		}

		// Array para items de factura con cálculos
		const invoiceItems: InvoiceItem[] = [];
		let total = 0;
		let totalProfit = 0;

		for (const item of items) {
			try {
				const productId = new ObjectId(item.productId);

				// Descuento atómico de stock con findOneAndUpdate
				// Condición: producto existe, está activo, stock >= cantidad solicitada
				const result = await db.collection('products').findOneAndUpdate(
					{
						_id: productId,
						isActive: true,
						stock: { $gte: item.quantity }
					},
					{
						$inc: { stock: -item.quantity },
						$set: { updatedAt: new Date() }
					},
					{
						returnDocument: 'after',
						projection: {
							name: 1,
							salePrice: 1,
							purchasePrice: 1,
							stock: 1
						}
					}
				);

				if (!result) {
					// Producto no encontrado, inactivo, o stock insuficiente
					const productExists = await db.collection('products').findOne(
						{ _id: productId, isActive: true },
						{ projection: { name: 1, stock: 1 } }
					);

					if (!productExists) {
						return { error: `Producto "${item.productName}" no encontrado o inactivo` };
					}

					return {
						error: `Stock insuficiente para "${productExists.name}". Disponible: ${productExists.stock}, solicitado: ${item.quantity}`
					};
				}

				// Usar los precios reales del producto (snapshot de seguridad)
				const unitPrice = result.salePrice;
				const purchasePrice = result.purchasePrice;
				const subtotal = unitPrice * item.quantity;
				const profit = (unitPrice - purchasePrice) * item.quantity;

				invoiceItems.push({
					productId: item.productId,
					productName: result.name,
					quantity: item.quantity,
					unitPrice,
					purchasePrice,
					subtotal,
					profit
				});

				total += subtotal;
				totalProfit += profit;
			} catch (err) {
				const msg = err instanceof Error ? err.message : 'Error desconocido';
				return { error: `Error al procesar "${item.productName}": ${msg}` };
			}
		}

		// Generar número de factura (incremento atómico)
		// Usar any para la colección counters cuyo _id es string, no ObjectId
		const countersCol = db.collection('counters') as any;
		const counterResult = await countersCol.findOneAndUpdate(
			{ _id: 'invoiceNumber' },
			{ $inc: { seq: 1 } },
			{ returnDocument: 'after', upsert: true }
		);

		const invoiceNumber = counterResult?.seq || 1;

		// Crear factura
		const invoiceDoc = {
			invoiceNumber,
			items: invoiceItems,
			total,
			totalProfit,
			paymentMethod,
			cashierId: user.id,
			cashierName: user.name,
			createdAt: new Date()
		};

		const insertResult = await db.collection('invoices').insertOne(invoiceDoc);

		// Redirigir al detalle de la factura creada
		throw redirect(303, `/invoices/${insertResult.insertedId}`);
	}
};
