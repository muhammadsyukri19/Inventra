# Dokumen Requirements — INVENTRA: Sistem Manajemen Inventaris Lengkap

## Pendahuluan

**INVENTRA** adalah sistem manajemen inventaris berbasis web generasi baru yang mengintegrasikan Analitik Prediktif (Machine Learning) dan Identifikasi Visual (Computer Vision) untuk mengotomatisasi proses pergudangan dan retail. Sistem ini mendukung tiga role pengguna — Admin, Staff Gudang, dan Owner — dengan akses dan antarmuka yang berbeda sesuai fungsi bisnis masing-masing.

Dokumen ini mencakup seluruh scope pengembangan: perbaikan fitur yang sudah ada, penyelesaian modul yang setengah jadi, serta pembangunan fitur baru dari nol — sehingga INVENTRA menjadi aplikasi yang stabil, lengkap, dan siap presentasi secara end-to-end.

### Analisis Kondisi Saat Ini

Berdasarkan audit codebase, berikut kondisi dan isu yang teridentifikasi:

**Yang sudah berjalan baik:**
- Autentikasi JWT dengan token rotation dan refresh token yang aman
- Sistem Approval pengguna (Self-Registration → PENDING → Admin Approve)
- Prisma schema yang komprehensif (User, Product, Inventory, Transaction, StockMovement, SalesAnalytics, RestockRecommendation, Notification)
- Skeleton frontend feature-based (auth, dashboard, product, inventory, transaction, dll)
- Landing page sudah ada namun perlu penyempurnaan

**Yang perlu diselesaikan/diperbaiki:**
- `inventory.service.ts`: Filter `stockStatus: 'low'` tidak berfungsi (komentar "let frontend filter" — ini adalah bug desain)
- `product.service.ts`: Referensi `prisma.inventory.fields.reorderPoint` pada where clause tidak valid di Prisma (runtime error)
- `recommendation.service.ts`: Logika `upsert` menggunakan ID fiktif `'new-record'` — akan selalu gagal di database
- Modul `analytics`, `dashboard`, `notification` backend masih kosong (folder tanpa file)
- Frontend: seluruh halaman dalam `(dashboard)` masih stub/placeholder belum diimplementasi
- Tidak ada `rackLocation` (lokasi rak) pada schema Product padahal disebutkan dalam roadmap
- Seed data menggunakan hardcoded ID `supplier-1` yang bertentangan dengan UUID strategy
- Tidak ada field `username` pada form register (schema ada tapi mungkin belum di frontend)

---

## Glosarium

- **INVENTRA**: Nama sistem manajemen inventaris ini secara keseluruhan
- **System**: Merujuk pada keseluruhan sistem INVENTRA (frontend + backend)
- **API**: Antarmuka pemrograman aplikasi — server Express.js pada `POST/GET/PUT/PATCH/DELETE /api/v1/...`
- **Admin**: Pengguna dengan role `admin` — memiliki akses penuh ke seluruh sistem
- **Staff_Gudang**: Pengguna dengan role `staff_gudang` — mengelola operasional stok harian
- **Owner**: Pengguna dengan role `owner` — memiliki akses read-only ke analitik dan laporan bisnis
- **Product**: Entitas master data barang dengan SKU unik, kategori, harga, dan lokasi rak
- **Inventory**: Record stok aktual per produk, termasuk batas minimum/maksimum dan reorder point
- **Transaction**: Dokumen transaksi yang merekam perpindahan barang (IN/OUT) beserta item-itemnya
- **TransactionItem**: Baris detail dalam sebuah transaksi — produk, kuantitas, dan harga satuan
- **StockMovement**: Log perubahan stok yang dihasilkan otomatis oleh setiap transaksi atau penyesuaian manual
- **Category**: Kelompok produk (contoh: Elektronik, Makanan & Minuman)
- **Supplier**: Pemasok/vendor yang menyediakan produk
- **RestockRecommendation**: Rekomendasi pengisian kembali stok yang dihasilkan oleh engine analitik prediktif
- **SalesAnalytics**: Agregat data penjualan per produk per periode (harian/mingguan/bulanan)
- **Notification**: Pesan notifikasi sistem yang dikirimkan ke pengguna (low-stock, restock, dsb.)
- **JWT**: JSON Web Token — mekanisme autentikasi stateless
- **RBAC**: Role-Based Access Control — kontrol akses berbasis role
- **SKU**: Stock Keeping Unit — kode unik pengenal produk
- **ROP**: Reorder Point — ambang batas stok yang memicu rekomendasi restock
- **Scanner**: Fitur kamera berbasis Computer Vision / QR barcode untuk identifikasi produk
- **Dashboard**: Halaman ringkasan informasi yang disesuaikan per role
- **Atomic_Design**: Hierarki komponen UI: Atoms → Molecules → Organisms → Templates → Pages
- **Feature_Module**: Unit kode terpisah per domain bisnis dalam `src/features/`
- **Design_Token**: Variabel CSS/Tailwind untuk warna, spacing, dan radius yang terdefinisi dalam sistem desain

