# DESIGN.md — Sistema de Diseño

## Design Read

> **Dashboard empresarial de gestión** para dueños de negocio y cajeros — vibe **clean/profesional/minimal** — sistema: **empresarial-moderno**

## 1. Tema Visual y Atmósfera

Diseño empresarial minimalista con enfoque en legibilidad y eficiencia. Paleta fría profesional (azul marino + blanco) con acento azul. Modo claro para oficina, modo oscuro para cierre de caja nocturna. Tarjetas sutiles, sombras suaves, tipografía limpia. Sin decoración innecesaria — cada elemento tiene propósito funcional.

## 2. Paleta de Colores

```css
:root {
  /* Modo Claro */
  --color-primary: oklch(0.45 0.15 260);       /* Azul profundo #1e40af */
  --color-primary-light: oklch(0.55 0.12 260); /* Azul medio #3b82f6 */
  --color-primary-dark: oklch(0.35 0.15 260);  /* Azul oscuro #1e3a8a */
  
  --color-surface: oklch(0.97 0.005 260);      /* #f1f5f9 */
  --color-surface-alt: oklch(0.95 0.005 260);  /* #e2e8f0 */
  --color-surface-card: oklch(1 0 0);          /* #ffffff */
  
  --color-text: oklch(0.15 0.01 260);          /* #1e293b */
  --color-text-secondary: oklch(0.45 0.01 260);/* #64748b */
  --color-text-muted: oklch(0.6 0.01 260);     /* #94a3b8 */
  
  --color-border: oklch(0.88 0.005 260);       /* #e2e8f0 */
  --color-border-light: oklch(0.93 0.005 260); /* #f1f5f9 */
  
  --color-error: oklch(0.55 0.2 25);           /* #dc2626 */
  --color-success: oklch(0.55 0.15 145);       /* #16a34a */
  --color-warning: oklch(0.65 0.15 85);        /* #d97706 */
  
  --color-sidebar: oklch(0.2 0.02 260);        /* #0f172a */
  --color-sidebar-text: oklch(0.85 0.01 260);  /* #cbd5e1 */
  --color-sidebar-active: oklch(0.45 0.15 260);/* #1e40af */
}

:root.dark {
  --color-primary: oklch(0.6 0.15 260);        /* #3b82f6 más brillante */
  --color-primary-light: oklch(0.7 0.12 260);  /* #60a5fa */
  --color-primary-dark: oklch(0.5 0.15 260);   /* #2563eb */
  
  --color-surface: oklch(0.12 0.02 260);       /* #0f172a */
  --color-surface-alt: oklch(0.15 0.02 260);   /* #1e293b */
  --color-surface-card: oklch(0.17 0.02 260);  /* #1e293b */
  
  --color-text: oklch(0.92 0.01 260);          /* #f1f5f9 */
  --color-text-secondary: oklch(0.65 0.01 260);/* #94a3b8 */
  --color-text-muted: oklch(0.45 0.01 260);    /* #64748b */
  
  --color-border: oklch(0.25 0.02 260);        /* #334155 */
  --color-border-light: oklch(0.2 0.02 260);   /* #1e293b */
  
  --color-error: oklch(0.6 0.2 25);            /* #ef4444 */
  --color-success: oklch(0.6 0.15 145);        /* #22c55e */
  --color-warning: oklch(0.7 0.15 85);         /* #f59e0b */
  
  --color-sidebar: oklch(0.08 0.02 260);       /* #020617 */
  --color-sidebar-text: oklch(0.75 0.01 260);  /* #94a3b8 */
  --color-sidebar-active: oklch(0.5 0.15 260); /* #2563eb */
}
```

## 3. Tipografía

- **Headings**: `'Plus Jakarta Sans', sans-serif` — pesos 600-700, sans-serif moderna con personalidad
- **Body**: `'DM Sans', sans-serif` — peso 400, legible en pantalla
- **Monospace**: `'JetBrains Mono', monospace` — para códigos SKU y números de factura

Jerarquía:
```
h1: 2rem/2.5rem (32px/40px) — weight 700 — solo una por página
h2: 1.5rem (24px) — weight 600
h3: 1.25rem (20px) — weight 600
h4: 1.125rem (18px) — weight 600
body: 1rem (16px) — weight 400
small: 0.875rem (14px)
caption: 0.75rem (12px)
```

Google Fonts: `Plus Jakarta Sans:wght@400;500;600;700&DM+Sans:wght@400;500&JetBrains+Mono:wght@400;600`

## 4. Componentes Base

### Botones
```css
.btn-primary: bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg font-medium
  hover: bg-[var(--color-primary-dark)]
  active: scale-[0.98]
  disabled: opacity-50 cursor-not-allowed
  transition: all 150ms

.btn-secondary: border border-[var(--color-border)] bg-white dark:bg-[var(--color-surface-card)]
  hover: bg-gray-50 dark:hover:bg-[var(--color-surface-alt)]
  
.btn-ghost: bg-transparent text-[var(--color-text-secondary)]
  hover: bg-[var(--color-surface-alt)]
  
.btn-danger: bg-[var(--color-error)] text-white
  hover: opacity-90
  
.btn-sm: px-3 py-1.5 text-sm rounded-md
.btn-lg: px-6 py-3 text-lg rounded-xl
```

