# Implementation Plan: INVENTRA — Sistem Manajemen Inventaris Lengkap

## Overview

Rencana implementasi ini mencakup 30 task yang dibagi ke dalam 7 fase pengerjaan, dari perbaikan bug backend, pembangunan modul baru, komponen frontend, hingga testing berbasis properti. Urutan fase dirancang agar setiap task dapat berdiri di atas fondasi yang sudah stabil sebelumnya.

## Tasks

### Phase 1: Foundation & Bug Fixes (Backend)

- [x] 1. Database Schema & Seed Cleanup
  - Tambah field `rackLocation String? @map("rack_location") @db.VarChar(50)` ke model Product di `server/prisma/schema.prisma`
  - Hapus seluruh blok "CREATE SAMPLE SUPPLIERS" dari `server/prisma/seed.ts` — hapus hardcoded ID `'supplier-1'` dan `'supplier-2'`
  - Jalankan migration: `npx prisma migrate dev --name add_rack_location_to_product`
  - Regenerate Prisma client: `npx prisma generate`
  - Verifikasi seed script berjalan idempoten: 3 role + 1 admin aktif
  - **Dependencies**: none
  - **Requirements**: 1.2, 1.3, 5.5

- [x] 2. Bug Fix — Product Service stockStatus Filter
  - Buka `server/src/modules/product/product.service.ts`, method `findAll()`
  - Ganti referensi invalid `prisma.inventory.fields.reorderPoint` dengan logika `$queryRaw`
  - Implementasi filter `low`: `SELECT product_id FROM inventories WHERE current_stock > 0 AND current_stock <= reorder_point`
  - Implementasi filter `safe`: `SELECT product_id FROM inventories WHERE current_stock > reorder_point`
  - Implementasi filter `out`: tetap gunakan `where.inventory = { currentStock: 0 }`
  - Test ketiga filter `stockStatus: 'low'`, `'out'`, `'safe'` mengembalikan hasil yang benar
  - **Dependencies**: 1
  - **Requirements**: 5.3

- [x] 3. Bug Fix — Inventory Service stockStatus Filter
  - Buka `server/src/modules/inventory/inventory.service.ts`, method `findAll()`
  - Implementasi filter `stockStatus: 'low'` yang saat ini dikomentari "let frontend filter"
  - Gunakan `$queryRaw`: `SELECT product_id FROM inventories WHERE current_stock > 0 AND current_stock <= reorder_point`
  - Implementasi filter `safe` dengan raw query serupa
  - Pastikan filter `out` menggunakan `where.currentStock = 0`
  - **Dependencies**: 1
  - **Requirements**: 6.2

- [x] 4. Bug Fix — Recommendation Service Upsert
  - Buka `server/src/modules/recommendation/recommendation.service.ts`, method `generateRecommendations()`
  - Ganti pattern `upsert({ where: { id: ... || 'new-record' } })` dengan logika eksplisit
  - Implementasi: `findFirst` berdasarkan `productId` + status `PENDING`; jika ada → `update`, jika tidak → `create`
  - Hapus helper method `getPendingRecommendationId` yang tidak lagi diperlukan
  - Pastikan tidak ada record dengan ID `'new-record'` yang corrupt
  - **Dependencies**: 1
  - **Requirements**: 10.1

- [x] 5. Bug Fix — Cron Job Timezone
  - Buka `server/src/jobs/prediction.cron.ts`
  - Ubah dari `cron.schedule('0 0 * * *', ...)` ke `cron.schedule('0 2 * * *', ..., { timezone: 'Asia/Jakarta' })`
  - Tambahkan opsi timezone `'Asia/Jakarta'` secara eksplisit agar tidak ambigu saat server timezone berubah
  - **Dependencies**: none
  - **Requirements**: 10.2

### Phase 2: New Backend Modules

- [ ] 6. Notification Module Backend
  - Buat `server/src/modules/notification/notification.service.ts` dengan method: `findAll(userId, params)`, `getUnreadCount(userId)`, `markAsRead(id, userId)`, `markAllAsRead(userId)`, `createNotification(userId, type, title, message, referenceId?)`
  - Buat `server/src/modules/notification/notification.controller.ts`
  - Buat `server/src/modules/notification/notification.routes.ts` dengan endpoints: `GET /notifications`, `GET /notifications/unread-count`, `PATCH /notifications/:id/read`, `PATCH /notifications/read-all`
  - Buat `server/src/modules/notification/notification.schema.ts` dengan Zod schemas
  - Buat `server/src/modules/notification/notification.types.ts` dengan TypeScript interfaces
  - **Dependencies**: 1
  - **Requirements**: 9.1, 9.2