---

## Requirements

---

### Requirement 1: Fondasi Infrastruktur & Kode Bersih

**User Story:** Sebagai Developer, saya ingin kodebase yang bersih, konsisten, dan bebas dari implementasi sementara, sehingga sistem dapat dikembangkan dan di-maintain tanpa hambatan teknis.

#### Acceptance Criteria

1. THE System SHALL menghapus seluruh hardcoded credential, magic number, dan data dummy dari kode sumber sebelum deployment
2. THE System SHALL menggunakan UUID yang di-generate secara otomatis oleh database untuk seluruh entitas — tidak boleh ada hardcoded ID seperti `'supplier-1'` pada seed script
3. WHEN seed script dijalankan, THE System SHALL membuat data awal yang minimal dan idempoten: 3 role (admin, staff_gudang, owner) dan 1 akun admin aktif dengan kredensial yang tersimpan di file `.env`
4. THE API SHALL mengembalikan response dalam format JSON yang konsisten: `{ success: boolean, data: T, message?: string, meta?: PaginationMeta }` untuk semua endpoint
5. THE System SHALL menggunakan TypeScript strict mode tanpa penggunaan tipe `any` di seluruh codebase frontend dan backend
6. THE System SHALL mendefinisikan seluruh konstanta (API base URL, route paths, query keys, batas pagination) dalam file constants — tidak boleh hardcoded di dalam komponen atau service
7. IF kode `console.log` ditemukan di luar file development tooling, THEN THE System SHALL menggantikannya dengan `logger.info/error/warn` dari Winston di backend atau menghapusnya di frontend
8. THE System SHALL memastikan seluruh modul backend memiliki struktur file lengkap: `*.controller.ts`, `*.service.ts`, `*.routes.ts`, `*.schema.ts`, `*.types.ts`

---

### Requirement 2: Autentikasi & Otorisasi (Penyempurnaan)

**User Story:** Sebagai pengguna sistem, saya ingin proses login, registrasi, dan manajemen sesi yang aman dan mudah digunakan, sehingga akun saya terlindungi dan akses ke fitur sesuai role saya.

#### Acceptance Criteria

1. WHEN pengguna mengisi form registrasi dengan nama lengkap, email, username, password, dan memilih role yang tersedia, THE System SHALL membuat akun baru dengan status `PENDING` dan menampilkan pesan konfirmasi bahwa akun menunggu persetujuan Admin
2. WHEN pengguna mencoba login dengan akun berstatus `PENDING`, THE System SHALL menolak login dan menampilkan pesan "Akun Anda sedang menunggu persetujuan Admin"
3. WHEN pengguna mencoba login dengan akun berstatus `REJECTED` atau `INACTIVE`, THE System SHALL menolak login dan menampilkan pesan status akun yang sesuai
4. WHEN pengguna berhasil login, THE System SHALL menyimpan access token di memory (Zustand store) dan refresh token di `httpOnly` cookie atau `localStorage` sesuai konfigurasi — tidak boleh menyimpan access token di cookie yang dapat diakses JavaScript
5. WHEN access token mendekati expired, THE System SHALL secara otomatis melakukan refresh token tanpa meminta pengguna login ulang (silent refresh via React Query)
6. WHEN refresh token dideteksi telah digunakan sebelumnya (token reuse attack), THE System SHALL menginvalidasi semua token pengguna tersebut dan memaksa login ulang
7. WHEN pengguna logout, THE System SHALL menghapus access token dari memory, menginvalidasi refresh token di server, dan me-redirect ke halaman login
8. THE Auth_Middleware SHALL memvalidasi setiap request ke endpoint yang dilindungi dengan memeriksa signature JWT dan status akun pengguna (`ACTIVE`)
9. THE RBAC_Middleware SHALL memblokir akses ke endpoint yang membutuhkan role tertentu jika pengguna tidak memiliki role yang sesuai, dan mengembalikan HTTP 403 dengan pesan yang deskriptif
10. WHERE fitur change password tersedia, WHEN pengguna mengubah password, THE System SHALL memvalidasi password lama, meng-hash password baru dengan bcrypt (salt rounds ≥ 12), dan menginvalidasi semua refresh token aktif pengguna tersebut
11. THE System SHALL menampilkan halaman login yang responsif dengan validasi form real-time menggunakan React Hook Form dan Zod, termasuk indikator loading saat request sedang berlangsung

---

### Requirement 3: Manajemen Pengguna (Admin)

**User Story:** Sebagai Admin, saya ingin mengelola seluruh akun pengguna — menyetujui, menolak, menonaktifkan, dan mengubah role — sehingga saya dapat mengontrol siapa yang memiliki akses ke sistem.

#### Acceptance Criteria

