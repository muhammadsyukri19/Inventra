# Design Document — INVENTRA: Sistem Manajemen Inventaris Lengkap

## Overview

INVENTRA adalah sistem manajemen inventaris web fullstack yang terdiri dari:

- **Backend**: Express.js + TypeScript + Prisma ORM + PostgreSQL, berjalan di port 5000
- **Frontend**: Next.js 14 App Router + TypeScript Strict + Tailwind CSS + React Query + Zustand

Arsitektur mengikuti pola **modular monolith** di backend dan **feature-based architecture** di frontend. Seluruh komunikasi frontend-backend melalui REST API JSON dengan format response yang seragam.

---

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT BROWSER                          │
│                                                                  │
│  Next.js 14 App Router (React Server Components + Client)       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Zustand Store│  │ React Query  │  │ Axios API Client     │  │
│  │ (auth, ui)   │  │ (server state│  │ (interceptor + retry)│  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS REST JSON
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EXPRESS.JS BACKEND :5000                      │
│                                                                  │
│  Global Middleware Stack                                         │
│  requestLogger → bodyParser → cors → routes → errorHandler      │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │               ROUTE MODULES /api/v1/*                      │ │
│  │  auth │ users │ categories │ suppliers │ products          │ │
│  │  inventories │ transactions │ stock-movements              │ │
│  │  analytics │ recommendations │ notifications │ dashboard   │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌──────────────┐  ┌─────────────────┐  ┌──────────────────┐   │
│  │ Prisma ORM   │  │ Winston Logger  │  │ node-cron Jobs   │   │
│  └──────┬───────┘  └─────────────────┘  └──────────────────┘   │
└─────────┼───────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────┐
│   PostgreSQL    │
│   Database      │
└─────────────────┘
```

### Data Flow per Request

```
Browser
  → Axios (inject Bearer token)
    → Express Router
      → authMiddleware (verify JWT)
        → rbacMiddleware (check role)
          → validationMiddleware (Zod schema)
            → Controller (parse req, call service)
              → Service (business logic, Prisma)
                → PostgreSQL
              ← Service (return typed data)
            ← Controller (sendSuccess / sendError)
          ← standardized JSON response
        ← HTTP 200/4xx/5xx
      ← Axios response
    ← React Query cache update
  ← Component re-render
```

---

## Components and Interfaces

### Backend Module Structure

Setiap modul backend mengikuti struktur file yang seragam:

```
server/src/modules/{module}/
├── {module}.controller.ts   # req/res handling, no business logic
├── {module}.service.ts      # business logic, Prisma calls
├── {module}.routes.ts       # Express Router + middleware registration
├── {module}.schema.ts       # Zod validation schemas
└── {module}.types.ts        # TypeScript interfaces & types
```

### Frontend Feature Structure

Setiap domain bisnis di frontend mengikuti struktur:

```
src/features/{feature}/
├── components/              # Feature-specific components (smart/container)
│   └── {ComponentName}/
│       ├── {ComponentName}.tsx
│       ├── {ComponentName}.types.ts
│       └── index.ts
├── hooks/                   # useQuery / useMutation hooks
│   └── use{Feature}.ts
├── services/                # API call functions (memanggil apiClient)
│   └── {feature}.service.ts
└── types/                   # TypeScript types untuk feature ini
    └── {feature}.types.ts
```

### Shared Components (Atomic Design)

#### Atoms — Sudah Ada

| Komponen | Lokasi | Keterangan |
|----------|--------|------------|
| `Button` | `components/atoms/button/` | variant: primary/secondary/outline/ghost/danger |
| `Input` | `components/atoms/input/` | controlled, dengan error state |
| `Badge` | `components/atoms/badge/` | variant: success/warning/danger/default |
| `Avatar` | `components/atoms/avatar/` | fallback inisial |
| `Skeleton` | `components/atoms/skeleton/` | loading placeholder |
| `Spinner` | `components/atoms/spinner/` | loading indicator |
| `Typography` | `components/atoms/typography/` | h1-h6, p, caption |
| `Card` | `components/atoms/card/` | container dasar |
| `Label` | `components/atoms/label/` | form label |

#### Atoms — Perlu Ditambahkan

| Komponen | Keterangan |
|----------|------------|
| `Tooltip` | Hover info untuk icon buttons |
| `Select` | Native select atau custom dropdown |
| `Textarea` | Multi-line input |

#### Molecules — Sudah Ada

| Komponen | Lokasi | Keterangan |
|----------|--------|------------|
| `FormField` | `components/molecules/form-field/` | label + input + error |
| `SearchBar` | `components/molecules/search-bar/` | debounced search |
| `DataTable` | `components/molecules/data-table/` | sorting + pagination |
| `Pagination` | `components/molecules/pagination/` | page navigation |
| `Modal` | `components/molecules/modal/` | overlay dialog |
| `ConfirmDialog` | `components/molecules/confirm-dialog/` | destructive confirm |
| `EmptyState` | `components/molecules/empty-state/` | empty list state |
| `StatCard` | `components/molecules/stat-card/` | KPI card |
| `SelectField` | `components/molecules/select-field/` | FormField + Select |
| `AlertCard` | `components/molecules/alert-card/` | info/warning banner |

#### Molecules — Perlu Ditambahkan

| Komponen | Keterangan |
|----------|------------|
| `StockBadge` | Badge khusus status stok (Aman/Rendah/Habis) |
| `ProductCard` | Card ringkasan produk untuk list |

#### Organisms — Sudah Ada

| Komponen | Keterangan |
|----------|------------|
| `Header` | Navbar dengan notifikasi bell + user avatar |
| `Sidebar` | Nav links dengan role-based visibility |
| `SmartScanner` | Camera scanner (html5-qrcode) |
| `RecommendationsPanel` | Panel rekomendasi restock |

### Zustand Stores

#### `useAuthStore` — `src/features/auth/stores/auth.store.ts` (sudah ada)

```typescript
interface AuthState {
  user: User | null;            // { id, email, name, role }
  accessToken: string | null;   // disimpan di localStorage via persist
  refreshToken: string | null;
  isAuthenticated: boolean;
}

interface AuthActions {
  setAuth(user, accessToken, refreshToken): void;
  setTokens(accessToken, refreshToken): void;
  clearAuth(): void;
}
```

> **Catatan keamanan**: Requirement 2.4 menyatakan access token TIDAK boleh di cookie yang bisa diakses JS. Implementasi saat ini menyimpan di localStorage via Zustand persist — ini acceptable karena tidak di cookie, tapi perlu didokumentasikan. Refresh token idealnya di `httpOnly` cookie; namun karena backend belum mengimplementasi ini, token pair disimpan di localStorage untuk MVP.

#### `useUIStore` — `src/stores/ui.store.ts` (sudah ada)

```typescript
interface UIState {
  sidebarOpen: boolean;
  toggleSidebar(): void;
  setSidebarOpen(open: boolean): void;
}
```

#### `useNotificationStore` — `src/features/notification/stores/` (baru)

```typescript
interface NotificationState {
  unreadCount: number;
  setUnreadCount(count: number): void;
  decrementUnread(): void;
  resetUnread(): void;
}
```

### Constants

#### `API_ENDPOINTS` — `src/constants/api-endpoints.ts` (sudah ada, perlu ditambah)

Endpoint yang perlu ditambahkan:

```typescript
// Tambahan yang belum ada:
ANALYTICS_STOCK_HEALTH: `${BASE_URL}/analytics/stock-health`,
ANALYTICS_SALES: `${BASE_URL}/analytics/sales`,
DASHBOARD_SALES_CHART: `${BASE_URL}/dashboard/sales-chart`,
REPORTS_INVENTORY: `${BASE_URL}/reports/inventory`,
REPORTS_TRANSACTIONS: `${BASE_URL}/reports/transactions`,
PRODUCTS_SCAN: `${BASE_URL}/products/scan`,
INVENTORY_SETTINGS: (productId: string) => `${BASE_URL}/inventories/${productId}/settings`,
USER_APPROVE: (id: string) => `${BASE_URL}/users/${id}/approve`,
USER_REJECT: (id: string) => `${BASE_URL}/users/${id}/reject`,
USER_DEACTIVATE: (id: string) => `${BASE_URL}/users/${id}/deactivate`,
```

#### `ROUTES` — `src/constants/routes.ts` (sudah ada, perlu ditambah)

```typescript
// Tambahan:
REGISTER: '/register',
PRODUCT_EDIT: (id: string) => `/products/${id}/edit`,
TRANSACTION_CREATE: '/transactions/create',
```

#### `QUERY_KEYS` — `src/constants/query-keys.ts` (baru, perlu dibuat)

```typescript
export const QUERY_KEYS = {
  AUTH_ME: ['auth', 'me'] as const,
  USERS: (params?: object) => ['users', params] as const,
  PRODUCTS: (params?: object) => ['products', params] as const,
  PRODUCT_DETAIL: (id: string) => ['products', id] as const,
  CATEGORIES: (params?: object) => ['categories', params] as const,
  SUPPLIERS: (params?: object) => ['suppliers', params] as const,
  INVENTORIES: (params?: object) => ['inventories', params] as const,
  INVENTORY_DETAIL: (productId: string) => ['inventories', productId] as const,
  TRANSACTIONS: (params?: object) => ['transactions', params] as const,
  TRANSACTION_DETAIL: (id: string) => ['transactions', id] as const,
  STOCK_MOVEMENTS: (params?: object) => ['stock-movements', params] as const,
  ANALYTICS_SALES: (params?: object) => ['analytics', 'sales', params] as const,
  ANALYTICS_TOP_PRODUCTS: (params?: object) => ['analytics', 'top-products', params] as const,
  ANALYTICS_STOCK_HEALTH: ['analytics', 'stock-health'] as const,
  RECOMMENDATIONS: (params?: object) => ['recommendations', params] as const,
  NOTIFICATIONS: (params?: object) => ['notifications', params] as const,
  NOTIFICATIONS_UNREAD: ['notifications', 'unread-count'] as const,
  DASHBOARD_SUMMARY: ['dashboard', 'summary'] as const,
  DASHBOARD_SALES_CHART: (params?: object) => ['dashboard', 'sales-chart', params] as const,
} as const;
```

---

## Data Models

### Database Schema Changes

Hanya satu perubahan pada `schema.prisma` yang diperlukan:

**Tambahkan field `rackLocation` ke model `Product`:**

```prisma
model Product {
  id           String   @id @default(uuid())
  sku          String   @unique
  name         String
  description  String?
  price        Decimal  @db.Decimal(12, 2)
  costPrice    Decimal  @map("cost_price") @db.Decimal(12, 2)
  categoryId   String   @map("category_id")
  supplierId   String?  @map("supplier_id")
  unit         String   @default("pcs")
  imageUrl     String?  @map("image_url")
  rackLocation String?  @map("rack_location") @db.VarChar(50)  // ← TAMBAHAN
  isActive     Boolean  @default(true) @map("is_active")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")
  // ... relasi tidak berubah
}
```

Migration command:
```bash
cd server && npx prisma migrate dev --name add_rack_location_to_product
```

### Standard API Response Types

```typescript
// src/types/api.types.ts — sudah ada, referensi
interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
  meta?: PaginationMeta;
}

interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;  // untuk validation errors
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
```

---

## Backend API Design

### Auth Module — `/api/v1/auth`

| Method | Path | Auth | Role | Deskripsi |
|--------|------|------|------|-----------|
| POST | `/register` | ❌ | - | Registrasi, status PENDING |
| POST | `/login` | ❌ | - | Login, return token pair |
| POST | `/refresh` | ❌ | - | Rotate token pair |
| POST | `/logout` | ✅ | any | Invalidate refresh token |
| GET | `/me` | ✅ | any | Get current user profile |
| PATCH | `/change-password` | ✅ | any | Ganti password, invalidate tokens |

### Users Module — `/api/v1/users`

| Method | Path | Auth | Role | Deskripsi |
|--------|------|------|------|-----------|
| GET | `/` | ✅ | admin | List users, pagination + filter status |
| POST | `/` | ✅ | admin | Buat user langsung ACTIVE |
| GET | `/:id` | ✅ | admin | Detail user |
| PATCH | `/:id/approve` | ✅ | admin | PENDING → ACTIVE |
| PATCH | `/:id/reject` | ✅ | admin | PENDING → REJECTED (wajib reason) |
| PATCH | `/:id/deactivate` | ✅ | admin | ACTIVE → INACTIVE |
| PATCH | `/:id/role` | ✅ | admin | Ubah role user |

### Categories Module — `/api/v1/categories`

| Method | Path | Auth | Role | Deskripsi |
|--------|------|------|------|-----------|
| GET | `/` | ✅ | any | List categories |
| POST | `/` | ✅ | admin, staff_gudang | Buat kategori |
| PUT | `/:id` | ✅ | admin, staff_gudang | Update kategori |
| DELETE | `/:id` | ✅ | admin | Hapus (cek produk aktif dulu) |

### Suppliers Module — `/api/v1/suppliers`

| Method | Path | Auth | Role | Deskripsi |
|--------|------|------|------|-----------|
| GET | `/` | ✅ | any | List suppliers |
| POST | `/` | ✅ | admin, staff_gudang | Buat supplier |
| PUT | `/:id` | ✅ | admin, staff_gudang | Update supplier |
| PATCH | `/:id/toggle-active` | ✅ | admin | Aktif/nonaktif supplier |
| DELETE | `/:id` | ✅ | admin | Hapus (cek produk terkait) |

### Products Module — `/api/v1/products`

| Method | Path | Auth | Role | Deskripsi |
|--------|------|------|------|-----------|
| GET | `/` | ✅ | any | List products, filter: categoryId, supplierId, isActive, stockStatus |
| POST | `/` | ✅ | admin, staff_gudang | Buat produk + inventory otomatis |
| GET | `/scan` | ✅ | any | Cari produk by SKU/barcode: `?code=` |
| GET | `/:id` | ✅ | any | Detail produk |
| PUT | `/:id` | ✅ | admin, staff_gudang | Update produk |
| PATCH | `/:id/toggle-active` | ✅ | admin | Aktif/nonaktif produk |

### Inventories Module — `/api/v1/inventories`

| Method | Path | Auth | Role | Deskripsi |
|--------|------|------|------|-----------|
| GET | `/` | ✅ | any | List inventories, filter: stockStatus (low/out/safe) |
| GET | `/:productId` | ✅ | any | Detail inventory satu produk |
| PATCH | `/:productId/settings` | ✅ | admin, staff_gudang | Update min/max/ROP/leadTime |
| POST | `/:productId/adjust` | ✅ | admin, staff_gudang | Manual stock adjustment |

### Transactions Module — `/api/v1/transactions`

| Method | Path | Auth | Role | Deskripsi |
|--------|------|------|------|-----------|
| GET | `/` | ✅ | any | List transactions, filter: type, dateRange, search code |
| POST | `/` | ✅ | admin, staff_gudang | Buat transaksi IN/OUT (atomic) |
| GET | `/:id` | ✅ | any | Detail transaksi + items |

### Stock Movements Module — `/api/v1/stock-movements`

| Method | Path | Auth | Role | Deskripsi |
|--------|------|------|------|-----------|
| GET | `/` | ✅ | any | List movements, filter: productId, type, dateRange |

### Analytics Module — `/api/v1/analytics` (baru)

| Method | Path | Auth | Role | Deskripsi |
|--------|------|------|------|-----------|
| GET | `/sales` | ✅ | admin, owner | Aggregated sales per period |
| GET | `/top-products` | ✅ | admin, owner | Top N produk by volume/revenue |
| GET | `/stock-health` | ✅ | any | Distribusi status stok + estimasi hari stockout |

Query params `/sales`: `period=daily|weekly|monthly&from=YYYY-MM-DD&to=YYYY-MM-DD&categoryId=`
Query params `/top-products`: `limit=5&from=YYYY-MM-DD&to=YYYY-MM-DD&by=quantity|revenue`

### Recommendations Module — `/api/v1/recommendations`

| Method | Path | Auth | Role | Deskripsi |
|--------|------|------|------|-----------|
| GET | `/` | ✅ | admin, owner | List rekomendasi, filter: status, priority |
| POST | `/generate` | ✅ | admin | Trigger manual generation |
| PATCH | `/:id/status` | ✅ | admin | Update status: APPROVED/REJECTED/COMPLETED |

### Notifications Module — `/api/v1/notifications` (baru)

| Method | Path | Auth | Role | Deskripsi |
|--------|------|------|------|-----------|
| GET | `/` | ✅ | any | List notifikasi milik current user |
| GET | `/unread-count` | ✅ | any | Jumlah notifikasi belum dibaca |
| PATCH | `/:id/read` | ✅ | any | Tandai satu sebagai dibaca |
| PATCH | `/read-all` | ✅ | any | Tandai semua sebagai dibaca |

### Dashboard Module — `/api/v1/dashboard` (baru)

| Method | Path | Auth | Role | Deskripsi |
|--------|------|------|------|-----------|
| GET | `/summary` | ✅ | any | Summary data sesuai role |
| GET | `/sales-chart` | ✅ | admin, owner | Data chart penjualan |
| GET | `/stock-alerts` | ✅ | admin, staff_gudang | Produk stok rendah/habis |

### Reports Module — `/api/v1/reports` (baru)

| Method | Path | Auth | Role | Deskripsi |
|--------|------|------|------|-----------|
| GET | `/inventory` | ✅ | admin, owner | Export snapshot inventori (JSON/CSV) |
| GET | `/transactions` | ✅ | admin, owner | Export riwayat transaksi (JSON/CSV) |

---

## Bug Fix Designs

### Bug #1 — `product.service.ts`: `prisma.inventory.fields.reorderPoint` tidak valid

**Lokasi**: `server/src/modules/product/product.service.ts`, method `findAll()`, baris 50-54

**Masalah**: `prisma.inventory.fields.reorderPoint` bukan nilai integer; ini adalah referensi metadata field Prisma yang tidak bisa digunakan dalam klausa `where`. Penggunaannya di `{ lte: prisma.inventory.fields.reorderPoint }` akan menghasilkan runtime error atau query yang salah karena TypeScript tidak akan menangkap ini secara langsung.

**Solusi**: Ganti dengan Prisma raw query menggunakan `$queryRaw` atau gunakan filter berbeda. Cara paling bersih adalah filter di level SQL lewat `$queryRaw` untuk low/safe, dan tetap pakai Prisma biasa untuk `out`:

```typescript
// SEBELUM (buggy):
} else if (stockStatus === 'low') {
  where.inventory = { currentStock: { gt: 0, lte: prisma.inventory.fields.reorderPoint } };
} else if (stockStatus === 'safe') {
  where.inventory = { currentStock: { gt: prisma.inventory.fields.reorderPoint } };
}

// SESUDAH (fixed) — gunakan prisma.$queryRaw untuk perbandingan dua kolom:
async findAll(params: { ... stockStatus?: 'low' | 'out' | 'safe' }) {
  // Untuk stockStatus 'low' dan 'safe', kita perlu subquery karena
  // Prisma tidak mendukung WHERE col1 <= col2 di relasi nested secara langsung.
  // Strategi: ambil product IDs yang memenuhi kriteria lebih dulu via $queryRaw,
  // lalu gunakan where: { id: { in: filteredIds } }

  if (stockStatus === 'out') {
    where.inventory = { currentStock: 0 };
  } else if (stockStatus === 'low') {
    const lowStockIds = await prisma.$queryRaw<{ product_id: string }[]>`
      SELECT product_id FROM inventories
      WHERE current_stock > 0 AND current_stock <= reorder_point
    `;
    where.id = { in: lowStockIds.map(r => r.product_id) };
  } else if (stockStatus === 'safe') {
    const safeIds = await prisma.$queryRaw<{ product_id: string }[]>`
      SELECT product_id FROM inventories
      WHERE current_stock > reorder_point
    `;
    where.id = { in: safeIds.map(r => r.product_id) };
  }
}
```

### Bug #2 — `inventory.service.ts`: filter `stockStatus: 'low'` tidak diimplementasi

**Lokasi**: `server/src/modules/inventory/inventory.service.ts`, method `findAll()`, baris 30-37

**Masalah**: Blok `else if (stockStatus === 'low')` tidak melakukan apapun — ada komentar "let frontend filter" yang merupakan bug desain. Akibatnya query mengembalikan semua inventori tanpa filter saat `stockStatus: 'low'` dikirim.

**Solusi**: Implementasi filter dengan `$queryRaw` untuk perbandingan dua kolom, sama seperti Bug #1:

```typescript
// SEBELUM (buggy):
} else if (stockStatus === 'low') {
  // komentar "let frontend filter" — tidak ada implementasi
}

// SESUDAH (fixed):
if (stockStatus === 'out') {
  where.currentStock = 0;
} else if (stockStatus === 'low') {
  // WHERE current_stock > 0 AND current_stock <= reorder_point
  const lowStockProductIds = await prisma.$queryRaw<{ product_id: string }[]>`
    SELECT product_id FROM inventories
    WHERE current_stock > 0 AND current_stock <= reorder_point
  `;
  where.productId = { in: lowStockProductIds.map(r => r.product_id) };
} else if (stockStatus === 'safe') {
  const safeProductIds = await prisma.$queryRaw<{ product_id: string }[]>`
    SELECT product_id FROM inventories
    WHERE current_stock > reorder_point
  `;
  where.productId = { in: safeProductIds.map(r => r.product_id) };
}
```

### Bug #3 — `recommendation.service.ts`: `upsert` dengan `id: 'new-record'`

**Lokasi**: `server/src/modules/recommendation/recommendation.service.ts`, method `generateRecommendations()`, baris 82-97

**Masalah**: Kode saat ini:
```typescript
await prisma.restockRecommendation.upsert({
  where: {
    id: await this.getPendingRecommendationId(product.id) || 'new-record',
  },
  // ...
});
```

Jika `getPendingRecommendationId` mengembalikan `undefined`, upsert akan mencari `id: 'new-record'` yang tidak ada di database — Prisma akan mencoba INSERT dengan `id: 'new-record'` sebagai primary key. Ini melanggar UUID constraint dan menyebabkan runtime error. Bahkan jika tidak error, akan membuat record dengan ID dummy yang korup.

**Solusi**: Pisahkan logika menjadi explicit `findFirst` + `update` atau `create`:

```typescript
// SESUDAH (fixed):
const existingPending = await prisma.restockRecommendation.findFirst({
  where: {
    productId: product.id,
    status: RecommendationStatus.PENDING,
  },
});

if (existingPending) {
  // Update record PENDING yang sudah ada
  await prisma.restockRecommendation.update({
    where: { id: existingPending.id },
    data: {
      currentStock: inventory.currentStock,
      reorderPoint,
      safetyStock,
      averageDailySales,
      recommendedQuantity,
      leadTimeDays,
      priority,
    },
  });
} else {
  // Buat rekomendasi baru hanya jika belum ada yang PENDING
  await prisma.restockRecommendation.create({
    data: {
      productId: product.id,
      currentStock: inventory.currentStock,
      reorderPoint,
      safetyStock,
      averageDailySales,
      recommendedQuantity,
      leadTimeDays,
      priority,
      status: RecommendationStatus.PENDING,
    },
  });
}
```

Hapus method `getPendingRecommendationId` karena tidak lagi diperlukan.

### Bug #4 — `prediction.cron.ts`: jadwal cron salah timezone

**Lokasi**: `server/src/jobs/prediction.cron.ts`, baris 8

**Masalah**: Cron `'0 0 * * *'` berarti 00:00 UTC = 07:00 WIB. Requirement menyebut 02:00 WIB. 02:00 WIB = 02:00 - 7 jam = 19:00 UTC hari sebelumnya.

**Solusi**: Ganti cron expression DAN gunakan opsi timezone dari `node-cron`:

```typescript
// SEBELUM:
cron.schedule('0 0 * * *', async () => { ... });

// SESUDAH (opsi A — cron string UTC):
cron.schedule('0 19 * * *', async () => { ... });
// 19:00 UTC = 02:00 WIB (UTC+7)

// SESUDAH (opsi B — lebih eksplisit, recommended):
cron.schedule('0 2 * * *', async () => { ... }, {
  timezone: 'Asia/Jakarta',
});
```

Gunakan **Opsi B** karena lebih readable dan tidak ambigu jika server timezone berubah.

### Bug #5 — `seed.ts`: hardcoded ID `'supplier-1'`, `'supplier-2'`

**Lokasi**: `server/prisma/seed.ts`, baris 82-108

**Masalah**: `upsert({ where: { id: 'supplier-1' } })` memaksa ID menjadi string non-UUID. Ini bertentangan dengan schema yang menggunakan `@default(uuid())` dan akan menyebabkan inkonsistensi data jika ada foreign key check atau UUID validation di aplikasi.

**Solusi**: Hapus supplier dari seed script (supplier tidak diperlukan sebagai data minimal). Jika sample data diperlukan untuk development, gunakan `upsert` berdasarkan field unik yang bermakna, bukan ID:

```typescript
// HAPUS: seluruh blok "CREATE SAMPLE SUPPLIERS" dari seed.ts
// Seed hanya berisi: Roles (3) + Admin User (1) + Sample Categories (5)
// Supplier dibuat secara manual via UI atau script fixture terpisah

// Jika benar-benar diperlukan sample supplier, gunakan name sebagai where:
// Namun Supplier tidak memiliki @unique constraint pada name,
// maka tidak bisa di-upsert berdasarkan name.
// Opsi: tambahkan @unique pada supplier.name, atau skip dari seed.
```

**Rekomendasi**: Hapus supplier dari seed. Data supplier diinput melalui UI setelah aplikasi berjalan.

### Bug #6 — `schema.prisma`: Product belum punya `rackLocation`

**Solusi**: Sudah dijelaskan di bagian Data Models. Tambahkan field:

```prisma
rackLocation String? @map("rack_location") @db.VarChar(50)
```

Jalankan migration: `npx prisma migrate dev --name add_rack_location_to_product`

---

## Frontend Architecture

### Halaman dan Feature Mapping

| Route | Page Component | Feature Module | Role |
|-------|---------------|---------------|------|
| `/` | `app/page.tsx` | - | public |
| `/login` | `app/(auth)/login/page.tsx` | `features/auth` | public |
| `/register` | `app/(auth)/register/page.tsx` | `features/auth` | public |
| `/dashboard` | `app/(dashboard)/dashboard/page.tsx` | `features/dashboard` | all |
| `/products` | `app/(dashboard)/products/page.tsx` | `features/product` | all |
| `/products/create` | `app/(dashboard)/products/create/page.tsx` | `features/product` | admin, staff |
| `/products/:id` | `app/(dashboard)/products/[id]/page.tsx` | `features/product` | all |
| `/categories` | `app/(dashboard)/categories/page.tsx` | `features/category` | all |
| `/suppliers` | `app/(dashboard)/suppliers/page.tsx` | `features/supplier` | all |
| `/inventory` | `app/(dashboard)/inventory/page.tsx` | `features/inventory` | all |
| `/transactions` | `app/(dashboard)/transactions/page.tsx` | `features/transaction` | admin, staff |
| `/transactions/create` | `app/(dashboard)/transactions/create/page.tsx` | `features/transaction` | admin, staff |
| `/analytics` | `app/(dashboard)/analytics/page.tsx` | `features/analytics` | admin, owner |
| `/recommendations` | `app/(dashboard)/recommendations/page.tsx` | `features/analytics` | admin, owner |
| `/notifications` | `app/(dashboard)/notifications/page.tsx` | `features/notification` | all |
| `/users` | `app/(dashboard)/users/page.tsx` | `features/user` | admin |

### Feature: Auth

```
src/features/auth/
├── components/
│   ├── login-form/
│   │   └── LoginForm.tsx          # RHF + Zod, calls useLogin hook
│   └── register-form/
│       └── RegisterForm.tsx       # RHF + Zod, field: name, email, username, password, roleId
├── hooks/
│   └── useAuth.ts                 # useLogin, useRegister, useLogout mutations
├── services/
│   └── auth.service.ts            # loginUser, registerUser, logoutUser, getCurrentUser (sudah ada)
├── stores/
│   └── auth.store.ts              # Zustand store (sudah ada)
└── types/
    └── auth.types.ts              # LoginPayload, RegisterPayload, AuthUser
```

### Feature: Dashboard

```
src/features/dashboard/
├── components/
│   ├── AdminDashboard/
│   │   └── AdminDashboard.tsx     # stat cards + pending users + chart
│   ├── StaffDashboard/
│   │   └── StaffDashboard.tsx     # quick actions + low stock list
│   ├── OwnerDashboard/
│   │   └── OwnerDashboard.tsx     # KPI cards + charts + recommendations
│   └── SalesChart/
│       └── SalesChart.tsx         # Recharts LineChart wrapper
├── hooks/
│   └── useDashboard.ts            # useQuery(DASHBOARD_SUMMARY), useQuery(DASHBOARD_SALES_CHART)
├── services/
│   └── dashboard.service.ts       # getDashboardSummary, getSalesChart
└── types/
    └── dashboard.types.ts         # AdminSummary, StaffSummary, OwnerSummary
```

### Feature: Product

```
src/features/product/
├── components/
│   ├── ProductList/
│   │   └── ProductList.tsx        # DataTable + filter bar
│   ├── ProductForm/
│   │   └── ProductForm.tsx        # Create/edit form, RHF + Zod
│   ├── ProductDetail/
│   │   └── ProductDetail.tsx      # Detail view + stock chart + transactions
│   └── ProductFilters/
│       └── ProductFilters.tsx     # category/supplier/stockStatus filter UI
├── hooks/
│   └── useProducts.ts             # useProducts, useProduct, useCreateProduct, useUpdateProduct
├── services/
│   └── product.service.ts         # getProducts, getProductById, createProduct, updateProduct
└── types/
    └── product.types.ts           # Product, CreateProductPayload, UpdateProductPayload
```

### Feature: Inventory

```
src/features/inventory/
├── components/
│   ├── InventoryList/
│   │   └── InventoryList.tsx      # DataTable + summary cards
│   ├── AdjustStockModal/
│   │   └── AdjustStockModal.tsx   # Modal form adjustment
│   └── InventorySettings/
│       └── InventorySettings.tsx  # Form edit min/max/ROP
├── hooks/
│   └── useInventory.ts            # useInventories, useInventory, useAdjustStock, useInventorySettings
├── services/
│   └── inventory.service.ts       # getInventories, adjustStock, updateSettings
└── types/
    └── inventory.types.ts         # Inventory, AdjustStockPayload, InventorySettings
```

### Feature: Transaction

```
src/features/transaction/
├── components/
│   ├── TransactionList/
│   │   └── TransactionList.tsx    # DataTable dua tab (IN/OUT)
│   ├── TransactionForm/
│   │   └── TransactionForm.tsx    # Multi-item form dengan smart scanner
│   ├── TransactionItemRow/
│   │   └── TransactionItemRow.tsx # Satu baris item: product autocomplete + qty + price
│   └── TransactionDetail/
│       └── TransactionDetail.tsx  # Detail view lengkap
├── hooks/
│   └── useTransactions.ts         # useTransactions, useTransaction, useCreateTransaction
├── services/
│   └── transaction.service.ts     # getTransactions, getTransactionById, createTransaction
└── types/
    └── transaction.types.ts       # Transaction, TransactionItem, CreateTransactionPayload
```

### Feature: Analytics

```
src/features/analytics/
├── components/
│   ├── SalesAnalyticsChart/
│   │   └── SalesAnalyticsChart.tsx  # Recharts: tren penjualan
│   ├── TopProductsChart/
│   │   └── TopProductsChart.tsx     # Recharts: bar chart top products
│   ├── StockHealthChart/
│   │   └── StockHealthChart.tsx     # Recharts: pie chart distribusi stok
│   └── RecommendationTable/
│       └── RecommendationTable.tsx  # Tabel rekomendasi + action buttons
├── hooks/
│   └── useAnalytics.ts              # useSalesAnalytics, useTopProducts, useStockHealth, useRecommendations
├── services/
│   └── analytics.service.ts         # getSales, getTopProducts, getStockHealth, getRecommendations
└── types/
    └── analytics.types.ts           # SalesData, TopProduct, StockHealth, Recommendation
```

### Feature: Notification

```
src/features/notification/
├── components/
│   ├── NotificationDropdown/
│   │   └── NotificationDropdown.tsx  # 5 notif terbaru + link lihat semua
│   └── NotificationList/
│       └── NotificationList.tsx      # Halaman lengkap dengan filter
├── hooks/
│   └── useNotifications.ts           # useNotifications, useUnreadCount, useMarkRead
├── services/
│   └── notification.service.ts       # getNotifications, getUnreadCount, markRead, markAllRead
├── stores/
│   └── notification.store.ts         # unreadCount Zustand store
└── types/
    └── notification.types.ts         # Notification, NotificationType
```

---

## Authentication & RBAC Flow

### Login Flow

```
LoginForm (RHF + Zod)
  → onSubmit: useLogin mutation
    → auth.service.loginUser(identifier, password)
      → POST /api/v1/auth/login
        ← { user, accessToken, refreshToken }
      → useAuthStore.setAuth(user, accessToken, refreshToken)
      → router.push(ROUTES.DASHBOARD)
```

### Silent Token Refresh Flow (sudah terimplementasi di `api-client.ts`)

```
apiClient.interceptors.response (on 401)
  → check: bukan endpoint auth, bukan retry
  → if isRefreshing: queue request
  → else:
    → POST /api/v1/auth/refresh { refreshToken }
      ← { accessToken, refreshToken }
    → useAuthStore.setTokens(newAccess, newRefresh)
    → processQueue(null, newAccessToken)
    → retry original request
  → if refresh fails:
    → useAuthStore.clearAuth()
    → window.location.href = '/login'
```

### RBAC di Frontend

Route protection menggunakan middleware Next.js (`middleware.ts`) + layout check:

```typescript
// src/middleware.ts
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth-storage'); // atau dari header
  
  if (!token && !PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.redirect(new URL(ROUTES.LOGIN, request.url));
  }
  return NextResponse.next();
}
```

Di layout `(dashboard)`, komponen `DashboardLayout` memeriksa role dari `useAuthStore` dan menyembunyikan nav item yang tidak relevan. Akses ke halaman terlarang di-redirect ke dashboard.

### RBAC di Backend

```typescript
// server/src/middleware/rbac.middleware.ts (pattern yang sudah ada)
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError(`Akses ditolak untuk role ${req.user.role}`);
    }
    next();
  };
}

// Penggunaan di routes:
router.get('/', authMiddleware, requireRole('admin'), userController.list);
router.patch('/:id/approve', authMiddleware, requireRole('admin'), userController.approve);
```

---

## Component Architecture

### Dashboard Page — Component Tree

```
DashboardPage (app/(dashboard)/dashboard/page.tsx)
└── DashboardTemplate (templates — orchestrator)
    ├── AdminDashboard | StaffDashboard | OwnerDashboard
    │   (dipilih berdasarkan useAuthStore().user.role)
    │
    ├── AdminDashboard
    │   ├── StatCard × 4 (pending users, total products, inventory value, notifications)
    │   ├── SalesChart (Recharts LineChart, data dari useDashboard)
    │   ├── DataTable (5 pending users, link ke /users)
    │   └── NotificationPanel (5 notif terbaru)
    │
    ├── StaffDashboard
    │   ├── QuickActions (Button: Transaksi Masuk, Transaksi Keluar, Scan Produk)
    │   ├── AlertCard × N (produk stok rendah/habis)
    │   ├── StatCard × 2 (transaksi hari ini IN, OUT)
    │   └── NotificationPanel
    │
    └── OwnerDashboard
        ├── StatCard × 4 (total aset, estimasi jual, gross profit, total SKU)
        ├── SalesChart (tren 30 hari)
        ├── TopProductsChart (bar chart)
        └── RecommendationsPanel (top 3 CRITICAL/HIGH)
```

### Transaction Form — Component Tree

```
TransactionCreatePage (app/(dashboard)/transactions/create/page.tsx)
└── TransactionForm (features/transaction/components/TransactionForm/)
    ├── Select (type: IN / OUT)
    ├── Input (notes, opsional)
    │
    ├── TransactionItemRow × N (dynamic list)
    │   ├── ProductSearchInput (autocomplete: GET /products?search=)
    │   │   └── Dropdown list hasil pencarian
    │   ├── Input (qty — controlled, validasi vs currentStock jika OUT)
    │   ├── Input (unitPrice — pre-filled dari produk, editable)
    │   ├── Typography (subtotal = qty × unitPrice, read-only)
    │   └── Button (hapus item, icon trash)
    │
    ├── Button (Tambah Item)
    ├── Button (Scan Produk → opens SmartScanner modal)
    │
    ├── Typography (Grand Total, computed)
    └── Button (Buat Transaksi, submit → useCreateTransaction mutation)
```

### Product List — Component Tree

```
ProductsPage (app/(dashboard)/products/page.tsx)
└── ProductList (features/product/components/ProductList/)
    ├── SearchBar (debounced, 300ms)
    ├── ProductFilters
    │   ├── SelectField (Kategori)
    │   ├── SelectField (Supplier)
    │   ├── SelectField (Status: Aktif/Nonaktif)
    │   └── SelectField (Status Stok: Semua/Aman/Rendah/Habis)
    │
    ├── DataTable
    │   ├── columns: [Image, SKU, Nama, Kategori, Stok, StockBadge, Lokasi Rak, Harga Jual, Aksi]
    │   └── rows × N (dari useProducts query)
    │
    ├── Pagination
    └── Button (Tambah Produk — visible untuk admin dan staff_gudang)
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Semua ID Entitas adalah UUID v4

*For any* entitas yang dibuat oleh sistem (User, Product, Category, Supplier, Inventory, Transaction, StockMovement, Notification), field `id`-nya harus cocok dengan format UUID v4 (`/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i`).

**Validates: Requirements 1.2**

---

### Property 2: Format Response API Konsisten

*For any* request yang berhasil ke endpoint API manapun, response body harus memiliki shape `{ success: true, data: T }`. *For any* request yang gagal (4xx/5xx), response body harus memiliki shape `{ success: false, message: string }`.

**Validates: Requirements 1.4**

---

### Property 3: Filter `stockStatus: 'low'` Benar (Product)

*For any* produk yang ada di database, jika produk tersebut memiliki `0 < currentStock <= reorderPoint`, maka kueri `GET /api/v1/products?stockStatus=low` harus menyertakan produk tersebut dalam results. Sebaliknya, produk dengan `currentStock = 0` atau `currentStock > reorderPoint` tidak boleh muncul dalam results `stockStatus=low`.

**Validates: Requirements 5.3**

---

### Property 4: Filter `stockStatus: 'low'` Benar (Inventory)

*For any* inventory record yang dikembalikan oleh `GET /api/v1/inventories?stockStatus=low`, `currentStock`-nya harus memenuhi `0 < currentStock <= reorderPoint`. Tidak ada record yang lolos filter ini boleh memiliki `currentStock = 0` atau `currentStock > reorderPoint`.

**Validates: Requirements 6.2**

---

### Property 5: Rekomendasi Restock Idempoten (Upsert PENDING)

*For any* produk aktif dengan stok di bawah reorder point, menjalankan `generateRecommendations()` dua kali atau lebih harus menghasilkan tepat satu record `RestockRecommendation` dengan `status: PENDING` untuk produk tersebut — bukan N duplikat. Jika sudah ada record PENDING, harus di-update, bukan ditambah baru.

**Validates: Requirements 10.1**

---

### Property 6: Atomisitas Transaksi — Total Amount dan Stock Movement

*For any* transaksi yang berhasil dibuat dengan N item, harus berlaku secara bersamaan:
- `totalAmount = Σ (item.quantity × item.unitPrice)` untuk semua item
- Untuk setiap item, tepat satu `StockMovement` harus dibuat
- `currentStock` di `Inventory` harus berubah sesuai: bertambah untuk IN, berkurang untuk OUT

Tidak boleh ada state di mana totalAmount sudah tersimpan tapi StockMovement belum dibuat, atau sebaliknya.

**Validates: Requirements 7.4**

---

### Property 7: Validasi Stok Tidak Cukup pada Transaksi OUT

*For any* transaksi bertipe `OUT` di mana kuantitas salah satu item melebihi `currentStock` produk tersebut, sistem harus mengembalikan HTTP 400 dan tidak boleh melakukan perubahan apapun pada database (seluruh transaksi dibatalkan).

**Validates: Requirements 7.3**

---

### Property 8: Notifikasi Stockout Otomatis

*For any* transaksi `OUT` yang menyebabkan `currentStock` suatu produk menjadi 0, sistem harus secara otomatis membuat notifikasi bertipe `STOCK_EMPTY` untuk setiap user dengan role `admin` atau `staff_gudang` yang ada di database.

**Validates: Requirements 9.3**

---

## Error Handling

### Backend Error Classes

File: `server/src/utils/errors.ts` (pola sudah ada, harus dipatuhi):

```typescript
class AppError extends Error {
  statusCode: number;
  isOperational: boolean;  // true = client error, false = bug
}

class BadRequestError extends AppError    // 400
class UnauthorizedError extends AppError // 401
class ForbiddenError extends AppError    // 403
class NotFoundError extends AppError     // 404
class ConflictError extends AppError     // 409
class ValidationError extends AppError  // 422, dengan field `errors`
class InternalServerError extends AppError // 500
```

### Backend Error Handler Middleware

File: `server/src/middleware/error-handler.middleware.ts` (sudah ada):

```
Error thrown di controller/service
  → Express catches (4-param middleware)
  → errorHandler():
    if ValidationError: 422 + errors object
    if AppError + isOperational: log warn, return statusCode + message
    if AppError + !isOperational: log error, return statusCode + message
    else (unexpected): log error, return 500 "Internal Server Error"
```

Format response error selalu:
```json
{ "success": false, "message": "...", "errors": { "field": ["..."] } }
```

### Frontend Error Handling

#### Axios Interceptor (sudah ada di `api-client.ts`)

```
Response error
  → if 401 && !retry && !auth endpoint: trigger silent refresh
  → if refresh gagal: clearAuth() + redirect /login
  → semua error lainnya: re-throw sebagai AxiosError
```

#### React Query Error Handling Pattern

```typescript
// Di setiap hook, gunakan onError callback:
const { mutate } = useMutation({
  mutationFn: createTransaction,
  onSuccess: () => {
    toast.success('Transaksi berhasil dibuat');
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TRANSACTIONS() });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.INVENTORIES() });
  },
  onError: (error: AxiosError<ApiErrorResponse>) => {
    const message = error.response?.data?.message ?? 'Terjadi kesalahan';
    toast.error(message);
  },
});
```

#### Toast Notifications

Gunakan library `react-hot-toast` atau `sonner` (pilih salah satu, konsisten di seluruh project):

| Kondisi | Toast Type |
|---------|-----------|
| Operasi berhasil (create, update, delete) | `toast.success()` |
| Validation error dari server | `toast.error()` dengan pesan dari API |
| Network error / timeout | `toast.error('Koneksi terputus. Coba lagi.')` |
| Info (misal: stok rendah warning) | `toast.warning()` atau `toast()` dengan icon |

#### Component-Level Error States

Setiap komponen yang melakukan fetch harus menangani 3 state:
1. **Loading**: Tampilkan `Skeleton` atau `Spinner`
2. **Error**: Tampilkan `EmptyState` dengan pesan error + tombol "Coba Lagi" (`refetch()`)
3. **Empty**: Tampilkan `EmptyState` dengan ilustrasi informatif

```typescript
// Pattern standar di organism:
if (isLoading) return <ProductListSkeleton />;
if (isError) return <EmptyState title="Gagal memuat data" action={<Button onClick={refetch}>Coba Lagi</Button>} />;
if (!data?.length) return <EmptyState title="Belum ada produk" />;
return <ProductTable data={data} />;
```

---

## Testing Strategy

INVENTRA menggunakan **dual testing approach**: unit test untuk contoh spesifik dan property-based test untuk properti universal.

### Unit Testing

Framework: **Vitest** (frontend) + **Jest** (backend, sudah ada pattern)

Target coverage: 70%+

Fokus unit test:
- Utility functions (`formatCurrency`, `formatDate`, `cn`)
- Service layer functions (dengan mock Prisma)
- Zod validation schemas (backend dan frontend)
- Komponen Atom dan Molecule penting

Contoh unit test backend:
```typescript
// product.service.test.ts
describe('ProductService.findAll', () => {
  it('harus mengembalikan produk kosong jika tidak ada data', async () => { ... });
  it('harus memfilter berdasarkan categoryId', async () => { ... });
  it('harus mengembalikan error jika stockStatus=low digunakan dengan reorderPoint=0', async () => { ... });
});
```

### Property-Based Testing

Framework: **fast-check** (JavaScript/TypeScript PBT library)

Setiap property test harus dijalankan minimum 100 iterasi.

Tag format komentar: `// Feature: inventra-complete-system, Property N: <deskripsi>`

#### Property 1 — UUID v4 untuk semua entitas

```typescript
// Feature: inventra-complete-system, Property 1: Semua ID entitas adalah UUID v4
import fc from 'fast-check';
import { UUID_V4_REGEX } from '../constants/regex';

test('setiap entitas yang dibuat memiliki UUID v4 sebagai ID', async () => {
  await fc.assert(
    fc.asyncProperty(
      fc.record({ name: fc.string({ minLength: 1, maxLength: 100 }) }),
      async (input) => {
        const category = await categoryService.create(input);
        return UUID_V4_REGEX.test(category.id);
      }
    ),
    { numRuns: 100 }
  );
});
```

#### Property 2 — Response API konsisten

```typescript
// Feature: inventra-complete-system, Property 2: Format response API konsisten
test('semua response sukses memiliki shape { success: true, data }', async () => {
  await fc.assert(
    fc.asyncProperty(
      fc.constantFrom(...VALID_ENDPOINTS),
      async (endpoint) => {
        const response = await apiClient.get(endpoint);
        return response.data.success === true && 'data' in response.data;
      }
    ),
    { numRuns: 100 }
  );
});
```

#### Property 3 — Filter stockStatus low (Product)

```typescript
// Feature: inventra-complete-system, Property 3: Filter stockStatus=low benar (Product)
test('semua produk dengan 0 < currentStock <= reorderPoint muncul di filter low', async () => {
  await fc.assert(
    fc.asyncProperty(
      fc.record({
        currentStock: fc.integer({ min: 1, max: 50 }),
        reorderPoint: fc.integer({ min: 1, max: 100 }),
      }).filter(({ currentStock, reorderPoint }) => currentStock <= reorderPoint),
      async ({ currentStock, reorderPoint }) => {
        // Setup: buat produk dengan inventory sesuai parameter
        const product = await createTestProductWithInventory(currentStock, reorderPoint);
        // Query dengan filter
        const { data } = await productService.findAll({ stockStatus: 'low' });
        // Verifikasi produk ini ada di hasil
        return data.some(p => p.id === product.id);
      }
    ),
    { numRuns: 100 }
  );
});
```

#### Property 5 — Rekomendasi idempoten

```typescript
// Feature: inventra-complete-system, Property 5: Rekomendasi restock idempoten
test('menjalankan generateRecommendations N kali tidak membuat duplikat PENDING', async () => {
  await fc.assert(
    fc.asyncProperty(
      fc.integer({ min: 2, max: 5 }),  // jumlah run
      async (runs) => {
        const product = await createTestProductBelowROP();
        for (let i = 0; i < runs; i++) {
          await recommendationService.generateRecommendations();
        }
        const pendingCount = await prisma.restockRecommendation.count({
          where: { productId: product.id, status: 'PENDING' },
        });
        return pendingCount === 1;
      }
    ),
    { numRuns: 100 }
  );
});
```

#### Property 6 — Atomisitas transaksi

```typescript
// Feature: inventra-complete-system, Property 6: Atomisitas transaksi
test('totalAmount selalu sama dengan sum item dan StockMovement selalu dibuat', async () => {
  await fc.assert(
    fc.asyncProperty(
      fc.array(
        fc.record({
          quantity: fc.integer({ min: 1, max: 10 }),
          unitPrice: fc.float({ min: 1000, max: 100000 }),
        }),
        { minLength: 1, maxLength: 5 }
      ),
      async (items) => {
        const tx = await createTestTransaction('IN', items);
        const expectedTotal = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
        const movements = await prisma.stockMovement.findMany({
          where: { transactionId: tx.id },
        });
        return (
          Math.abs(Number(tx.totalAmount) - expectedTotal) < 0.01 &&
          movements.length === items.length
        );
      }
    ),
    { numRuns: 100 }
  );
});
```

#### Property 7 — Validasi stok tidak cukup (OUT)

```typescript
// Feature: inventra-complete-system, Property 7: Validasi stok tidak cukup pada OUT
test('transaksi OUT dengan kuantitas > stok selalu mengembalikan 400', async () => {
  await fc.assert(
    fc.asyncProperty(
      fc.record({
        currentStock: fc.integer({ min: 0, max: 50 }),
        requestedQty: fc.integer({ min: 1, max: 100 }),
      }).filter(({ currentStock, requestedQty }) => requestedQty > currentStock),
      async ({ currentStock, requestedQty }) => {
        const product = await createTestProductWithInventory(currentStock, 999);
        try {
          await transactionService.create('OUT', [
            { productId: product.id, quantity: requestedQty, unitPrice: 1000 },
          ], userId);
          return false; // Seharusnya throw
        } catch (error) {
          return error instanceof BadRequestError && error.statusCode === 400;
        }
      }
    ),
    { numRuns: 100 }
  );
});
```

#### Property 8 — Notifikasi stockout otomatis

```typescript
// Feature: inventra-complete-system, Property 8: Notifikasi stockout otomatis
test('transaksi OUT yang menghabiskan stok selalu membuat notifikasi STOCK_EMPTY', async () => {
  await fc.assert(
    fc.asyncProperty(
      fc.integer({ min: 1, max: 20 }), // initial stock
      async (stock) => {
        const product = await createTestProductWithInventory(stock, 999);
        const adminAndStaffCount = await getAdminAndStaffCount();
        await transactionService.create('OUT', [
          { productId: product.id, quantity: stock, unitPrice: 1000 },
        ], userId);
        const notifications = await prisma.notification.findMany({
          where: { referenceId: product.id, type: 'STOCK_EMPTY' },
        });
        return notifications.length === adminAndStaffCount;
      }
    ),
    { numRuns: 100 }
  );
});
```

### Integration Testing

- **Backend**: Gunakan database PostgreSQL test instance (atau Prisma `$transaction` rollback pattern)
- **Cakupan**: Happy path tiap endpoint utama + RBAC enforcement per role
- **Tool**: `supertest` untuk HTTP testing Express

### E2E Testing (Opsional, Post-MVP)

Framework: **Playwright** — cover flow utama: Login → Buat Produk → Transaksi IN → Cek Inventori.
