import type { ObjectId } from 'mongodb';

export interface User {
	_id: ObjectId;
	name: string;
	email: string;
	passwordHash: string;
	role: 'admin' | 'cajero';
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export interface Session {
	_id: ObjectId;
	token: string;
	userId: string;
	expiresAt: Date;
	createdAt: Date;
}

export interface Category {
	_id: ObjectId;
	name: string;
	description: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface Product {
	_id: ObjectId;
	name: string;
	sku: string;
	description: string;
	categoryId: string;
	purchasePrice: number;
	salePrice: number;
	stock: number;
	minStock: number;
	isActive: boolean;
	createdBy: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface InvoiceItem {
	productId: string;
	productName: string;
	quantity: number;
	unitPrice: number;
	purchasePrice: number;
	subtotal: number;
	profit: number;
}

export interface Invoice {
	_id: ObjectId;
	invoiceNumber: number;
	items: InvoiceItem[];
	total: number;
	totalProfit: number;
	paymentMethod: 'cash' | 'card' | 'transfer';
	cashierId: string;
	cashierName: string;
	createdAt: Date;
}

export interface Counter {
	_id: string;
	seq: number;
}

export interface PaginatedResult<T> {
	items: T[];
	total: number;
	page: number;
	totalPages: number;
}

export interface AppUser {
	id: string;
	name: string;
	email: string;
	role: 'admin' | 'cajero';
}

export interface ProductFormData {
	name: string;
	sku: string;
	description: string;
	categoryId: string;
	purchasePrice: number;
	salePrice: number;
	stock: number;
	minStock: number;
}

export interface InvoiceFormItem {
	productId: string;
	productName: string;
	quantity: number;
	unitPrice: number;
	purchasePrice: number;
}

export interface InvoiceFormData {
	items: InvoiceFormItem[];
	paymentMethod: 'cash' | 'card' | 'transfer';
}