1. THE User_Management_API SHALL menyediakan endpoint `GET /api/v1/users` yang dapat diakses hanya oleh role `admin`, mengembalikan daftar pengguna dengan pagination, filter berdasarkan status (`PENDING`, `ACTIVE`, `REJECTED`, `INACTIVE`), dan pencarian berdasarkan nama/email/username
2. WHEN Admin mengakses halaman Manajemen Pengguna, THE System SHALL menampilkan pengguna berstatus `PENDING` di bagian paling atas dengan indikator visual yang jelas (badge berwarna amber)
3. WHEN Admin menyetujui akun (`PATCH /api/v1/users/:id/approve`), THE System SHALL mengubah status pengguna dari `PENDING` menjadi `ACTIVE` dan membuat notifikasi untuk pengguna tersebut
4. WHEN Admin menolak akun (`PATCH /api/v1/users/:id/reject`), THE System SHALL mengubah status pengguna menjadi `REJECTED` dengan mewajibkan Admin mengisi alasan penolakan yang akan tersimpan di database
5. WHEN Admin menonaktifkan akun aktif (`PATCH /api/v1/users/:id/deactivate`), THE System SHALL mengubah status menjadi `INACTIVE` dan menginvalidasi seluruh token aktif pengguna tersebut
6. THE Admin SHALL dapat membuat akun pengguna baru secara langsung (`POST /api/v1/users`) dengan status `ACTIVE` tanpa melalui proses approval — berguna untuk onboarding internal
7. IF Admin mencoba mengubah role atau status akun Admin terakhir yang aktif, THEN THE System SHALL menolak operasi dan mengembalikan error 400 dengan pesan "Tidak dapat menonaktifkan admin terakhir"
8. THE System SHALL menampilkan statistik pengguna di halaman manajemen: total pengguna, total pending, total aktif, dan distribusi per role

---

### Requirement 4: Master Data — Kategori & Supplier

**User Story:** Sebagai Admin atau Staff Gudang, saya ingin mengelola data kategori dan supplier, sehingga produk dapat diorganisir dan dihubungkan ke pemasok yang tepat.

#### Acceptance Criteria

1. THE Category_API SHALL menyediakan CRUD lengkap (`GET`, `POST`, `PUT`, `DELETE /api/v1/categories`) yang dapat diakses oleh `admin` dan `staff_gudang`
2. WHEN pengguna membuat kategori baru, THE System SHALL memvalidasi bahwa nama kategori unik (case-insensitive) dan tidak boleh kosong, maksimal 100 karakter
3. IF Admin mencoba menghapus kategori yang memiliki produk aktif, THEN THE System SHALL menolak penghapusan dan mengembalikan pesan "Kategori masih digunakan oleh [N] produk"
4. THE Supplier_API SHALL menyediakan CRUD lengkap (`GET`, `POST`, `PUT`, `DELETE /api/v1/suppliers`) yang dapat diakses oleh `admin` dan `staff_gudang`
5. WHEN pengguna membuat atau memperbarui data supplier, THE System SHALL memvalidasi format email (jika diisi) dan nomor telepon (jika diisi — format bebas tapi minimal 6 digit)
6. WHEN supplier dinonaktifkan (`isActive: false`), THE System SHALL tetap mempertahankan relasi produk yang sudah ada — tidak menghapus data historis
7. THE System SHALL menampilkan halaman kategori dan supplier dengan tabel yang mendukung pencarian, sorting per kolom, dan pagination 10/25/50 per halaman
8. THE System SHALL menampilkan jumlah produk aktif pada setiap baris kategori dan supplier di tabel daftar

---

### Requirement 5: Core Inventory — Master Data Produk

**User Story:** Sebagai Staff Gudang atau Admin, saya ingin mengelola master data produk secara lengkap dengan SKU, kategori, harga jual, harga beli, lokasi rak, dan pengaturan stok, sehingga setiap barang tercatat akurat dan dapat dilacak.

#### Acceptance Criteria

1. THE Product_API SHALL menyediakan CRUD lengkap untuk produk dengan field wajib: `sku` (unik), `name`, `categoryId`, `price` (harga jual), `costPrice` (harga beli), `unit`; dan field opsional: `supplierId`, `description`, `imageUrl`, `rackLocation`, `isActive`
2. WHEN produk baru dibuat, THE System SHALL secara otomatis membuat record `Inventory` terhubung dengan nilai awal: `currentStock: 0`, `minStock`, `maxStock`, `leadTimeDays` sesuai input; serta menghitung `safetyStock` dan `reorderPoint` secara algoritmik
3. THE System SHALL memperbaiki bug pada `ProductService.findAll()` di mana filter `stockStatus: 'low'` menggunakan referensi field Prisma yang tidak valid (`prisma.inventory.fields.reorderPoint`) — ganti dengan raw query atau subquery yang valid
4. WHEN SKU produk diinput, THE System SHALL memvalidasi format SKU: hanya huruf kapital, angka, dan tanda hubung — maksimal 50 karakter; dan memastikan keunikan secara case-insensitive
5. THE Product schema SHALL ditambahkan field `rackLocation` (string, opsional, maks 50 karakter) untuk mencatat lokasi fisik barang di gudang
6. THE System SHALL mendukung upload gambar produk dengan validasi tipe file (JPEG, PNG, WebP) dan ukuran maksimal 2MB; gambar disimpan sebagai URL yang valid
7. THE Product_List_Page SHALL menampilkan tabel produk dengan kolom: Gambar, SKU, Nama, Kategori, Stok Saat Ini, Status Stok (badge: Aman/Rendah/Habis), Lokasi Rak, Harga Jual, dan Aksi
8. THE System SHALL mendukung filter produk berdasarkan: kategori, supplier, status aktif/nonaktif, dan status stok (aman/rendah/habis); serta pencarian full-text pada nama dan SKU
9. THE System SHALL menampilkan halaman detail produk yang menampilkan seluruh informasi produk, grafik pergerakan stok 30 hari terakhir, dan riwayat transaksi terbaru
10. WHEN produk dinonaktifkan, THE System SHALL menyembunyikan produk dari daftar default (tampil hanya jika filter `isActive: false` aktif) namun mempertahankan seluruh data historis

