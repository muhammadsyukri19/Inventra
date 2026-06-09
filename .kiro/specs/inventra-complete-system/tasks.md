# Tasks

## Phase 1: Foundation & Bug Fixes (Backend)

- [ ] 1. Database Schema & Seed Cleanup
  - Tambah field `rackLocation String? @map("rack_location") @db.VarChar(50)` ke model Product di `server/prisma/schema.prisma`
  - Hapus seluruh blok "CREATE SAMPLE SUPPLIERS" dari `server/prisma/seed.ts` — hapus hardcoded ID `'supplier-1'` dan `'supplier-2'`
  - Jalankan migration: `npx prisma migrate dev --name add_rack_location_to_product`
  - Regenerate Prisma client: `npx prisma generate`
  - Verifikasi seed script berjalan idempoten: 3 role + 1 admin aktif
  - **Dependencies**: none
  - **Requirements**: 1.2, 1.3, 5.5

- [ ] 2. Bug Fix — Product Service stockStatus Filter
  - Buka `server/src/modules/product/product.service.ts`, method `findAll()`
  - Ganti referensi invalid `prisma.inventory.fields.reorderPoint` dengan logika `$queryRaw`
  - Implementasi filter `low`: `SELECT product_id FROM inventories WHERE current_stock > 0 AND current_stock <= reorder_point`
  - Implementasi filter `safe`: `SELECT product_id FROM inventories WHERE current_stock > reorder_point`
  - Implementasi filter `out`: tetap gunakan `where.inventory = { currentStock: 0 }`
  - Test ketiga filter `stockStatus: 'low'`, `'out'`, `'safe'` mengembalikan hasil yang benar
  - **Dependencies**: 1
  - **Requirements**: 5.3

- [ ] 3. Bug Fix — Inventory Service stockStatus Filter
  - Buka `server/src/modules/inventory/inventory.service.ts`, method `findAll()`
  - Implementasi filter `stockStatus: 'low'` yang saat ini dikomentari "let frontend filter"
  - Gunakan `$queryRaw`: `SELECT product_id FROM inventories WHERE current_stock > 0 AND current_stock <= reorder_point`
  - Implementasi filter `safe` dengan raw query serupa
  - Pastikan filter `out` menggunakan `where.currentStock = 0`
  - **Dependencies**: 1
  - **Requirements**: 6.2

- [ ] 4. Bug Fix — Recommendation Service Upsert
  - Buka `server/src/modules/recommendation/recommendation.service.ts`, method `generateRecommendations()`
  - Ganti pattern `upsert({ where: { id: await this.getPendingRecommendationId(...) || 'new-record' } })` dengan logika eksplisit
  - Implementasi: `findFirst` berdasarkan `productId` + status `PENDING`; jika ada → `update`, jika tidak → `create`
  - Hapus helper method `getPendingRecommendationId` yang tidak lagi diperlukan
  - Pastikan tidak ada record dengan ID `'new-record'` yang corrupt
  - **Dependencies**: 1
  - **Requirements**: 10.1

- [ ] 5. Bug Fix — Cron Job Timezone
  - Buka `server/src/jobs/prediction.cron.ts`
  - Ubah dari `cron.schedule('0 0 * * *', ...)` ke `cron.schedule('0 2 * * *', ..., { timezone: 'Asia/Jakarta' })`
  - Tambahkan opsi timezone `'Asia/Jakarta'` secara eksplisit agar tidak ambigu saat server timezone berubah
  - **Dependencies**: none
  - **Requirements**: 10.2

## Phase 2: New Backend Modules