- [ ] 7. Analytics Module Backend
  - Buat `server/src/modules/analytics/analytics.service.ts` dengan method: `getSales(params)` — agregasi StockMovement OUT per periode; `getTopProducts(params)` — top N produk by volume/revenue; `getStockHealth()` — distribusi status stok + estimasi hari stockout
  - Buat `server/src/modules/analytics/analytics.controller.ts`
  - Buat `server/src/modules/analytics/analytics.routes.ts` dengan endpoints: `GET /analytics/sales`, `GET /analytics/top-products`, `GET /analytics/stock-health`
  - Buat `server/src/modules/analytics/analytics.schema.ts` dengan Zod schemas untuk query params
  - Buat `server/src/modules/analytics/analytics.types.ts` dengan TypeScript interfaces
  - **Dependencies**: 1, 2, 3
  - **Requirements**: 10.6, 10.7, 10.8

- [ ] 8. Dashboard Module Backend
  - Buat `server/src/modules/dashboard/dashboard.service.ts` dengan method: `getSummary(userId, role)` — response berbeda per role; `getSalesChart(params)` — data chart dengan granularitas; `getStockAlerts()` — produk stok rendah/habis
  - Buat `server/src/modules/dashboard/dashboard.controller.ts`
  - Buat `server/src/modules/dashboard/dashboard.routes.ts` dengan endpoints: `GET /dashboard/summary`, `GET /dashboard/sales-chart`, `GET /dashboard/stock-alerts`
  - Buat `server/src/modules/dashboard/dashboard.schema.ts` dan `dashboard.types.ts` dengan interfaces `AdminSummary`, `StaffSummary`, `OwnerSummary`
  - **Dependencies**: 1, 7
  - **Requirements**: 8.5, 8.6

- [ ] 9. Stock Movement Module Backend
  - Buat `server/src/modules/stock-movement/stock-movement.controller.ts` — handler untuk `GET /stock-movements`
  - Buat `server/src/modules/stock-movement/stock-movement.routes.ts` — register route dengan `authMiddleware`
  - Pastikan filter berjalan: `productId`, `movementType`, `dateFrom`, `dateTo`
  - Pastikan response menggunakan format standar `{ success, data, meta }`
  - **Dependencies**: 1
  - **Requirements**: 6.6

- [ ] 10. Reports Module Backend
  - Buat `server/src/modules/reports/reports.service.ts` dengan method: `getInventoryReport(params)` — snapshot inventori saat ini dalam format JSON; `getTransactionReport(params)` — summary transaksi dalam rentang tanggal
  - Buat `server/src/modules/reports/reports.controller.ts`
  - Buat `server/src/modules/reports/reports.routes.ts` dengan endpoints: `GET /reports/inventory`, `GET /reports/transactions`
  - Buat `server/src/modules/reports/reports.schema.ts` dan `reports.types.ts`
  - **Dependencies**: 1, 2, 3
  - **Requirements**: 13.1, 13.2

- [ ] 11. Transaction Service — Auto Notification on Stockout
  - Buka `server/src/modules/transaction/transaction.service.ts`, method `create()`
  - Setelah transaksi OUT berhasil, iterasi setiap item: jika `currentStock === 0` → buat notifikasi `STOCK_EMPTY`; jika `0 < currentStock <= reorderPoint` → buat notifikasi `STOCK_CRITICAL`
  - Panggil `notificationService.createNotification()` untuk semua user role `admin` dan `staff_gudang`
  - Pastikan notifikasi dibuat dalam `prisma.$transaction` yang sama agar atomis
  - **Dependencies**: 6
  - **Requirements**: 9.3, 9.4

- [ ] 12. Register New Routes in app.ts
  - Buka `server/src/app.ts`
  - Import dan daftarkan `stockMovementRoutes` → `/api/v1/stock-movements`
  - Import dan daftarkan `analyticsRoutes` → `/api/v1/analytics`
  - Import dan daftarkan `dashboardRoutes` → `/api/v1/dashboard`
  - Import dan daftarkan `notificationRoutes` → `/api/v1/notifications`
  - Import dan daftarkan `reportsRoutes` → `/api/v1/reports`
  - Pastikan urutan middleware: `authMiddleware` sebelum controller handler
  - **Dependencies**: 6, 7, 8, 9, 10
  - **Requirements**: 1.8