---

### Requirement 6: Core Inventory — Manajemen Stok

**User Story:** Sebagai Staff Gudang, saya ingin memperbarui stok barang dan melihat riwayat pergerakannya, sehingga informasi stok selalu akurat dan dapat diaudit.

#### Acceptance Criteria

1. THE Inventory_API SHALL menyediakan endpoint `GET /api/v1/inventories` yang mengembalikan daftar inventori dengan informasi produk terkait, pagination, dan filter status stok
2. THE System SHALL memperbaiki bug pada `InventoryService.findAll()` di mana filter `stockStatus: 'low'` tidak diimplementasi — gunakan `WHERE currentStock > 0 AND currentStock <= reorderPoint` menggunakan Prisma raw query
3. THE Inventory_API SHALL menyediakan endpoint `PATCH /api/v1/inventories/:productId/settings` untuk memperbarui pengaturan inventori (minStock, maxStock, reorderPoint, safetyStock, leadTimeDays) oleh `admin` atau `staff_gudang`
4. THE Inventory_API SHALL menyediakan endpoint `POST /api/v1/inventories/:productId/adjust` untuk penyesuaian stok manual (ADJUSTMENT type) yang dilakukan oleh `admin` atau `staff_gudang`, dengan field `quantity` dan `reason` wajib diisi
5. WHEN penyesuaian stok dilakukan, THE System SHALL membuat record `StockMovement` secara otomatis dengan `movementType: ADJUSTMENT`, stok sebelum dan sesudah, alasan, dan ID pengguna yang melakukan
6. THE StockMovement_API SHALL menyediakan endpoint `GET /api/v1/stock-movements` yang dapat difilter berdasarkan `productId`, `movementType`, dan rentang tanggal — dapat diakses oleh semua role yang sudah login
7. THE System SHALL menampilkan halaman Inventori yang menampilkan kartu ringkasan: Total SKU, Total Stok Habis, Total Stok Rendah, Total Nilai Inventori (harga beli × stok)
8. THE System SHALL menampilkan badge status stok pada setiap produk: "Aman" (hijau) jika `currentStock > reorderPoint`, "Rendah" (amber) jika `0 < currentStock ≤ reorderPoint`, "Habis" (merah) jika `currentStock = 0`
9. WHEN stok suatu produk jatuh ke bawah `reorderPoint` setelah sebuah transaksi, THE System SHALL secara otomatis membuat atau memperbarui `RestockRecommendation` untuk produk tersebut

---

### Requirement 7: Transaksi Stok (Inbound & Outbound)

**User Story:** Sebagai Staff Gudang, saya ingin mencatat transaksi barang masuk (inbound) dan barang keluar (outbound) dengan detail item, sehingga setiap pergerakan stok tercatat dalam dokumen yang dapat dilacak dan diaudit.

#### Acceptance Criteria

