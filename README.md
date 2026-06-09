# Sistem Manajemen Inventaris Modular

## Mata Kuliah

Perangkat Lunak Berbasis Komponen (PLBK)

## Anggota Kelompok

* Muhammad Azani Irvand
* Muhammad Syukri
* Razian Sabri

---

# Deskripsi Sistem

Sistem Manajemen Inventaris Modular merupakan aplikasi berbasis web yang dirancang untuk membantu pengelolaan inventaris secara efektif, efisien, dan terstruktur.

Sistem ini tidak hanya menyediakan fungsi pencatatan stok dan transaksi, tetapi juga dilengkapi dengan komponen analitik penjualan, rekomendasi restock otomatis, serta notifikasi real-time untuk membantu pengambilan keputusan berbasis data.

Melalui pendekatan modular dan component-based architecture, setiap fitur dikembangkan sebagai komponen independen yang dapat digunakan kembali (reusable), dipelihara dengan mudah (maintainable), serta dikembangkan lebih lanjut tanpa memengaruhi modul lainnya.

---

# Latar Belakang

Permasalahan umum dalam pengelolaan inventaris meliputi:

* Overstock yang menyebabkan pemborosan biaya penyimpanan
* Stockout yang menyebabkan kehilangan peluang penjualan
* Kesalahan pencatatan manual
* Sulitnya menentukan jumlah restock yang optimal
* Kurangnya sistem monitoring stok secara real-time

Untuk mengatasi masalah tersebut, dibangunlah sistem inventaris yang mengintegrasikan pengelolaan stok dengan analitik penjualan dan sistem rekomendasi otomatis.

---

# Tujuan Sistem

1. Membantu pengelolaan inventaris secara digital.
2. Mengurangi risiko stockout dan overstock.
3. Menyediakan rekomendasi restock berbasis data historis.
4. Memberikan notifikasi stok kritis secara real-time.
5. Mendukung pengambilan keputusan berbasis data (Decision Support System).

---

# Penerapan Konsep Perangkat Lunak Berbasis Komponen

Sistem ini dirancang menggunakan prinsip-prinsip Component-Based Software Engineering (CBSE).

## Reusability

Setiap fitur dikembangkan sebagai komponen independen yang dapat digunakan kembali pada modul lain.

Contoh:

* Product Card
* Notification Card
* Analytics Chart
* Dashboard Widget
* Transaction Form

---

## Modularity

Sistem dibagi menjadi beberapa modul utama:

* Product Module
* Transaction Module
* Analytics Module
* Notification Module

Masing-masing modul memiliki tanggung jawab yang jelas dan dapat dikembangkan secara independen.

---

## Loose Coupling

Setiap komponen hanya berinteraksi melalui interface dan service yang telah ditentukan.

Keuntungan:

* Mudah dipelihara
* Mudah diuji
* Mudah diganti tanpa memengaruhi modul lain

---

## High Cohesion

Setiap modul memiliki fokus fungsi yang spesifik.

Contoh:

Analytics Module hanya menangani:

* Analisis penjualan
* Perhitungan reorder point
* Rekomendasi restock

---

# Arsitektur Sistem

Sistem menggunakan arsitektur Three-Layer Architecture.

## Presentation Layer

Berfungsi sebagai antarmuka pengguna.

Tanggung jawab:

* Menampilkan dashboard
* Menampilkan data stok
* Menampilkan rekomendasi
* Menampilkan notifikasi

---

## Business Logic Layer

Berisi seluruh proses bisnis sistem.

Tanggung jawab:

* Validasi data
* Perhitungan reorder point
* Analisis histori penjualan
* Pengelolaan notifikasi

---

## Data Layer

Bertanggung jawab terhadap penyimpanan data.

Tanggung jawab:

* Data produk
* Data transaksi
* Data stok
* Data histori penjualan

---

# Modul Sistem

## Product Module

Fungsi:

* Kelola produk
* Kelola kategori
* Kelola stok

Komponen utama:

* ProductForm
* ProductCard
* ProductTable

---

## Transaction Module

Fungsi:

* Pencatatan penjualan
* Pencatatan pembelian
* Histori transaksi

Komponen utama:

* TransactionForm
* TransactionTable
* TransactionDetail

---

## Analytics Module

Fungsi:

* Analisis penjualan
* Perhitungan reorder point
* Prediksi kebutuhan stok

Komponen utama:

* SalesChart
* AnalyticsDashboard
* RecommendationCard

---

## Notification Module

Fungsi:

* Monitoring stok
* Alert stok kritis
* Notifikasi restock

Komponen utama:

* NotificationCenter
* AlertCard
* StockWarningBadge

---

# Alur Sistem

1. Admin mencatat transaksi.
2. Data transaksi disimpan ke database.
3. Sistem menganalisis histori penjualan.
4. Sistem menghitung reorder point.
5. Sistem menghasilkan rekomendasi restock.
6. Dashboard menampilkan hasil analisis.
7. Notifikasi dikirim jika stok mencapai batas minimum.

---

# Struktur Komponen

Sistem menerapkan Atomic Design.

components/

├── atoms/
│ ├── Button
│ ├── Input
│ ├── Badge
│ └── Icon
│
├── molecules/
│ ├── ProductCard
│ ├── AlertCard
│ └── TransactionItem
│
├── organisms/
│ ├── ProductManagement
│ ├── AnalyticsDashboard
│ ├── NotificationCenter
│ └── TransactionManagement
│
├── templates/
│ ├── DashboardTemplate
│ ├── ProductTemplate
│ └── AnalyticsTemplate

---

# Teknologi yang Digunakan

Frontend

* React
* Next.js
* TypeScript
* Tailwind CSS

Backend

* Node.js
* Express.js

Database

* MySQL / PostgreSQL

State Management

* Zustand

Data Fetching

* React Query

---

# Keunggulan Sistem

* Modular dan scalable
* Mudah dikembangkan
* Reusable component
* Analitik berbasis data historis
* Monitoring stok real-time
* Notifikasi otomatis
* Mendukung Decision Support System
* Cocok untuk UMKM maupun skala bisnis yang lebih besar

---

# Manfaat Sistem

## Bagi Pengguna

* Mengurangi risiko stockout
* Mengurangi overstock
* Mempercepat pengelolaan inventaris
* Mempermudah monitoring stok

## Bagi Organisasi

* Pengambilan keputusan lebih akurat
* Efisiensi operasional meningkat
* Pengelolaan inventaris lebih terstruktur
* Mengurangi kesalahan manusia

---

# Kesimpulan

Sistem Manajemen Inventaris Modular merupakan implementasi nyata dari konsep Perangkat Lunak Berbasis Komponen (PLBK) yang menerapkan prinsip modularitas, reusability, loose coupling, dan high cohesion.

Dengan memanfaatkan komponen independen yang dapat digunakan kembali, sistem menjadi lebih mudah dikembangkan, dipelihara, dan diperluas di masa mendatang. Integrasi modul analitik penjualan, rekomendasi restock otomatis, dan notifikasi real-time memberikan nilai tambah dalam mendukung pengambilan keputusan berbasis data.