- [ ] 6. Notification Module Backend
  - Buat `server/src/modules/notification/notification.service.ts` dengan method:
    - `findAll(userId, params)` — pagination + filter `isRead`
    - `getUnreadCount(userId)` — mengembalikan count notifikasi belum dibaca
    - `markAsRead(id, userId)` — tandai satu notifikasi sebagai dibaca
    - `markAllAsRead(userId)` — tandai semua notifikasi user sebagai dibaca
    - `createNotification(userId, type, title, message, referenceId?)` — utility internal untuk membuat notifikasi
  - Buat `server/src/modules/notification/notification.controller.ts`
  - Buat `server/src/modules/notification/notification.routes.ts` dengan endpoints: `GET /notifications`, `GET /notifications/unread-count`, `PATCH /notifications/:id/read`, `PATCH /notifications/read-all`
  - Buat `server/src/modules/notification/notification.schema.ts` dengan Zod schemas
  - Buat `server/src/modules/notification/notification.types.ts` dengan TypeScript interfaces
  - **Dependencies**: 1
  - **Requirements**: 9.1, 9.2

- [ ] 7. Analytics Module Backend
  - Buat `server/src/modules/analytics/analytics.service.ts` dengan method:
    - `getSales(params)` — agregasi `StockMovement` type `OUT` per periode (daily/weekly/monthly) dengan filter `from`, `to`, `categoryId`
    - `getTopProducts(params)` — top N produk berdasarkan volume atau revenue untuk periode tertentu
    - `getStockHealth()` — distribusi status stok (jumlah aman/rendah/habis) + estimasi hari stockout per produk
  - Buat `server/src/modules/analytics/analytics.controller.ts`
  - Buat `server/src/modules/analytics/analytics.routes.ts` dengan endpoints: `GET /analytics/sales`, `GET /analytics/top-products`, `GET /analytics/stock-health`
  - Buat `server/src/modules/analytics/analytics.schema.ts` dengan Zod schemas untuk query params
  - Buat `server/src/modules/analytics/analytics.types.ts` dengan TypeScript interfaces
  - **Dependencies**: 1, 2, 3
  - **Requirements**: 10.6, 10.7, 10.8

- [ ] 8. Dashboard Module Backend
  - Buat `server/src/modules/dashboard/dashboard.service.ts` dengan method:
    - `getSummary(userId, role)` — response berbeda per role: Admin (pending users, produk aktif, nilai inventori, notifikasi, chart 7 hari), Staff (quick actions, low stock, transaksi hari ini), Owner (nilai aset, estimasi jual, profit kotor, tren 30 hari, top 5, rekomendasi)
    - `getSalesChart(params)` — data chart penjualan dengan granularitas (daily/weekly/monthly)
    - `getStockAlerts()` — daftar produk dengan stok rendah atau habis
  - Buat `server/src/modules/dashboard/dashboard.controller.ts`
  - Buat `server/src/modules/dashboard/dashboard.routes.ts` dengan endpoints: `GET /dashboard/summary`, `GET /dashboard/sales-chart`, `GET /dashboard/stock-alerts`
  - Buat `server/src/modules/dashboard/dashboard.schema.ts` dengan Zod schemas
  - Buat `server/src/modules/dashboard/dashboard.types.ts` dengan interfaces `AdminSummary`, `StaffSummary`, `OwnerSummary`
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
  - Buat `server/src/modules/reports/reports.service.ts` dengan method:
    - `getInventoryReport(params)` — snapshot inventori saat ini dalam format JSON (siap dijadikan CSV di frontend)
    - `getTransactionReport(params)` — summary transaksi dalam rentang tanggal dalam format JSON
  - Buat `server/src/modules/reports/reports.controller.ts`
  - Buat `server/src/modules/reports/reports.routes.ts` dengan endpoints: `GET /reports/inventory`, `GET /reports/transactions`
  - Buat `server/src/modules/reports/reports.schema.ts` dan `reports.types.ts`
  - **Dependencies**: 1, 2, 3
  - **Requirements**: 13.1, 13.2