1. THE Transaction_API SHALL menyediakan endpoint `POST /api/v1/transactions` yang menerima `type` (IN/OUT), `notes` (opsional), dan array `items` (masing-masing berisi `productId`, `quantity`, `unitPrice`)
2. WHEN transaksi dibuat, THE System SHALL memvalidasi bahwa semua `productId` dalam `items` adalah produk yang aktif (`isActive: true`) dan terdaftar dalam sistem
3. WHEN transaksi bertipe `OUT` dibuat, THE System SHALL memvalidasi bahwa stok setiap produk dalam `items` mencukupi — jika tidak, kembalikan error 400 yang menyebutkan nama produk dan kekurangan stoknya
4. WHEN transaksi berhasil disimpan, THE System SHALL secara atomik (dalam satu database transaction): memperbarui `currentStock` pada `Inventory` setiap produk, membuat record `StockMovement` per item dengan tipe IN/OUT, menghitung dan menyimpan `totalAmount` pada transaksi, dan memperbarui `lastRestockAt` pada `Inventory` untuk transaksi IN
5. THE System SHALL meng-generate `transactionCode` secara otomatis dengan format `TRX-IN-YYYYMMDD-XXXX` atau `TRX-OUT-YYYYMMDD-XXXX` di mana XXXX adalah nomor urut per hari
6. THE Transaction_API SHALL menyediakan endpoint `GET /api/v1/transactions` dengan pagination, filter berdasarkan `type` (IN/OUT), rentang `transactionDate`, dan pencarian berdasarkan `transactionCode`
7. THE Transaction_API SHALL menyediakan endpoint `GET /api/v1/transactions/:id` yang mengembalikan detail transaksi lengkap termasuk semua `TransactionItem` dengan informasi produk
8. THE System SHALL menampilkan halaman Transaksi dengan dua tab: "Barang Masuk" dan "Barang Keluar", masing-masing dengan tabel yang dapat difilter dan di-sort
9. THE System SHALL menyediakan form transaksi yang memungkinkan pengguna menambahkan multiple item dalam satu transaksi, dengan auto-complete pencarian produk berdasarkan SKU atau nama, dan menampilkan stok saat ini secara real-time
10. THE System SHALL menampilkan kalkulasi total otomatis (kuantitas × harga) per item dan grand total transaksi sebelum konfirmasi
11. WHERE fitur Smart Scanner aktif, WHEN produk berhasil diidentifikasi oleh scanner, THE System SHALL mengisi otomatis field produk pada form transaksi yang sedang aktif

---

### Requirement 8: Role-Based Dashboard

**User Story:** Sebagai pengguna sistem (Admin, Staff Gudang, atau Owner), saya ingin melihat dashboard yang relevan dengan peran saya, sehingga saya dapat langsung mengakses informasi dan tindakan yang paling penting untuk pekerjaan saya.

#### Acceptance Criteria

1. THE System SHALL menampilkan dashboard yang berbeda untuk setiap role — Admin melihat Dashboard Admin, Staff_Gudang melihat Dashboard Operasional, Owner melihat Dashboard Business Intelligence
2. WHILE pengguna dengan role `admin` mengakses dashboard, THE System SHALL menampilkan: jumlah akun pending approval (dengan link langsung ke halaman Manajemen Pengguna), total produk aktif, total nilai inventori, 5 notifikasi terbaru, dan grafik ringkasan transaksi 7 hari terakhir
3. WHILE pengguna dengan role `staff_gudang` mengakses dashboard, THE System SHALL menampilkan: tombol aksi cepat (Transaksi Masuk, Transaksi Keluar, Scan Produk), daftar produk dengan stok rendah/habis yang butuh perhatian segera, ringkasan transaksi hari ini (jumlah transaksi IN dan OUT), dan notifikasi yang belum dibaca
4. WHILE pengguna dengan role `owner` mengakses dashboard, THE System SHALL menampilkan: Total Nilai Aset Inventori, Estimasi Total Nilai Jual, Total Keuntungan Kotor Bulan Ini (selisih harga jual − harga beli), grafik tren penjualan 30 hari, top 5 produk terlaris, dan rekomendasi restock dengan prioritas tinggi
5. THE Dashboard_API SHALL menyediakan endpoint `GET /api/v1/dashboard/summary` yang mengembalikan data ringkasan berdasarkan role pengguna yang sedang login — satu endpoint dengan respons yang berbeda per role
6. THE Dashboard_API SHALL menyediakan endpoint `GET /api/v1/dashboard/sales-chart` yang mengembalikan data penjualan agregat untuk rentang tanggal dan granularitas (harian/mingguan/bulanan) yang dapat dikonfigurasi
7. IF data dashboard gagal dimuat, THEN THE System SHALL menampilkan komponen error state dengan tombol "Coba Lagi" tanpa merusak keseluruhan tampilan halaman
8. WHEN dashboard pertama kali dimuat, THE System SHALL menampilkan skeleton loading state selama data sedang di-fetch — bukan blank screen atau spinner penuh

---

### Requirement 9: Sistem Notifikasi

**User Story:** Sebagai pengguna sistem, saya ingin menerima notifikasi tentang peristiwa penting (stok rendah, rekomendasi restock), sehingga saya dapat segera mengambil tindakan sebelum terjadi masalah operasional.

#### Acceptance Criteria

