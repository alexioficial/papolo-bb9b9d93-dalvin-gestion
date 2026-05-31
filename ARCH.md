# ARCH.md — Sistema de Gestión de Almacén y Facturación (Dalvin)

## Resumen Ejecutivo

Sistema full-stack de gestión de inventario y facturación con roles (admin/cajero), CRUD de productos, facturación con cálculo de ganancia, reportes detallados, exportación/importación CSV, y modo oscuro/claro. Stack: SvelteKit 5 + MongoDB + Tailwind 4. Un solo deploy con adapter-node.

## Stack Tecnológico

| Capa | Tecnología | Justificación |
|------|-----------|---------------|
| Frontend/Backend | SvelteKit 5 + adapter-node | SSR, server routes, form actions, TypeScript — un solo deploy |
| Estilos | Tailwind 4 + CSS variables | Temas oscuro/claro con variables CSS, diseño consistente |
| DB | MongoDB (cluster compartido) | Documental, flexible, índices TTL para sesiones |
| Auth | bcryptjs + crypto.randomUUID() + cookies HTTP-only | Sin dependencias externas de auth, control total |
| Deploy | Coolify + Dockerfile | Determinístico, single app puerto 3000 |

## Modelo de Datos

### `users`
```ts
{
  _id: ObjectId,
  name: string,
  email: string,           // unique index
  passwordHash: string,
  role: "admin" | "cajero",
  isActive: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### `sessions`
```ts
{
  _id: ObjectId,
  token: string,           // unique index
  userId: ObjectId,
  expiresAt: Date,         // TTL index (expireAfterSeconds: 0)
  createdAt: Date
}
```

### `categories`
```ts
{
  _id: ObjectId,
  name: string,            // unique index — ej: "Alimentos", "Bebidas"
  description: string,
  createdAt: Date,
  updatedAt: Date
}
```

### `products`
```ts
{
  _id: ObjectId,
  name: string,
  sku: string,             // unique index
  description: string,     // mini descripción
  categoryId: ObjectId,
  purchasePrice: number,   // precio compra (para ganancia)
  salePrice: number,       // precio venta
  stock: number,           // entero >= 0
  minStock: number,
  isActive: boolean,
  createdBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```
Índices: `{ name: "text", sku: "text" }` (text), `{ categoryId: 1 }`, `{ sku: 1 }` unique

### `invoices`
```ts
{
  _id: ObjectId,
  invoiceNumber: number,   // auto-incremental via counters
  items: [{
    productId: ObjectId,
    productName: string,   // snapshot
    quantity: number,
    unitPrice: number,     // snapshot salePrice
    purchasePrice: number,  // snapshot
    subtotal: number,      // qty * unitPrice
    profit: number         // (unitPrice - purchasePrice) * qty
  }],
  total: number,
  totalProfit: number,
  paymentMethod: "cash" | "card" | "transfer",
  cashierId: ObjectId,
  cashierName: string,     // snapshot
  createdAt: Date
}
```
Índices: `{ invoiceNumber: 1 }` unique, `{ cashierId: 1 }`, `{ createdAt: -1 }`

### `counters`
```ts
{ _id: "invoiceNumber", seq: number }
```

## Autenticación y Roles

- **Estrategia**: bcryptjs hash + crypto.randomUUID() session token + cookie HTTP-only
- **hooks.server.ts**: handle lee cookie, busca session en DB, setea `locals.user`
- **Protección**: cada `+page.server.ts` verifica rol antes de cargar datos o ejecutar actions
- **Roles**:
  - `admin`: CRUD productos, ver todas las facturas, reportes, exportación, importación
  - `cajero`: ver almacén (read-only), crear facturas, ver sus propias facturas

## Rutas / Server Routes

| Ruta | Método | Acceso | Descripción |
|------|--------|--------|-------------|
| `/login` | GET/POST | Público | Login form + action |
| `/logout` | GET | Autenticado | Destroy session |
| `/dashboard` | GET | Autenticado | Resumen según rol |
| `/products` | GET | Admin+Cajero | Lista productos (admin: CRUD, cajero: vista) |
| `/products/new` | GET/POST | Admin | Crear producto |
| `/products/[id]` | GET | Admin+Cajero | Detalle producto |
| `/products/[id]/edit` | GET/POST | Admin | Editar producto |
| `/products/[id]/delete` | POST | Admin | Borrar producto |
| `/invoices` | GET | Admin+Cajero | Lista facturas (admin: todas, cajero: propias) |
| `/invoices/new` | GET/POST | Admin+Cajero | Crear factura |
| `/invoices/[id]` | GET | Admin+Cajero | Detalle/ticket factura |
| `/reports` | GET | Admin | Reportes con filtros y agregaciones |
| `/import` | GET/POST | Admin | Importar productos CSV |
| `/api/products/search.json` | GET | Autenticado | Búsqueda AJAX productos |
| `/api/products/export.csv` | GET | Admin | Exportar productos CSV |
| `/api/invoices/export.csv` | GET | Admin | Exportar facturas CSV |

## Flujo de Datos (Facturación — crítica)

1. Cajero busca productos via endpoint AJAX `/api/products/search.json?q=...`
2. Agrega items al carrito (client-side)
3. Submit → form action en `/invoices/new/+page.server.ts`
4. Server valida: stock suficiente para cada item (transacción atómica)
5. Calcula subtotales y ganancias
6. Descuenta stock: `findOneAndUpdate({ _id, stock: { $gte: qty } }, { $inc: { stock: -qty } })`
7. Si falla descuento → error "Stock insuficiente"
8. Genera invoiceNumber via counters collection
9. Inserta invoice con snapshots de nombres y precios
10. Responde con redirect al detalle de la factura

## Decisiones y Tradeoffs

| Decisión | Elegido | Tradeoff |
|----------|---------|----------|
| DB driver | mongodb nativo (sin Mongoose) | Más control en queries, menos magic, más boilerplate en validación |
| Auto-increment | Colección `counters` con `findOneAndUpdate` | Funciona sin replica set, pero no es transaccional 100% |
| Snapshots en factura | Guardar nombre/precio/purchasePrice | La factura no se afecta por cambios posteriores en productos |
| Descuento stock | Atómico con condición | Maneja concurrencia, pero no hay rollback automático si algo falla post-descuento |
| CSS | Tailwind 4 + variables CSS para theming | Liviano, control total, pero más código que un UI library |
| Export | CSV puro (sin librerías) | Universal, sin dependencias, pero menos features que Excel |

## Riesgos y Mitigaciones

1. **Concurrencia en facturación** (ALTO): `findOneAndUpdate` con filtro de stock suficiente es atómico. Mitiga race conditions.
2. **TTL index no creado**: seed script crea el índice `{ expiresAt: 1 }` con `expireAfterSeconds: 0`.
3. **Text search sin índice**: seed crea text index en products. Fallback a `$regex` si falla.
4. **FOUC modo oscuro**: inline script en `<head>` de app.html para aplicar clase `dark` antes de render.
5. **CSV injection**: escapar caracteres `=+-@` al inicio de celdas CSV.

## Plan de Implementación

1. **Scaffold proyecto**: SvelteKit + Tailwind 4 + dependencias + Dockerfile
2. **DB connection**: conexión lazy + índices iniciales
3. **Auth system**: bcryptjs, sessions, cookies, hooks, login/logout
4. **Seed data**: admin, cajeros, categorías, productos demo
5. **UI base**: layout, sidebar, theme toggle, componentes comunes, app.css
6. **Productos module**: CRUD + filtros + búsqueda + vistas (admin/cajero)
7. **Facturación module**: crear factura con búsqueda AJAX, cálculo ganancia, descuento stock
8. **Reportes module**: agregaciones MongoDB, filtros por fecha/cajero
9. **Export/Import**: CSV export products + invoices, CSV import products
10. **Polish**: estados vacíos, errores, 404, responsive, accesibilidad