### Phase 3: Frontend Constants & Infrastructure

- [x] 13. Frontend Constants
  - Buat `src/constants/query-keys.ts` dengan object `QUERY_KEYS` lengkap: `AUTH_ME`, `USERS`, `PRODUCTS`, `PRODUCT_DETAIL`, `CATEGORIES`, `SUPPLIERS`, `INVENTORIES`, `INVENTORY_DETAIL`, `TRANSACTIONS`, `TRANSACTION_DETAIL`, `STOCK_MOVEMENTS`, `ANALYTICS_SALES`, `ANALYTICS_TOP_PRODUCTS`, `ANALYTICS_STOCK_HEALTH`, `RECOMMENDATIONS`, `NOTIFICATIONS`, `NOTIFICATIONS_UNREAD`, `DASHBOARD_SUMMARY`, `DASHBOARD_SALES_CHART`
  - Lengkapi `src/constants/api-endpoints.ts` — tambahkan: `ANALYTICS_STOCK_HEALTH`, `ANALYTICS_SALES`, `DASHBOARD_SALES_CHART`, `REPORTS_INVENTORY`, `REPORTS_TRANSACTIONS`, `PRODUCTS_SCAN`, `INVENTORY_SETTINGS`, `USER_APPROVE`, `USER_REJECT`, `USER_DEACTIVATE`
  - Lengkapi `src/constants/routes.ts` — tambahkan: `REGISTER: '/register'`, `PRODUCT_EDIT: (id) => \`/products/\${id}/edit\``, `TRANSACTION_CREATE: '/transactions/create'`
  - Pastikan barrel export di `src/constants/index.ts` mengekspor semua constants
  - **Dependencies**: none
  - **Requirements**: 1.6

- [-] 14. API Client & Providers
  - Verifikasi `src/libs/api-client.ts` — axios request interceptor menyuntikkan Bearer token dari auth store; response interceptor menangani silent refresh (401 → refresh → retry)
  - Pastikan `src/libs/providers.tsx` — mengandung `QueryClientProvider`, Zustand provider, dan toast provider
  - Pastikan `QueryClient` dikonfigurasi dengan `staleTime` dan `retry` yang sesuai
  - **Dependencies**: none
  - **Requirements**: 2.5

### Phase 4: New Atom & Molecule Components

- [x] 15. Atom Components — Tooltip, Select, Textarea
  - Buat `src/components/atoms/tooltip/Tooltip.tsx` — hover info untuk icon buttons, JSDoc, TypeScript strict, `aria-label` WCAG AA
  - Buat `src/components/atoms/tooltip/index.ts`
  - Buat `src/components/atoms/select/Select.tsx` — native select atau custom dropdown, controlled, error state, JSDoc, WCAG AA
  - Buat `src/components/atoms/select/index.ts`
  - Buat `src/components/atoms/textarea/Textarea.tsx` — multi-line input, controlled, error state, JSDoc, WCAG AA
  - Buat `src/components/atoms/textarea/index.ts`
  - Semua atom: dilarang ada fetch API, useQuery, useMutation, atau business logic
  - **Dependencies**: none
  - **Requirements**: 12.7

- [ ] 16. Molecule Components — StockBadge, ProductCard
  - Buat `src/components/molecules/stock-badge/StockBadge.tsx` — badge "Aman" (hijau), "Rendah" (amber), "Habis" (merah) berdasarkan `currentStock` vs `reorderPoint`, gunakan design token Tailwind
  - Buat `src/components/molecules/stock-badge/index.ts`
  - Buat `src/components/molecules/product-card/ProductCard.tsx` — card ringkasan produk: gambar, SKU, nama, kategori, StockBadge, harga jual; JSDoc, TypeScript strict
  - Buat `src/components/molecules/product-card/index.ts`
  - Semua molecule: dilarang ada API call, React Query, atau Zustand
  - **Dependencies**: 15
  - **Requirements**: 12.8, 6.8

### Phase 5: Feature Modules (Frontend)