1. THE Notification_API SHALL menyediakan endpoint `GET /api/v1/notifications` yang mengembalikan notifikasi milik pengguna yang sedang login, diurutkan dari terbaru, dengan pagination dan filter status `isRead`
2. THE Notification_API SHALL menyediakan endpoint `PATCH /api/v1/notifications/:id/read` untuk menandai satu notifikasi sebagai sudah dibaca, dan `PATCH /api/v1/notifications/read-all` untuk menandai semua sebagai sudah dibaca
3. WHEN stok produk jatuh ke nol (stockout), THE System SHALL secara otomatis membuat notifikasi bertipe `STOCK_EMPTY` dengan judul dan pesan deskriptif untuk seluruh pengguna dengan role `admin` dan `staff_gudang`
4. WHEN stok produk jatuh di bawah `reorderPoint` (tapi lebih dari nol), THE System SHALL secara otomatis membuat notifikasi bertipe `STOCK_CRITICAL` untuk seluruh pengguna dengan role `admin` dan `staff_gudang`
5. WHEN rekomendasi restock baru dihasilkan oleh engine analitik, THE System SHALL membuat notifikasi bertipe `RESTOCK_RECOMMENDATION` untuk pengguna dengan role `owner` dan `admin`
6. THE Header_Component SHALL menampilkan ikon notifikasi dengan badge yang menunjukkan jumlah notifikasi yang belum dibaca — badge maks menampilkan "99+" jika jumlah > 99
7. WHEN pengguna mengklik ikon notifikasi, THE System SHALL menampilkan dropdown/panel yang menampilkan 5 notifikasi terbaru yang belum dibaca dengan link "Lihat Semua" ke halaman notifikasi
8. THE System SHALL menyediakan halaman Notifikasi yang menampilkan semua notifikasi dengan filter (Semua/Belum Dibaca/Sudah Dibaca) dan menandai semua sebagai dibaca dengan satu klik

---

### Requirement 10: Analitik Prediktif & Rekomendasi Restock

**User Story:** Sebagai Owner atau Admin, saya ingin melihat analisis prediktif berbasis data historis yang merekomendasikan kapan dan berapa banyak produk harus di-restock, sehingga keputusan pembelian didasarkan pada data bukan intuisi.

#### Acceptance Criteria

1. THE Recommendation_Engine SHALL memperbaiki bug kritis pada `RecommendationService.generateRecommendations()` di mana `upsert` menggunakan ID fiktif `'new-record'` — ganti dengan logika `upsert` yang benar menggunakan constraint `productId` + status `PENDING`
2. THE Prediction_Cron_Job SHALL berjalan setiap hari pada pukul 02.00 WIB (cron: `0 2 * * *`) untuk menghitung ulang rata-rata penjualan harian (moving average 30 hari) dan memperbarui rekomendasi restock
3. THE Recommendation_API SHALL menyediakan endpoint `GET /api/v1/recommendations` yang dapat diakses oleh `admin` dan `owner`, mengembalikan rekomendasi dengan filter status (`PENDING`, `APPROVED`, `REJECTED`, `COMPLETED`) dan sorting berdasarkan prioritas
4. THE Recommendation_API SHALL menyediakan endpoint `PATCH /api/v1/recommendations/:id/status` untuk `admin` menyetujui (`APPROVED`), menolak (`REJECTED`), atau menandai selesai (`COMPLETED`) sebuah rekomendasi
5. WHEN rekomendasi disetujui oleh Admin, THE System SHALL secara otomatis membuat draft transaksi `IN` yang dapat dilanjutkan oleh Staff Gudang sebagai purchase order
6. THE Analytics_API SHALL menyediakan endpoint `GET /api/v1/analytics/sales` yang mengembalikan data penjualan agregat per produk, per kategori, dan per periode yang dapat difilter
7. THE Analytics_API SHALL menyediakan endpoint `GET /api/v1/analytics/top-products` yang mengembalikan top N produk berdasarkan volume penjualan dan nilai revenue untuk periode tertentu
8. THE Analytics_API SHALL menyediakan endpoint `GET /api/v1/analytics/stock-health` yang mengembalikan distribusi status stok (jumlah produk aman/rendah/habis) dan estimasi hari hingga stockout per produk
9. THE System SHALL menampilkan halaman Rekomendasi dengan tabel yang menampilkan prioritas (badge warna: CRITICAL merah, HIGH oranye, MEDIUM kuning, LOW abu-abu), nama produk, stok saat ini, ROP, rata-rata penjualan harian, kuantitas rekomendasi, dan aksi (Setujui/Tolak)
10. THE System SHALL menampilkan halaman Analitik dengan grafik interaktif (menggunakan Recharts) yang menampilkan: tren penjualan, perbandingan stok masuk vs keluar, dan distribusi kategori produk

---

### Requirement 11: Identifikasi Visual — Smart Scanner

**User Story:** Sebagai Staff Gudang, saya ingin memindai produk menggunakan kamera perangkat untuk mengidentifikasi barang secara otomatis, sehingga proses input transaksi menjadi lebih cepat dan bebas dari kesalahan ketik SKU.

#### Acceptance Criteria