- [ ] 11. Transaction Service — Auto Notification on Stockout
  - Buka `server/src/modules/transaction/transaction.service.ts`, method `create()`
  - Setelah transaksi `OUT` berhasil disimpan, iterasi setiap item transaksi
  - Jika `currentStock === 0` → panggil `notificationService.createNotification()` dengan type `STOCK_EMPTY` untuk semua user role `admin` dan `staff_gudang`
  - Jika `0 < currentStock <= reorderPoint` → panggil `notificationService.createNotification()` dengan type `STOCK_CRITICAL` untuk semua user role `admin` dan `staff_gudang`
  - Gunakan `prisma.$transaction` untuk memastikan atomisitas — notifikasi dibuat dalam transaksi yang sama
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

## Phase 3: Frontend Constants & Infrastructure

- [ ] 13. Frontend Constants
  - Buat `src/constants/query-keys.ts` dengan object `QUERY_KEYS` lengkap mencakup semua entitas: `AUTH_ME`, `USERS`, `PRODUCTS`, `PRODUCT_DETAIL`, `CATEGORIES`, `SUPPLIERS`, `INVENTORIES`, `INVENTORY_DETAIL`, `TRANSACTIONS`, `TRANSACTION_DETAIL`, `STOCK_MOVEMENTS`, `ANALYTICS_SALES`, `ANALYTICS_TOP_PRODUCTS`, `ANALYTICS_STOCK_HEALTH`, `RECOMMENDATIONS`, `NOTIFICATIONS`, `NOTIFICATIONS_UNREAD`, `DASHBOARD_SUMMARY`, `DASHBOARD_SALES_CHART`
  - Lengkapi `src/constants/api-endpoints.ts` — tambahkan: `ANALYTICS_STOCK_HEALTH`, `ANALYTICS_SALES`, `DASHBOARD_SALES_CHART`, `REPORTS_INVENTORY`, `REPORTS_TRANSACTIONS`, `PRODUCTS_SCAN`, `INVENTORY_SETTINGS`, `USER_APPROVE`, `USER_REJECT`, `USER_DEACTIVATE`
  - Lengkapi `src/constants/routes.ts` — tambahkan: `REGISTER: '/register'`, `PRODUCT_EDIT: (id) => ...`, `TRANSACTION_CREATE: '/transactions/create'`
  - Pastikan barrel export di `src/constants/index.ts` mengekspor semua constants
  - **Dependencies**: none
  - **Requirements**: 1.6

- [ ] 14. API Client & Providers
  - Verifikasi `src/libs/api-client.ts` — axios request interceptor menyuntikkan Bearer token dari auth store, response interceptor menangani silent refresh (401 → refresh → retry original request)
  - Pastikan `src/libs/providers.tsx` — mengandung `QueryClientProvider` (React Query), Zustand provider jika ada, dan toast/notification provider
  - Pastikan `QueryClient` dikonfigurasi dengan `staleTime` dan `retry` yang sesuai
  - **Dependencies**: none
  - **Requirements**: 2.5, 14.4

## Phase 4: New Atom & Molecule Components

- [ ] 15. Atom Components — Tooltip, Select, Textarea
  - Buat `src/components/atoms/tooltip/Tooltip.tsx` — hover info untuk icon buttons, dengan JSDoc, TypeScript strict, `aria-label` WCAG AA
  - Buat `src/components/atoms/tooltip/index.ts` — barrel export
  - Buat `src/components/atoms/select/Select.tsx` — native select atau custom dropdown, controlled, dengan error state, JSDoc, WCAG AA
  - Buat `src/components/atoms/select/index.ts`
  - Buat `src/components/atoms/textarea/Textarea.tsx` — multi-line input, controlled, dengan error state, JSDoc, WCAG AA
  - Buat `src/components/atoms/textarea/index.ts`
  - Semua atom: tidak boleh ada fetch API, useQuery, useMutation, atau business logic
  - **Dependencies**: none
  - **Requirements**: 12.7