- [ ] 17. Feature Auth — Register Form Enhancement
  - Buka/buat `src/features/auth/components/register-form/RegisterForm.tsx`
  - Tambah field `username` (4-50 karakter, alphanumeric) dan dropdown pilih `role`
  - Validasi Zod: email RFC format, username 4-50 char alphanumeric, password min 8 karakter
  - Gunakan `useRegister` mutation dari `src/features/auth/hooks/useAuth.ts`
  - Tampilkan pesan konfirmasi "Akun menunggu persetujuan Admin" setelah registrasi berhasil
  - Update `src/app/(auth)/register/page.tsx` untuk render `RegisterForm`
  - **Dependencies**: 13, 14
  - **Requirements**: 2.1

- [ ] 18. Feature Dashboard — Role-Based Components
  - Buat `src/features/dashboard/services/dashboard.service.ts` — `getDashboardSummary()`, `getSalesChart(params)`
  - Buat `src/features/dashboard/hooks/useDashboard.ts` — useQuery dengan `QUERY_KEYS.DASHBOARD_SUMMARY` dan `QUERY_KEYS.DASHBOARD_SALES_CHART`
  - Buat `src/features/dashboard/types/dashboard.types.ts` — interfaces `AdminSummary`, `StaffSummary`, `OwnerSummary`
  - Buat `src/features/dashboard/components/AdminDashboard/AdminDashboard.tsx` — stat cards + pending users + grafik transaksi 7 hari
  - Buat `src/features/dashboard/components/StaffDashboard/StaffDashboard.tsx` — quick actions + low stock list + ringkasan hari ini
  - Buat `src/features/dashboard/components/OwnerDashboard/OwnerDashboard.tsx` — KPI cards + chart tren 30 hari + top 5 produk + rekomendasi
  - Buat `src/features/dashboard/components/SalesChart/SalesChart.tsx` — Recharts `LineChart` wrapper
  - Update `src/app/(dashboard)/dashboard/page.tsx` — render komponen sesuai role dari `useAuthStore`
  - Tambah skeleton loading state dan error state dengan tombol "Coba Lagi"
  - **Dependencies**: 8, 12, 13, 14, 16
  - **Requirements**: 8.1, 8.2, 8.3, 8.4

- [ ] 19. Feature Product — CRUD & List
  - Buat `src/features/product/services/product.service.ts` — `getProducts`, `getProductById`, `createProduct`, `updateProduct`, `scanProduct`
  - Buat `src/features/product/hooks/useProducts.ts` — hooks `useProducts`, `useProduct`, `useCreateProduct`, `useUpdateProduct`
  - Buat `src/features/product/types/product.types.ts` — `Product`, `CreateProductPayload`, `UpdateProductPayload`
  - Buat `src/features/product/components/ProductList/ProductList.tsx` — DataTable + filter bar (kategori, supplier, stockStatus)
  - Buat `src/features/product/components/ProductForm/ProductForm.tsx` — RHF + Zod, field `rackLocation` wajib tersedia, mode create/edit
  - Buat `src/features/product/components/ProductDetail/ProductDetail.tsx` — info lengkap + grafik stok 30 hari (Recharts) + riwayat transaksi terbaru
  - Buat `src/features/product/components/ProductFilters/ProductFilters.tsx` — UI filter kategori/supplier/stockStatus
  - Update `src/app/(dashboard)/products/page.tsx`, `products/create/page.tsx`, dan `products/[id]/page.tsx`
  - **Dependencies**: 2, 13, 14, 15, 16
  - **Requirements**: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 5.10

- [ ] 20. Feature Inventory — List & Adjustment
  - Buat `src/features/inventory/services/inventory.service.ts` — `getInventories`, `getInventory`, `adjustStock`, `updateSettings`
  - Buat `src/features/inventory/hooks/useInventory.ts` — hooks query dan mutation inventory
  - Buat `src/features/inventory/types/inventory.types.ts` — `Inventory`, `AdjustStockPayload`, `InventorySettings`
  - Buat `src/features/inventory/components/InventoryList/InventoryList.tsx` — DataTable + kartu summary (Total SKU, Stok Habis, Stok Rendah, Total Nilai Inventori)
  - Buat `src/features/inventory/components/AdjustStockModal/AdjustStockModal.tsx` — Modal form adjustment dengan `quantity` dan `reason`
  - Buat `src/features/inventory/components/InventorySettings/InventorySettings.tsx` — form edit `minStock`, `maxStock`, `reorderPoint`, `leadTimeDays`
  - Update `src/app/(dashboard)/inventory/page.tsx`
  - **Dependencies**: 3, 13, 14, 16
  - **Requirements**: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9