1. THE Scanner_Component SHALL mengaktifkan kamera perangkat (smartphone atau webcam) menggunakan library `html5-qrcode` yang sudah terpasang di project ini untuk membaca QR code dan barcode standar (EAN-13, EAN-8, Code128, QR Code)
2. WHEN barcode atau QR code berhasil dipindai, THE System SHALL mencari produk berdasarkan kode yang dipindai melalui `GET /api/v1/products/scan?code={kode}` dan mengembalikan data produk yang cocok
3. IF kode yang dipindai tidak ditemukan dalam database, THEN THE System SHALL menampilkan pesan "Produk tidak ditemukan" dengan opsi untuk melanjutkan pencarian manual
4. WHEN produk berhasil diidentifikasi melalui scanner, THE System SHALL mengisi otomatis field produk pada form transaksi aktif dan memindahkan fokus ke field kuantitas
5. THE Scanner_Component SHALL menampilkan area preview kamera dengan kotak pemandu scan dan indikator status (Mencari / Terdeteksi / Sukses)
6. THE Scanner_Component SHALL dapat diakses dari halaman form Transaksi dengan tombol "Scan Produk" yang membuka scanner dalam mode modal/overlay
7. WHERE perangkat tidak mendukung kamera atau izin kamera ditolak, THE System SHALL menampilkan pesan informatif dan menawarkan alternatif input manual tanpa crash
8. THE System SHALL mendukung mode scan beruntun untuk input multi-item: setelah satu item ditambahkan, scanner tetap aktif untuk item berikutnya tanpa harus membuka ulang

---

### Requirement 12: Landing Page & UI/UX Profesional

**User Story:** Sebagai pengunjung atau calon pengguna, saya ingin melihat landing page yang profesional dan representatif yang menjelaskan nilai INVENTRA, sehingga saya percaya untuk mendaftar dan menggunakannya.

#### Acceptance Criteria

1. THE Landing_Page SHALL menampilkan hero section dengan tagline yang jelas, sub-tagline deskriptif, dan dua tombol CTA: "Mulai Gratis" (ke halaman register) dan "Login ke Dashboard"
2. THE Landing_Page SHALL menampilkan section fitur unggulan dengan minimal 6 kartu fitur yang menjelaskan: Analitik Prediktif, Identifikasi Visual, Dashboard Real-time, Role-Based Access, Laporan Komprehensif, dan Manajemen Multi-kategori
3. THE Landing_Page SHALL menampilkan section statistik atau social proof (contoh: "99% Akurasi Stok", "3 Role Pengguna", "Real-time Analytics")
4. THE Landing_Page SHALL menampilkan section CTA akhir dan footer dengan informasi hak cipta
5. THE Landing_Page SHALL sepenuhnya responsif — tata letak berubah dari 3 kolom (desktop) ke 2 kolom (tablet) ke 1 kolom (mobile) untuk section fitur
6. THE System SHALL menggunakan Design_Token Tailwind secara konsisten di seluruh halaman — tidak ada hardcoded warna hex atau nilai spacing non-standar
7. THE System SHALL menyediakan komponen Atom yang lengkap dan reusable: `Button` (variant: primary/secondary/outline/ghost/danger, size: sm/md/lg), `Input`, `Textarea`, `Select`, `Badge`, `Avatar`, `Spinner`, `Card`, `Typography`, `Tooltip`, `Modal`, `Dropdown`
8. THE System SHALL menyediakan komponen Molecule yang reusable: `FormField` (label + input + error message), `SearchBar`, `Pagination`, `DataTable`, `StockBadge`, `StatCard`, `ProductCard`
9. THE System SHALL memastikan seluruh komponen interaktif memiliki: state loading, state error, state empty (dengan ilustrasi informatif), dan state sukses yang tepat
10. WHEN halaman dimuat pada layar mobile (lebar < 768px), THE System SHALL menampilkan sidebar navigasi yang dapat dibuka/tutup (drawer pattern) bukan sidebar tetap
11. THE System SHALL mematuhi standar aksesibilitas WCAG AA: semua elemen interaktif memiliki `aria-label` atau `aria-labelledby`, kontras warna teks minimum 4.5:1, dan navigasi keyboard lengkap untuk form dan modal
12. THE System SHALL menggunakan Next.js Image component untuk semua gambar dengan `alt` text yang deskriptif dan lazy loading otomatis

---

### Requirement 13: Laporan & Ekspor Data

**User Story:** Sebagai Owner atau Admin, saya ingin mengekspor data inventori dan transaksi dalam format yang dapat dibuka di spreadsheet, sehingga data dapat dianalisis lebih lanjut atau disertakan dalam laporan bisnis.

#### Acceptance Criteria