### Cards
```
Card: bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-xl
  shadow-sm hover:shadow-md transition-shadow 200ms
  padding: p-6

Card-header: flex items-center justify-between mb-4
Card-body: space-y-4
Card-footer: border-t border-[var(--color-border)] pt-4 mt-4
```

### Inputs
```
Input: w-full px-3 py-2 border border-[var(--color-border)] rounded-lg
  bg-[var(--color-surface-card)] text-[var(--color-text)]
  placeholder: text-[var(--color-text-muted)]
  focus: ring-2 ring-[var(--color-primary-light)] border-transparent outline-none
  error: border-[var(--color-error)]
  disabled: opacity-50 bg-gray-50
```

### Tables
```
Table: w-full border-collapse
  thead: bg-[var(--color-surface-alt)] text-[var(--color-text-secondary)] text-sm uppercase tracking-wider
  th: px-4 py-3 text-left font-medium
  td: px-4 py-3 border-b border-[var(--color-border-light)]
  tr:hover: bg-[var(--color-surface-alt)]/50
```

### Badges
```
Badge-success: bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-0.5 rounded-full text-xs font-medium
Badge-warning: bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400
Badge-error: bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400
Badge-info: bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400
```

## 5. Layout

```
Sidebar: fixed left-0 top-0 h-screen w-64 bg-[var(--color-sidebar)] z-40
  transition-transform 200ms
  Mobile: hidden translate-x-[-100%] → open: translate-x-0

Main content: ml-64 (desktop), ml-0 (mobile)
  min-h-screen bg-[var(--color-surface)]

Header: sticky top-0 z-30 bg-[var(--color-surface-card)]/80 backdrop-blur-sm
  border-b border-[var(--color-border)]

Container: max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
```

### Breakpoints
- Mobile: < 768px — sidebar overlay, contenido full-width
- Tablet: 768-1024px — sidebar reducido (iconos)
- Desktop: > 1024px — sidebar completo

## 6. Elevación y Sombras

```css
shadow-xs: 0 1px 2px rgba(0,0,0,0.05)
shadow-sm: 0 1px 3px rgba(0,0,0,0.08)
shadow-md: 0 4px 6px rgba(0,0,0,0.07)
shadow-lg: 0 10px 15px rgba(0,0,0,0.08)
shadow-xl: 0 20px 25px rgba(0,0,0,0.1)

/* Dark mode sombras más sutiles */
.dark shadow-*: sombra con alpha reducido
```

## 7. Animación e Interacción

- **Transiciones**: `transition-all duration-150 ease-out` en botones e inputs
- **Page transitions**: Svelte `transition:fade={{ duration: 150 }}` y `transition:slide`
- **Sidebar**: `transition:slide` para apertura/cierre mobile
- **Hover cards**: `transform: translateY(-2px)` + shadow-md → shadow-lg
- **Loading skeleton**: shimmer animation con gradient
- **Reduced motion**: respetar `prefers-reduced-motion: reduce` — desactivar animaciones

## 8. Do's y Don'ts

**Do's:**
- Usar la paleta de colores definida — no hex aleatorios
- Botón primario uno por sección (la CTA principal)
- Inputs con label visible, nunca placeholder como label
- Tablas con header sticky y scroll horizontal en mobile
- Estados de carga con skeleton/spinner
- Confirmación antes de acciones destructivas
- Responsive: sidebar overlay en mobile
- Badges para estados (stock bajo, activo/inactivo)

**Don'ts:**
- NO usar gradients purple-pink
- NO usar Inter o Roboto (usar Plus Jakarta Sans + DM Sans)
- NO em-dash (`—`) en textos visibles
- NO tarjetas de 3 columnas iguales con icono+texto
- NO términos "Elevate", "Seamless", "Revolutionary"
- NO logos de marcas ficticias
- NO placeholder de imágenes con divs de color
- NO `outline: none` sin alternativa de focus visible

## 9. Responsive

- **Mobile (<768px)**: sidebar como overlay con backdrop, tablas pasan a cards o scroll horizontal, botones full-width en forms
- **Tablet (768-1024px)**: sidebar con solo iconos y tooltips
- **Desktop (>1024px)**: sidebar completo con texto, layouts de 2-3 columnas para grids

## 10. Dashboard Layout

```
┌──────────────────────────────────────────────┐
│ Header: Logo | Título página | Usuario | 🌙 │
├──────────┬───────────────────────────────────┤
│ Sidebar  │ Breadcrumb                        │
│          │ ┌───────────────────────────────┐ │
│ 📊 Dash  │ │ Cards de resumen (stats)      │ │
│ 📦 Prod  │ │ ┌─────┐ ┌─────┐ ┌─────┐     │ │
│ 🧾 Fact  │ │ │     │ │     │ │     │     │ │
│ 📈 Rep    │ │ └─────┘ └─────┘ └─────┘     │ │
│ 📥 Import │ │                               │ │
│           │ │ Tabla con datos              │ │
│           │ │ ┌─────────────────────────┐  │ │
│ User:     │ │ │                         │  │ │
│ Admin     │ │ └─────────────────────────┘  │ │
│           │ │ Paginación                   │ │
└──────────┴───────────────────────────────────┘
```