- [ ] 21. Feature Transaction — Form Multi-Item & List
  - Buat `src/features/transaction/services/transaction.service.ts` — `getTransactions`, `getTransactionById`, `createTransaction`
  - Buat `src/features/transaction/hooks/useTransactions.ts` — hooks query dan mutation transaksi
  - Buat `src/features/transaction/types/transaction.types.ts` — `Transaction`, `TransactionItem`, `CreateTransactionPayload`
  - Buat `src/features/transaction/components/TransactionList/TransactionList.tsx` — DataTable dua tab (Barang Masuk / Barang Keluar)
  - Buat `src/features/transaction/components/TransactionForm/TransactionForm.tsx` — form multi-item dinamis, product autocomplete by SKU/nama, kalkulasi total real-time
  - Buat `src/features/transaction/components/TransactionItemRow/TransactionItemRow.tsx` — satu baris item: produk, kuantitas, harga satuan, subtotal
  - Buat `src/features/transaction/components/TransactionDetail/TransactionDetail.tsx` — detail lengkap transaksi + semua items
  - Update `src/app/(dashboard)/transactions/page.tsx` dan `transactions/create/page.tsx`
  - **Dependencies**: 11, 13, 14, 15, 16
  - **Requirements**: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 7.10, 7.11

- [ ] 22. Feature Category & Supplier — CRUD Pages
  - Buat `src/features/category/services/category.service.ts` — `getCategories`, `createCategory`, `updateCategory`, `deleteCategory`
  - Buat `src/features/category/hooks/useCategory.ts` — hooks query dan mutation kategori
  - Buat `src/features/supplier/services/supplier.service.ts` — `getSuppliers`, `createSupplier`, `updateSupplier`, `toggleSupplierActive`
  - Buat `src/features/supplier/hooks/useSupplier.ts` — hooks query dan mutation supplier
  - Buat halaman list kategori: tabel + pencarian + pagination + kolom jumlah produk aktif + `CategoryForm`
  - Buat halaman list supplier: tabel + pencarian + pagination + kolom jumlah produk aktif + `SupplierForm`
  - Update `src/app/(dashboard)/categories/page.tsx` dan `suppliers/page.tsx`
  - **Dependencies**: 13, 14, 15
  - **Requirements**: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8

- [ ] 23. Feature Notification — Dropdown & Page
  - Buat `src/features/notification/services/notification.service.ts` — `getNotifications`, `getUnreadCount`, `markAsRead`, `markAllAsRead`
  - Buat `src/features/notification/hooks/useNotifications.ts` — hooks dengan `refetchInterval` untuk unread count
  - Buat `src/features/notification/stores/notification.store.ts` — Zustand store dengan `unreadCount`, `setUnreadCount`, `decrementUnread`, `resetUnread`
  - Buat `src/features/notification/types/notification.types.ts`
  - Buat `src/features/notification/components/NotificationDropdown/NotificationDropdown.tsx` — dropdown 5 notifikasi terbaru + link "Lihat Semua"
  - Update `src/components/organisms/header/Header.tsx` — ikon bell dengan badge unread count (maks "99+")
  - Buat `src/features/notification/components/NotificationList/NotificationList.tsx` — halaman dengan filter Semua/Belum Dibaca/Sudah Dibaca
  - Update `src/app/(dashboard)/notifications/page.tsx`
  - **Dependencies**: 6, 12, 13, 14
  - **Requirements**: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8

- [ ] 24. Feature Analytics — Charts & Recommendations
  - Buat `src/features/analytics/services/analytics.service.ts` — `getSales`, `getTopProducts`, `getStockHealth`
  - Buat `src/features/analytics/hooks/useAnalytics.ts` — hooks dengan `QUERY_KEYS.ANALYTICS_*`
  - Buat `src/features/analytics/types/analytics.types.ts`
  - Buat `src/features/analytics/components/SalesChart/SalesChart.tsx` — Recharts `LineChart` dengan pilihan period 7/30/90 hari
  - Buat `src/features/analytics/components/TopProductsChart/TopProductsChart.tsx` — Recharts `BarChart`
  - Buat `src/features/analytics/components/StockHealthChart/StockHealthChart.tsx` — Recharts `PieChart` distribusi status stok
  - Buat `src/features/analytics/components/RecommendationTable/RecommendationTable.tsx` — tabel rekomendasi + badge prioritas (CRITICAL/HIGH/MEDIUM/LOW) + aksi Setujui/Tolak
  - Update `src/app/(dashboard)/analytics/page.tsx` dan `recommendations/page.tsx`
  - **Dependencies**: 7, 13, 14
  - **Requirements**: 10.3, 10.4, 10.5, 10.6, 10.7, 10.8, 10.9, 10.10