1. THE System SHALL menyediakan endpoint `GET /api/v1/reports/inventory` yang menghasilkan snapshot inventori saat ini dalam format JSON, dapat difilter berdasarkan kategori dan status stok
2. THE System SHALL menyediakan endpoint `GET /api/v1/reports/transactions` yang menghasilkan rangkuman transaksi untuk rentang tanggal tertentu, dapat difilter berdasarkan tipe transaksi
3. WHEN pengguna mengklik tombol "Export CSV" pada halaman Inventori atau Transaksi, THE System SHALL meng-generate file CSV yang dapat diunduh langsung oleh browser tanpa reload halaman
4. THE CSV export untuk inventori SHALL berisi kolom: SKU, Nama Produk, Kategori, Stok Saat Ini, Min Stok, Reorder Point, Nilai Stok (stok × harga beli), Status Stok
5. THE CSV export untuk transaksi SHALL berisi kolom: Kode Transaksi, Tipe, Tanggal, Dibuat Oleh, Total Item, Total Nilai, Catatan
6. WHERE fitur export diakses oleh `staff_gudang`, THE System SHALL membatasi ekspor hanya untuk data yang relevan dengan operasional (inventory dan transaksi) — bukan data keuangan sensitif seperti harga beli
7. THE System SHALL menampilkan indikator loading saat file CSV sedang di-generate dan tombol export harus di-disable selama proses berlangsung untuk mencegah double-click

---

### Requirement 14: Validasi, Error Handling & State Management

**User Story:** Sebagai pengguna sistem, saya ingin aplikasi yang memberikan feedback yang jelas atas setiap tindakan — baik sukses maupun gagal — sehingga saya selalu tahu apa yang terjadi dan apa yang harus dilakukan selanjutnya.

#### Acceptance Criteria

1. THE System SHALL menampilkan toast notification (non-blocking) untuk konfirmasi aksi yang berhasil: "Produk berhasil ditambahkan", "Transaksi berhasil disimpan", dsb. — toast menghilang otomatis setelah 3 detik
2. IF validasi form gagal di sisi client, THEN THE System SHALL menampilkan pesan error di bawah field yang bermasalah secara inline — tidak menggunakan alert() browser
3. IF request API gagal dengan error 4xx, THEN THE System SHALL menampilkan pesan error yang ramah pengguna dari response body API — bukan pesan error teknis
4. IF request API gagal dengan error 5xx atau network error, THEN THE System SHALL menampilkan toast error dengan pesan generik "Terjadi kesalahan server. Silakan coba lagi"
5. THE System SHALL menampilkan skeleton loading component pada tabel dan kartu data saat data sedang di-fetch pertama kali — bukan spinner penuh layar
6. THE System SHALL menampilkan komponen empty state dengan ilustrasi dan teks deskriptif ketika tabel atau daftar tidak memiliki data (contoh: "Belum ada produk. Tambahkan produk pertama Anda")
7. WHEN pengguna mengklik tombol aksi yang bersifat destruktif (hapus kategori, tolak pengguna, nonaktifkan akun), THE System SHALL menampilkan dialog konfirmasi modal dengan deskripsi dampak aksi sebelum melanjutkan
8. THE Backend_Error_Handler SHALL mengembalikan response error yang terstruktur: `{ success: false, message: string, errors?: ValidationError[] }` dengan HTTP status code yang tepat untuk semua jenis error (400, 401, 403, 404, 409, 422, 500)
9. THE System SHALL mengimplementasikan global error boundary di React yang menangkap unhandled error dan menampilkan halaman error fallback yang informatif — tidak menampilkan blank screen
10. THE Zustand_Store SHALL menyimpan state autentikasi (user info, access token, isAuthenticated) secara persistent menggunakan `zustand/middleware/persist` dengan localStorage sebagai storage

---

### Requirement 15: Keamanan & Performa

**User Story:** Sebagai Owner, saya ingin sistem yang aman dan responsif, sehingga data bisnis saya terlindungi dan aplikasi tidak melambat saat digunakan secara bersamaan oleh seluruh tim.

#### Acceptance Criteria

1. THE API SHALL mengimplementasikan rate limiting pada endpoint autentikasi (`/auth/login`, `/auth/register`): maksimal 10 request per IP per menit — kembalikan HTTP 429 jika terlampaui
2. THE API SHALL memvalidasi seluruh input menggunakan Zod schema di layer middleware sebelum sampai ke controller — tidak ada request body yang menyentuh service tanpa validasi
3. THE System SHALL mengimplementasikan Content Security Policy (CSP) header pada response Next.js untuk mencegah XSS
4. THE System SHALL menggunakan Prisma query dengan parameterized values untuk seluruh interaksi database — tidak ada string interpolation dalam query SQL
5. THE System SHALL mengimplementasikan lazy loading (dynamic import) untuk halaman-halaman berat seperti Analytics dan halaman dengan grafik
6. THE System SHALL mengimplementasikan `staleTime` dan `gcTime` yang tepat pada React Query untuk meminimalkan re-fetch yang tidak perlu: data inventory stale setelah 30 detik, data dashboard stale setelah 60 detik
7. THE Backend SHALL mengimplementasikan pagination pada seluruh endpoint `GET` yang mengembalikan list — tidak ada endpoint yang mengembalikan semua record tanpa batasan
8. IF sebuah request ke API membutuhkan waktu lebih dari 10 detik untuk merespons, THEN THE System SHALL timeout dan mengembalikan HTTP 503 dengan pesan yang sesuai
9. THE System SHALL memastikan tidak ada data sensitif (password hash, refresh token) yang dikembalikan dalam response API manapun