- [ ] 16. Molecule Components — StockBadge, ProductCard
  - Buat `src/components/molecules/stock-badge/StockBadge.tsx` — badge status stok: "Aman" (hijau, `currentStock > reorderPoint`), "Rendah" (amber, `0 < currentStock <= reorderPoint`), "Habis" (merah, `currentStock === 0`); gunakan design token Tailwind
  - Buat `src/components/molecules/stock-badge/index.ts`
  - Buat `src/components/molecules/product-card/ProductCard.tsx` — card ringkasan produk: gambar, SKU, nama, kategori, StockBadge, harga jual; dengan JSDoc dan TypeScript strict
  - Buat `src/components/molecules/product-card/index.ts`
  - Semua molecule: tidak boleh ada API call, React Query, atau Zustand
  - **Dependencies**: 15
  - **Requirements**: 12.8, 6.8

## Phase 5: Feature Modules (Frontend)

- [ ] 17. Feature Auth — Register Form Enhancement
  - Buka/buat `src/features/auth/components/register-form/RegisterForm.tsx`
  - Tambah field `username` (4-50 karakter, alphanumeric) dan pilih `role` (dropdown) ke form register
  - Implementasi validasi Zod: email format RFC, username 4-50 char alphanumeric, password min 8 karakter
  - Gunakan `useRegister` mutation dari `src/features/auth/hooks/useAuth.ts`
  - Tampilkan pesan konfirmasi "Akun menunggu persetujuan Admin" setelah registrasi berhasil
  - Update `src/app/(auth)/register/page.tsx` untuk render `RegisterForm`
  - **Dependencies**: 13, 14
  - **Requirements**: 2.1

- [ ] 18. Feature Dashboard — Role-Based Components
  - Buat `src/features/dashboard/services/dashboard.service.ts` — `getDashboardSummary()`, `getSalesChart(params)`
  - Buat `src/features/dashboard/hooks/useDashboard.ts` — `useQuery` dengan `QUERY_KEYS.DASHBOARD_SUMMARY` dan `QUERY_KEYS.DASHBOARD_SALES_CHART`
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
  - Buat `src/features/product/components/ProductForm/ProductForm.tsx` — RHF + Zod, field `rackLocation` wajib tersedia, create/edit mode
  - Buat `src/features/product/components/ProductDetail/ProductDetail.tsx` — info lengkap + grafik stok 30 hari (Recharts) + riwayat transaksi terbaru
  - Buat `src/features/product/components/ProductFilters/ProductFilters.tsx` — UI filter kategori/supplier/stockStatus
  - Update `src/app/(dashboard)/products/page.tsx`, `src/app/(dashboard)/products/create/page.tsx`, dan `src/app/(dashboard)/products/[id]/page.tsx`
  - **Dependencies**: 2, 13, 14, 15, 16
  - **Requirements**: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 5.10

- [ ] 20. Feature Inventory — List & Adjustment
  - Buat `src/features/inventory/services/inventory.service.ts` — `getInventories`, `getInventory`, `adjustStock`, `updateSettings`
  - Buat `src/features/inventory/hooks/useInventory.ts` — hooks untuk query dan mutation inventory
  - Buat `src/features/inventory/types/inventory.types.ts` — `Inventory`, `AdjustStockPayload`, `InventorySettings`
  - Buat `src/features/inventory/components/InventoryList/InventoryList.tsx` — DataTable + kartu summary (Total SKU, Stok Habis, Stok Rendah, Total Nilai Inventori)
  - Buat `src/features/inventory/components/AdjustStockModal/AdjustStockModal.tsx` — Modal form adjustment dengan field `quantity` dan `reason`
  - Buat `src/features/inventory/components/InventorySettings/InventorySettings.tsx` — form edit `minStock`, `maxStock`, `reorderPoint`, `leadTimeDays`
  - Update `src/app/(dashboard)/inventory/page.tsx`
  - **Dependencies**: 3, 13, 14, 16
  - **Requirements**: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9

