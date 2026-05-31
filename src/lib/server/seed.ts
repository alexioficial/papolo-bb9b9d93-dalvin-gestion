import { getDb } from './db';
import { hashPassword } from './auth';
import { ObjectId } from 'mongodb';

export async function seed(): Promise<void> {
	const db = await getDb();

	// Verificar si ya hay datos
	const userCount = await db.collection('users').countDocuments();
	if (userCount > 0) {
		console.log('✅ Los datos ya existen, saltando seed');
		return;
	}

	console.log('🌱 Sembrando datos iniciales...');

	// Crear categorías
	const categories = [
		{ name: 'Alimentos', description: 'Productos alimenticios' },
		{ name: 'Bebidas', description: 'Bebidas y refrescos' },
		{ name: 'Limpieza', description: 'Productos de limpieza' },
		{ name: 'Electrónica', description: 'Dispositivos y accesorios' },
		{ name: 'Papelería', description: 'Útiles escolares y de oficina' }
	];

	const catResult = await db.collection('categories').insertMany(
		categories.map((c) => ({ ...c, createdAt: new Date(), updatedAt: new Date() }))
	);

	const catIds = Object.values(catResult.insertedIds);
	const catMap: Record<string, string> = {};
	categories.forEach((c, i) => {
		catMap[c.name] = catIds[i].toString();
	});

	// Crear usuarios
	const adminPassword = await hashPassword('admin123');
	const adminResult = await db.collection('users').insertOne({
		name: 'Admin Dalvin',
		email: 'admin@dalvin.com',
		passwordHash: adminPassword,
		role: 'admin',
		isActive: true,
		createdAt: new Date(),
		updatedAt: new Date()
	});
	const adminId = adminResult.insertedId.toString();

	const cajero1Password = await hashPassword('cajero123');
	const cajero1Result = await db.collection('users').insertOne({
		name: 'Carlos Ventas',
		email: 'carlos@dalvin.com',
		passwordHash: cajero1Password,
		role: 'cajero',
		isActive: true,
		createdAt: new Date(),
		updatedAt: new Date()
	});
	const cajero1Id = cajero1Result.insertedId.toString();

	const cajero2Password = await hashPassword('cajero123');
	await db.collection('users').insertOne({
		name: 'María López',
		email: 'maria@dalvin.com',
		passwordHash: cajero2Password,
		role: 'cajero',
		isActive: true,
		createdAt: new Date(),
		updatedAt: new Date()
	});

	// Crear productos
	const products = [
		{ name: 'Arroz Blanco 1kg', sku: 'ALI-001', description: 'Arroz blanco de grano largo, paquete 1kg', category: 'Alimentos', purchasePrice: 15.00, salePrice: 22.50, stock: 50, minStock: 10 },
		{ name: 'Frijoles Negros 900g', sku: 'ALI-002', description: 'Frijoles negros seleccionados, bolsa 900g', category: 'Alimentos', purchasePrice: 18.00, salePrice: 28.00, stock: 40, minStock: 8 },
		{ name: 'Aceite Vegetal 1L', sku: 'ALI-003', description: 'Aceite vegetal comestible, botella 1 litro', category: 'Alimentos', purchasePrice: 25.00, salePrice: 38.00, stock: 30, minStock: 5 },
		{ name: 'Azúcar Estándar 1kg', sku: 'ALI-004', description: 'Azúcar blanca estándar, bolsa 1kg', category: 'Alimentos', purchasePrice: 14.00, salePrice: 22.00, stock: 45, minStock: 10 },
		{ name: 'Agua Purificada 1.5L', sku: 'BEB-001', description: 'Agua purificada, botella 1.5 litros', category: 'Bebidas', purchasePrice: 8.00, salePrice: 14.00, stock: 100, minStock: 20 },
		{ name: 'Refresco de Cola 600ml', sku: 'BEB-002', description: 'Refresco sabor cola, botella 600ml', category: 'Bebidas', purchasePrice: 10.00, salePrice: 18.00, stock: 80, minStock: 15 },
		{ name: 'Jugo de Naranja 1L', sku: 'BEB-003', description: 'Jugo de naranja natural, envase 1 litro', category: 'Bebidas', purchasePrice: 16.00, salePrice: 26.00, stock: 25, minStock: 5 },
		{ name: 'Jabón Líquido para Trastes 500ml', sku: 'LIM-001', description: 'Jabón líquido lavavajillas, botella 500ml', category: 'Limpieza', purchasePrice: 12.00, salePrice: 20.00, stock: 35, minStock: 8 },
		{ name: 'Cloro 1L', sku: 'LIM-002', description: 'Cloro líquido desinfectante, botella 1 litro', category: 'Limpieza', purchasePrice: 9.00, salePrice: 16.00, stock: 40, minStock: 10 },
		{ name: 'Cargador USB-C', sku: 'ELE-001', description: 'Cargador rápido USB-C 20W con cable', category: 'Electrónica', purchasePrice: 45.00, salePrice: 79.00, stock: 15, minStock: 3 },
		{ name: 'Audífonos Bluetooth', sku: 'ELE-002', description: 'Audífonos inalámbricos Bluetooth 5.0', category: 'Electrónica', purchasePrice: 80.00, salePrice: 149.00, stock: 10, minStock: 2 },
		{ name: 'Cuaderno Profesional A4', sku: 'PAP-001', description: 'Cuaderno tamaño A4, 100 hojas, raya', category: 'Papelería', purchasePrice: 20.00, salePrice: 35.00, stock: 60, minStock: 15 },
		{ name: 'Bolígrafos Pack 10', sku: 'PAP-002', description: 'Paquete de 10 bolígrafos de tinta azul', category: 'Papelería', purchasePrice: 18.00, salePrice: 30.00, stock: 50, minStock: 10 },
		{ name: 'Harina de Trigo 1kg', sku: 'ALI-005', description: 'Harina de trigo todo uso, bolsa 1kg', category: 'Alimentos', purchasePrice: 12.00, salePrice: 19.00, stock: 35, minStock: 8 },
		{ name: 'Detergente en Polvo 800g', sku: 'LIM-003', description: 'Detergente en polvo para ropa, bolsa 800g', category: 'Limpieza', purchasePrice: 22.00, salePrice: 36.00, stock: 28, minStock: 5 }
	];

	const productDocs = products.map((p) => ({
		_id: new ObjectId(),
		name: p.name,
		sku: p.sku,
		description: p.description,
		categoryId: catMap[p.category],
		purchasePrice: p.purchasePrice,
		salePrice: p.salePrice,
		stock: p.stock,
		minStock: p.minStock,
		isActive: true,
		createdBy: adminId,
		createdAt: new Date(),
		updatedAt: new Date()
	}));

	await db.collection('products').insertMany(productDocs);

	// Inicializar contador de facturas
	await db.collection('counters').insertOne({
		_id: 'invoiceNumber',
		seq: 1000
	});

	// Crear algunas facturas demo
	const arroz = productDocs[0];
	const aceite = productDocs[2];
	const agua = productDocs[4];
	const jabon = productDocs[7];

	const demoInvoices = [
		{
			invoiceNumber: 1000,
			items: [
				{
					productId: arroz._id.toString(),
					productName: arroz.name,
					quantity: 3,
					unitPrice: arroz.salePrice,
					purchasePrice: arroz.purchasePrice,
					subtotal: 3 * arroz.salePrice,
					profit: 3 * (arroz.salePrice - arroz.purchasePrice)
				},
				{
					productId: aceite._id.toString(),
					productName: aceite.name,
					quantity: 2,
					unitPrice: aceite.salePrice,
					purchasePrice: aceite.purchasePrice,
					subtotal: 2 * aceite.salePrice,
					profit: 2 * (aceite.salePrice - aceite.purchasePrice)
				},
				{
					productId: agua._id.toString(),
					productName: agua.name,
					quantity: 6,
					unitPrice: agua.salePrice,
					purchasePrice: agua.purchasePrice,
					subtotal: 6 * agua.salePrice,
					profit: 6 * (agua.salePrice - agua.purchasePrice)
				}
			],
			total: 3 * arroz.salePrice + 2 * aceite.salePrice + 6 * agua.salePrice,
			totalProfit: 3 * (arroz.salePrice - arroz.purchasePrice) + 2 * (aceite.salePrice - aceite.purchasePrice) + 6 * (agua.salePrice - agua.purchasePrice),
			paymentMethod: 'cash',
			cashierId: cajero1Id,
			cashierName: 'Carlos Ventas',
			createdAt: new Date('2025-01-15T10:30:00')
		},
		{
			invoiceNumber: 1001,
			items: [
				{
					productId: jabon._id.toString(),
					productName: jabon.name,
					quantity: 5,
					unitPrice: jabon.salePrice,
					purchasePrice: jabon.purchasePrice,
					subtotal: 5 * jabon.salePrice,
					profit: 5 * (jabon.salePrice - jabon.purchasePrice)
				},
				{
					productId: arroz._id.toString(),
					productName: arroz.name,
					quantity: 2,
					unitPrice: arroz.salePrice,
					purchasePrice: arroz.purchasePrice,
					subtotal: 2 * arroz.salePrice,
					profit: 2 * (arroz.salePrice - arroz.purchasePrice)
				}
			],
			total: 5 * jabon.salePrice + 2 * arroz.salePrice,
			totalProfit: 5 * (jabon.salePrice - jabon.purchasePrice) + 2 * (arroz.salePrice - arroz.purchasePrice),
			paymentMethod: 'card',
			cashierId: cajero1Id,
			cashierName: 'Carlos Ventas',
			createdAt: new Date('2025-01-15T14:00:00')
		}
	];

	await db.collection('invoices').insertMany(demoInvoices);

	// Actualizar contador
	await db.collection('counters').updateOne(
		{ _id: 'invoiceNumber' },
		{ $set: { seq: 1002 } }
	);

	console.log('✅ Seed completado:');
	console.log(`   - ${categories.length} categorías`);
	console.log(`   - 3 usuarios (admin@dalvin.com / admin123, carlos@dalvin.com / cajero123, maria@dalvin.com / cajero123)`);
	console.log(`   - ${products.length} productos`);
	console.log(`   - ${demoInvoices.length} facturas demo`);
}
