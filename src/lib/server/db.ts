import { MongoClient, type Db } from 'mongodb';

let client: MongoClient | null = null;
let db: Db | null = null;
const MONGODB_URI = process.env.MONGODB_URI || '';

export async function getDb(): Promise<Db> {
	if (db) return db;

	if (!MONGODB_URI) {
		throw new Error('MONGODB_URI no configurada');
	}

	client = new MongoClient(MONGODB_URI, {
		serverSelectionTimeoutMS: 5000,
		connectTimeoutMS: 5000
	});

	await client.connect();
	db = client.db('dalvin');

	// Crear índices necesarios
	await db.collection('users').createIndex({ email: 1 }, { unique: true });
	await db.collection('sessions').createIndex({ token: 1 }, { unique: true });
	await db.collection('sessions').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
	await db.collection('categories').createIndex({ name: 1 }, { unique: true });
	await db.collection('products').createIndex({ sku: 1 }, { unique: true, sparse: true });
	await db.collection('products').createIndex({ categoryId: 1 });
	await db.collection('products').createIndex({ name: 'text', sku: 'text' }, { default_language: 'spanish' });
	await db.collection('invoices').createIndex({ invoiceNumber: 1 }, { unique: true });
	await db.collection('invoices').createIndex({ cashierId: 1 });
	await db.collection('invoices').createIndex({ createdAt: -1 });

	return db;
}

export async function closeDb(): Promise<void> {
	if (client) {
		await client.close();
		client = null;
		db = null;
	}
}