- [ ] 21. Feature Transaction — Form Multi-Item & List
  - Buat `src/features/transaction/services/transaction.service.ts` — `getTransactions`, `getTransactionById`, `createTransaction`
  - Buat `src/features/transaction/hooks/useTransactions.ts` — hooks untuk query dan mutation transaksi
  - Buat `src/features/transaction/types/transaction.types.ts` — `Transaction`, `TransactionItem`, `CreateTransactionPayload`
  - Buat `src/features/transaction/components/TransactionList/TransactionList.tsx` — DataTable dengan dua tab (Barang Masuk / Barang Keluar)
  - Buat `src/features/transaction/components/TransactionForm/TransactionForm.tsx` — form multi-item dinamis, product autocomplete by SKU/nama, kalkulasi total real-time
  - Buat `src/features/transaction/components/TransactionItemRow/TransactionItemRow.tsx` — satu baris item dengan produk, kuantitas, harga satuan, subtotal
  - Buat `src/features/transaction/components/TransactionDetail/TransactionDetail.tsx` — detail lengkap transaksi + semua items
  - Update `src/app/(dashboard)/transactions/page.tsx` dan `src/app/(dashboard)/transactions/create/page.tsx`
  - **Dependencies**: 11, 13, 14, 15, 16
  - **Requirements**: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 7.10, 7.11

- [ ] 22. Feature Category & Supplier — CRUD Pages
  - Buat `src/features/category/services/category.service.ts` — `getCategories`, `createCategory`, `updateCategory`, `deleteCategory`
  - Buat `src/features/category/hooks/useCategory.ts` — hooks query dan mutation kategori
  - Buat `src/features/supplier/services/supplier.service.ts` — `getSuppliers`, `createSupplier`, `updateSupplier`, `toggleSupplierActive`
  - Buat `src/features/supplier/hooks/useSupplier.ts` — hooks query dan mutation supplier
  - Buat halaman list kategori dengan tabel, pencarian, pagination, dan kolom jumlah produk aktif
  - Buat `CategoryForm` component — form create/edit kategori dengan validasi nama unik
  - Buat halaman list supplier dengan tabel, pencarian, pagination, dan kolom jumlah produk aktif
  - Buat `SupplierForm` component — form create/edit supplier dengan validasi email dan telepon
  - Update `src/app/(dashboard)/categories/page.tsx` dan `src/app/(dashboard)/suppliers/page.tsx`
  - **Dependencies**: 13, 14, 15
  - **Requirements**: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8

- [ ] 23. Feature Notification — Dropdown & Page
  - Buat `src/features/notification/services/notification.service.ts` — `getNotifications`, `getUnreadCount`, `markAsRead`, `markAllAsRead`
  - Buat `src/features/notification/hooks/useNotifications.ts` — hooks dengan polling `refetchInterval` untuk unread count
  - Buat `src/features/notification/stores/notification.store.ts` — Zustand store dengan `unreadCount`, `setUnreadCount`, `decrementUnread`, `resetUnread`
  - Buat `src/features/notification/types/notification.types.ts`
  - Buat `src/features/notification/components/NotificationDropdown/NotificationDropdown.tsx` — dropdown 5 notifikasi terbaru + link "Lihat Semua"
  - Update `src/components/organisms/header/Header.tsx` — tambah ikon bell dengan badge unread count (maks "99+")
  - Buat `src/features/notification/components/NotificationList/NotificationList.tsx` — halaman notifikasi dengan filter Semua/Belum Dibaca/Sudah Dibaca
  - Update `src/app/(dashboard)/notifications/page.tsx`
  - **Dependencies**: 6, 12, 13, 14
  - **Requirements**: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8