- [ ] 25. Feature User Management — Admin
  - Buat `src/features/user/services/user.service.ts` — `getUsers`, `createUser`, `approveUser`, `rejectUser`, `deactivateUser`, `changeUserRole`
  - Buat `src/features/user/hooks/useUser.ts` — hooks query dan mutation user management
  - Buat `src/features/user/types/user.types.ts`
  - Buat `src/features/user/components/UserTable/UserTable.tsx` — DataTable dengan badge PENDING berwarna amber, filter status, PENDING tampil di atas
  - Buat `src/features/user/components/UserApprovalActions/UserApprovalActions.tsx` — tombol Setujui/Tolak dengan modal alasan penolakan wajib diisi
  - Buat `src/features/user/components/CreateUserModal/CreateUserModal.tsx` — form buat user langsung ACTIVE
  - Tampilkan statistik: total pengguna, total pending, total aktif, distribusi per role
  - Update `src/app/(dashboard)/users/page.tsx`
  - **Dependencies**: 13, 14, 15
  - **Requirements**: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8

### Phase 6: UX & Polish

- [ ] 26. Smart Scanner Component
  - Implementasi `src/components/organisms/smart-scanner/SmartScanner.tsx` menggunakan library `html5-qrcode`
  - Dukung format: EAN-13, EAN-8, Code128, QR Code
  - State visual: "Mencari" (kamera aktif), "Terdeteksi" (highlight), "Sukses" (item ditambahkan)
  - Panggil `GET /api/v1/products/scan?code={kode}` saat barcode berhasil dibaca
  - Tampilkan "Produk tidak ditemukan" jika kode tidak cocok, tawarkan input manual
  - Fallback graceful jika kamera tidak tersedia atau izin ditolak — jangan crash
  - Mode scan beruntun: scanner tetap aktif setelah satu item ditambahkan ke form
  - Integrasikan dengan `TransactionForm` via tombol "Scan Produk" dalam modal/overlay
  - **Dependencies**: 21
  - **Requirements**: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 11.8

- [x] 27. Landing Page Enhancement
  - Buka `src/app/page.tsx`
  - Tambah section statistik/social proof: minimal 3 poin (contoh: "99% Akurasi Stok", "3 Role Pengguna", "Real-time Analytics")
  - Pastikan section fitur menampilkan minimal 6 kartu fitur
  - Pastikan layout responsif: 3 kolom (desktop `lg`) → 2 kolom (tablet `md`) → 1 kolom (mobile)
  - Verifikasi tombol CTA: "Mulai Gratis" → `/register`, "Login ke Dashboard" → `/login`
  - Tambah section CTA akhir dan footer dengan informasi hak cipta
  - **Dependencies**: none
  - **Requirements**: 12.1, 12.2, 12.3, 12.4, 12.5

- [ ] 28. Export CSV Feature
  - Tambah tombol "Export CSV" di halaman Inventory — kolom: SKU, Nama Produk, Kategori, Stok Saat Ini, Status Stok, Lokasi Rak, Harga Beli (hanya admin/owner), Total Nilai
  - Tambah tombol "Export CSV" di halaman Transaction — kolom: Kode Transaksi, Tanggal, Tipe, Total Item, Total Amount (hanya admin/owner), Dibuat Oleh
  - Role-based: kolom harga beli dan total amount disembunyikan untuk role `staff_gudang`
  - Implementasi menggunakan data dari React Query cache atau endpoint reports
  - **Dependencies**: 20, 21
  - **Requirements**: 13.3, 13.4, 13.5, 13.6, 13.7

- [ ] 29. RBAC Route Protection
  - Implementasi `src/middleware.ts` Next.js — redirect ke `/login` jika tidak authenticated
  - Update `src/app/(dashboard)/layout.tsx` — role guard, sembunyikan navigasi yang tidak relevan per role
  - Update `src/components/organisms/sidebar/Sidebar.tsx` — render menu sesuai role (Admin: semua; Staff Gudang: tanpa Analytics/Laporan/User Management; Owner: tanpa Transaksi create/User Management)
  - Pastikan halaman restricted me-redirect jika role tidak sesuai
  - **Dependencies**: 17, 18
  - **Requirements**: 2.8, 2.9