- [ ] 24. Feature Analytics — Charts & Recommendations
  - Buat `src/features/analytics/services/analytics.service.ts` — `getSales`, `getTopProducts`, `getStockHealth`
  - Buat `src/features/analytics/hooks/useAnalytics.ts` — hooks dengan `QUERY_KEYS.ANALYTICS_SALES`, `ANALYTICS_TOP_PRODUCTS`, `ANALYTICS_STOCK_HEALTH`
  - Buat `src/features/analytics/types/analytics.types.ts`
  - Buat `src/features/analytics/components/SalesChart/SalesChart.tsx` — Recharts `LineChart` dengan pilihan period 7/30/90 hari
  - Buat `src/features/analytics/components/TopProductsChart/TopProductsChart.tsx` — Recharts `BarChart`
  - Buat `src/features/analytics/components/StockHealthChart/StockHealthChart.tsx` — Recharts `PieChart` distribusi status stok
  - Buat `src/features/analytics/components/RecommendationTable/RecommendationTable.tsx` — tabel rekomendasi dengan badge prioritas (CRITICAL/HIGH/MEDIUM/LOW) + aksi Setujui/Tolak
  - Update `src/app/(dashboard)/analytics/page.tsx`
  - Update `src/app/(dashboard)/recommendations/page.tsx`
  - **Dependencies**: 7, 13, 14
  - **Requirements**: 10.3, 10.4, 10.5, 10.6, 10.7, 10.8, 10.9, 10.10

- [ ] 25. Feature User Management — Admin
  - Buat `src/features/user/services/user.service.ts` — `getUsers`, `createUser`, `approveUser`, `rejectUser`, `deactivateUser`, `changeUserRole`
  - Buat `src/features/user/hooks/useUser.ts` — hooks query dan mutation user management
  - Buat `src/features/user/types/user.types.ts`
  - Buat `src/features/user/components/UserTable/UserTable.tsx` — DataTable dengan badge PENDING berwarna amber, filter status, tampilkan PENDING di atas
  - Buat `src/features/user/components/UserApprovalActions/UserApprovalActions.tsx` — tombol Setujui/Tolak (modal alasan penolakan wajib diisi)
  - Buat `src/features/user/components/CreateUserModal/CreateUserModal.tsx` — form buat user langsung ACTIVE
  - Tampilkan statistik: total pengguna, total pending, total aktif, distribusi per role
  - Update `src/app/(dashboard)/users/page.tsx`
  - **Dependencies**: 13, 14, 15
  - **Requirements**: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8

## Phase 6: UX & Polish

- [ ] 26. Smart Scanner Component
  - Implementasi `src/components/organisms/smart-scanner/SmartScanner.tsx` menggunakan library `html5-qrcode`
  - Dukung format barcode: EAN-13, EAN-8, Code128, QR Code
  - State visual: "Mencari" (kamera aktif), "Terdeteksi" (highlight), "Sukses" (item ditambahkan)
  - Panggil `GET /api/v1/products/scan?code={kode}` saat barcode berhasil dibaca
  - Tampilkan pesan "Produk tidak ditemukan" jika kode tidak cocok, tawarkan input manual
  - Fallback graceful jika kamera tidak tersedia atau izin ditolak
  - Mode scan beruntun: scanner tetap aktif setelah satu item berhasil ditambahkan ke form
  - Integrasikan dengan `TransactionForm` via tombol "Scan Produk" dalam modal/overlay
  - **Dependencies**: 21
  - **Requirements**: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 11.8

- [ ] 27. Landing Page Enhancement
  - Buka `src/app/page.tsx`
  - Tambah section statistik/social proof: minimal 3 poin (contoh: "99% Akurasi Stok", "3 Role Pengguna", "Real-time Analytics")
  - Pastikan section fitur unggulan menampilkan minimal 6 kartu fitur
  - Pastikan layout responsif: 3 kolom (desktop `lg`) → 2 kolom (tablet `md`) → 1 kolom (mobile)
  - Verifikasi tombol CTA: "Mulai Gratis" → `/register`, "Login ke Dashboard" → `/login`
  - Tambah section CTA akhir dan footer dengan informasi hak cipta
  - **Dependencies**: none
  - **Requirements**: 12.1, 12.2, 12.3, 12.4, 12.5