### Phase 7: Testing

- [ ] 30. Property-Based Tests
  - Install `fast-check` sebagai dev dependency di `server/`: `npm install --save-dev fast-check`
  - Buat `server/src/__tests__/properties.test.ts`
  - Implementasi 8 property test (masing-masing min 100 runs):
    - Property 1: Untuk semua entitas yang dibuat, ID selalu berformat UUID v4 yang valid
    - Property 2: Untuk semua endpoint, response selalu mengandung field `success`, `data`, dan (jika list) `meta` dengan `page`, `limit`, `total`, `totalPages`
    - Property 3: Untuk data dengan `currentStock > 0 && currentStock <= reorderPoint`, filter `stockStatus=low` di `GET /products` selalu mengembalikan produk tersebut
    - Property 4: Untuk data yang sama, filter `stockStatus=low` di `GET /inventories` selalu mengembalikan record tersebut
    - Property 5: Jika `generateRecommendations()` dipanggil N kali untuk produk yang sama, jumlah record `PENDING` tidak pernah melebihi 1
    - Property 6: Untuk sembarang transaksi IN yang valid, `totalAmount` selalu sama dengan `sum(quantity * unitPrice)` dan jumlah `StockMovement` selalu sama dengan jumlah items
    - Property 7: Untuk sembarang transaksi OUT dengan `quantity > currentStock`, endpoint selalu mengembalikan HTTP 400 dan tidak ada perubahan di database
    - Property 8: Untuk sembarang transaksi OUT yang menyebabkan `currentStock = 0`, notifikasi `STOCK_EMPTY` selalu dibuat untuk semua user `admin` dan `staff_gudang`
  - Konfigurasi Jest atau Vitest untuk menjalankan file `*.test.ts`
  - **Dependencies**: 2, 3, 4, 6, 11
  - **Requirements**: 5.3, 6.2, 10.1, 9.3, 9.4, 7.3, 7.4

## Task Dependency Graph

```json
{
  "waves": [
    {
      "wave": 1,
      "tasks": [1, 5, 13, 14, 15, 27],
      "description": "Fondasi — tidak ada dependensi"
    },
    {
      "wave": 2,
      "tasks": [2, 3, 4, 16],
      "description": "Bug fix backend + molecules (butuh wave 1)"
    },
    {
      "wave": 3,
      "tasks": [6, 7, 9, 10],
      "description": "Modul backend baru (butuh wave 1-2)"
    },
    {
      "wave": 4,
      "tasks": [8, 11],
      "description": "Dashboard backend + auto notif (butuh wave 3)"
    },
    {
      "wave": 5,
      "tasks": [12],
      "description": "Register routes ke app.ts (butuh wave 3-4)"
    },
    {
      "wave": 6,
      "tasks": [17, 18, 19, 20, 22, 23, 24, 25],
      "description": "Feature frontend (butuh wave 2-5)"
    },
    {
      "wave": 7,
      "tasks": [21],
      "description": "Feature transaksi (butuh wave 4+6)"
    },
    {
      "wave": 8,
      "tasks": [26, 28, 29],
      "description": "UX polish (butuh wave 6-7)"
    },
    {
      "wave": 9,
      "tasks": [30],
      "description": "Property-based testing (butuh wave 1-4)"
    }
  ]
}
```

## Notes

- Semua kode backend harus menggunakan TypeScript strict mode tanpa tipe `any`
- Semua kode frontend harus mengikuti Atomic Design: Atoms tidak boleh import Molecules, dsb.
- Seluruh API call di frontend wajib melalui service layer → hook → component (tidak boleh langsung di component)
- Gunakan design token Tailwind untuk semua warna dan spacing — tidak ada hardcoded hex atau nilai non-standar
- Setiap komponen publik wajib memiliki JSDoc
- Phase 1 dan Phase 2 harus diselesaikan sebelum Phase 5 karena frontend bergantung pada API yang sudah berfungsi
- Task 30 (PBT) sebaiknya dijalankan setelah semua bug fix di Phase 1 selesai untuk memvalidasi perbaikan