- [ ] 28. Export CSV Feature
  - Tambah tombol "Export CSV" di halaman Inventory (`src/app/(dashboard)/inventory/page.tsx`)
    - Kolom CSV inventori: SKU, Nama Produk, Kategori, Stok Saat Ini, Status Stok, Lokasi Rak, Harga Beli (hanya admin/owner), Total Nilai
  - Tambah tombol "Export CSV" di halaman Transaction (`src/app/(dashboard)/transactions/page.tsx`)
    - Kolom CSV transaksi: Kode Transaksi, Tanggal, Tipe, Total Item, Total Amount (hanya admin/owner), Dibuat Oleh
  - Role-based: kolom harga beli dan total amount disembunyikan untuk role `staff_gudang`
  - Implementasi menggunakan data dari React Query cache atau fetch endpoint reports
  - **Dependencies**: 20, 21
  - **Requirements**: 13.3, 13.4, 13.5, 13.6, 13.7

- [ ] 29. RBAC Route Protection
  - Implementasi `src/middleware.ts` Next.js — redirect ke `/login` jika tidak authenticated (cek token dari auth store/cookie)
  - Update dashboard layout di `src/app/(dashboard)/layout.tsx` — role guard, sembunyikan navigasi yang tidak relevan per role
  - Update `src/components/organisms/sidebar/Sidebar.tsx` — render menu items berdasarkan role dari `useAuthStore`
    - Admin: semua menu
    - Staff Gudang: sembunyikan Analytics, Laporan, User Management
    - Owner: sembunyikan Transaksi (create), User Management; tampilkan Analytics dan Laporan
  - Pastikan halaman yang restricted mengembalikan redirect jika role tidak sesuai
  - **Dependencies**: 17, 18
  - **Requirements**: 2.8, 2.9

## Phase 7: Testing

- [ ] 30. Property-Based Tests
  - Install `fast-check` sebagai dev dependency di `server/`: `npm install --save-dev fast-check`
  - Buat folder `server/src/__tests__/` dan file test utama `server/src/__tests__/properties.test.ts`
  - Implementasi minimal 8 property test berikut (masing-masing min 100 runs):
    - **Property 1 — UUID v4**: Untuk semua entitas yang dibuat, ID yang dihasilkan selalu berformat UUID v4 yang valid
    - **Property 2 — Format response API konsisten**: Untuk semua endpoint yang dipanggil, response selalu mengandung field `success: boolean`, `data`, dan (jika list) `meta` dengan `page`, `limit`, `total`, `totalPages`
    - **Property 3 — Filter stockStatus=low (Product)**: Untuk sembarang data inventori dengan `currentStock > 0 && currentStock <= reorderPoint`, filter `stockStatus=low` di `GET /products` selalu mengembalikan produk tersebut
    - **Property 4 — Filter stockStatus=low (Inventory)**: Untuk sembarang data inventori yang sama, filter `stockStatus=low` di `GET /inventories` selalu mengembalikan record tersebut
    - **Property 5 — Rekomendasi idempoten**: Jika `generateRecommendations()` dipanggil N kali untuk produk yang sama, jumlah record `PENDING` untuk produk tersebut tidak pernah melebihi 1
    - **Property 6 — Atomisitas transaksi**: Untuk sembarang transaksi `IN` yang valid, `totalAmount` selalu sama dengan `sum(item.quantity * item.unitPrice)` dan jumlah `StockMovement` selalu sama dengan jumlah items
    - **Property 7 — Validasi stok tidak cukup (OUT)**: Untuk sembarang transaksi `OUT` dengan quantity > currentStock, endpoint selalu mengembalikan HTTP 400 dan tidak ada perubahan di database
    - **Property 8 — Notifikasi stockout otomatis**: Untuk sembarang transaksi `OUT` yang menyebabkan `currentStock = 0`, notifikasi `STOCK_EMPTY` selalu dibuat untuk semua user `admin` dan `staff_gudang`
  - Konfigurasi test runner (Jest atau Vitest) untuk menjalankan file `*.test.ts`
  - **Dependencies**: 2, 3, 4, 6, 11
  - **Requirements**: 5.3, 6.2, 10.1, 9.3, 9.4, 7.3, 7.4
