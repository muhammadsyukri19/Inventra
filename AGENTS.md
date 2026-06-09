# AGENT.md

# Universal Engineering Rules

Version: 1.0

---

# Core Philosophy

Setiap keputusan dalam proyek harus mengutamakan:

1. Scalability
2. Maintainability
3. Reusability
4. Readability
5. Consistency
6. Separation of Concerns
7. Component-Based Architecture

Prioritaskan kode yang mudah dipahami developer lain dibanding kode yang terlihat pintar.

---

# Technology Principles

Preferred Stack:

* Next.js
* TypeScript
* Tailwind CSS
* React Query
* Zustand
* Zod
* React Hook Form

---

# General Rules

## Wajib

✓ TypeScript Strict Mode

✓ ESLint

✓ Prettier

✓ Husky

✓ Conventional Commit

✓ Responsive Design

✓ Accessibility

✓ Reusable Components

✓ Feature-Based Architecture

✓ Atomic Design

---

## Dilarang

✗ any

✗ console.log pada production

✗ nested ternary

✗ duplicated code

✗ hardcoded API URL

✗ hardcoded color

✗ magic numbers

✗ inline styling

✗ direct API call di component

✗ business logic di UI component

---

# Project Architecture

src/

├── app/
│
├── components/
│   ├── atoms/
│   ├── molecules/
│   ├── organisms/
│   ├── templates/
│
├── features/
│
├── services/
│
├── hooks/
│
├── stores/
│
├── types/
│
├── constants/
│
├── libs/
│
├── assets/
│
├── styles/
│
└── utils/

---

# Feature-Based Architecture

Setiap domain bisnis wajib dipisahkan.

Contoh:

features/

├── auth/
├── marketplace/
├── dashboard/
├── traceability/
├── user/
└── analytics/

Setiap feature dapat memiliki:

features/
└── marketplace/
├── components/
├── hooks/
├── services/
├── types/
├── constants/
└── utils/

---

# Atomic Design Architecture

Hierarchy:

Atoms
↓
Molecules
↓
Organisms
↓
Templates
↓
Pages

Dependency hanya boleh ke bawah.

Contoh:

Atoms ❌ tidak boleh import Molecules

Molecules ❌ tidak boleh import Organisms

Organisms ❌ tidak boleh import Templates

Templates ❌ tidak boleh import Pages

---

# ATOMS

Definisi:

Komponen UI paling kecil dan reusable.

Contoh:

Button
Input
Badge
Avatar
Icon
Label

Boleh:

✓ className

✓ variant

✓ size

✓ state sederhana

Dilarang:

✗ fetch API

✗ useQuery

✗ useMutation

✗ business logic

✗ global state

Target maksimal:

100 LOC

---

# MOLECULES

Definisi:

Gabungan beberapa atom.

Contoh:

SearchBar
ProductCard
UserCard
FormField

Boleh:

✓ local UI state

✓ callback props

✓ composition

Dilarang:

✗ API call

✗ React Query

✗ Zustand

✗ business logic

Target maksimal:

200 LOC

---

# ORGANISMS

Definisi:

Komponen besar yang merepresentasikan satu section.

Contoh:

ProductGrid
DashboardContent
MarketplaceSection
FarmerProfileSection

Boleh:

✓ React Query

✓ Zustand

✓ local state

✓ loading state

✓ error state

✓ empty state

Dilarang:

✗ fetch langsung

✗ layout page

Target maksimal:

400 LOC

---

# TEMPLATES

Definisi:

Menyusun beberapa organisms menjadi satu halaman.

Contoh:

DashboardTemplate
MarketplaceTemplate
LandingPageTemplate

Tugas:

* orchestration
* layout arrangement
* feature composition

Tidak boleh mengandung business logic kompleks.

---

# Component Rules

## Wajib Composition Pattern

Benar:

<Card>
  <CardHeader />
  <CardBody />
  <CardFooter />
</Card>

Salah:

<Card
title=""
subtitle=""
footer=""
image=""
badge=""
action=""
/>

---

# Smart vs Dumb Components

## Dumb Component

Hanya UI.

Contoh:

ProductCard

Button

Badge

Avatar

Tidak tahu sumber data.

---

## Smart Component

Mengatur data dan logic.

Contoh:

MarketplaceContainer

DashboardContainer

ProductListContainer

---

# Container Pattern

Pisahkan logic dan UI.

Benar:

ProductListContainer.tsx

↓

ProductList.tsx

Container:

* fetch data
* pagination
* filtering

Presentation:

* render UI

---

# Component Folder Structure

Setiap komponen besar:

ProductCard/

├── ProductCard.tsx
├── ProductCard.types.ts
├── ProductCard.test.tsx
├── ProductCard.stories.tsx
└── index.ts

---

# Naming Convention

## Folder

kebab-case

Contoh:

product-card

marketplace-filter

impact-dashboard

---

## Component

PascalCase

Contoh:

ProductCard.tsx

MarketplaceFilter.tsx

---

## Hooks

useSomething

Contoh:

useAuth.ts

useProducts.ts

---

## Utility

camelCase

Contoh:

formatCurrency.ts

calculateImpact.ts

---

## Types

PascalCase

Contoh:

Product.ts

User.ts

MarketplaceFilter.ts

---

## Constants

UPPER_SNAKE_CASE

Contoh:

USER_ROLE

PRODUCT_STATUS

API_ENDPOINT

---

# State Management Rules

## useState

Gunakan untuk:

* modal
* tabs
* dropdown
* form state sederhana

---

## Context

Gunakan untuk:

* theme
* auth context kecil

Jangan untuk data server.

---

## Zustand

Gunakan untuk:

* global UI state
* auth session
* persistent state

---

## React Query

Gunakan untuk:

* server state
* API cache
* mutations

Semua request API wajib menggunakan React Query.

---

# API Rules

Semua request wajib melalui services.

services/

auth.service.ts

product.service.ts

user.service.ts

Salah:

Component
↓
fetch()

Benar:

Component
↓
hook
↓
service
↓
api

---

# Design System Rules

## Color

Gunakan token.

Benar:

text-primary

bg-surface

border-default

Salah:

text-[#6B3E3D]

bg-[#FFFFFF]

---

## Spacing Scale

4
8
12
16
24
32
48
64

Jangan menggunakan angka random.

---

## Border Radius

sm = 8

md = 12

lg = 16

xl = 24

---

## Shadow Rules

Gunakan hanya untuk:

* Modal
* Dropdown
* Floating Card

Selain itu gunakan border.

---

# Accessibility Rules

Minimal WCAG AA.

Wajib:

✓ aria-label

✓ semantic HTML

✓ keyboard navigation

✓ focus state

✓ alt image

✓ sufficient contrast

---

# Performance Rules

Wajib:

✓ lazy loading

✓ dynamic import

✓ image optimization

✓ code splitting

✓ memoization bila diperlukan

Dilarang:

✗ premature optimization

✗ over memoization

✗ unnecessary useMemo

✗ unnecessary useCallback

---

# Testing Rules

Minimal:

* Unit Test untuk utility
* Component Test untuk component penting
* Integration Test untuk flow utama

Target Coverage:

70%+

---

# Documentation Rules

Semua component publik wajib memiliki JSDoc.

Contoh:

/**

* ProductCard
*
* Menampilkan informasi produk marketplace.
  */

---

# Git Workflow

Branch:

feature/

bugfix/

hotfix/

refactor/

docs/

test/

Contoh:

feature/product-marketplace

feature/user-dashboard

bugfix/login-error

---

# Commit Convention

feat:

fix:

refactor:

style:

docs:

test:

chore:

Contoh:

feat(product): add marketplace card

fix(auth): handle refresh token

---

# Golden Rules

1. Reuse sebelum membuat baru.
2. Jangan duplikasi component.
3. Jangan duplikasi business logic.
4. Semua API melalui service layer.
5. Semua server state melalui React Query.
6. Gunakan TypeScript strict.
7. Hindari any.
8. Gunakan design token.
9. Hindari hardcoded value.
10. Pisahkan UI dan logic.
11. Utamakan composition.
12. Atomic Design wajib dipatuhi.
13. Feature-based architecture wajib dipatuhi.
14. Setiap component memiliki satu tanggung jawab.
15. Optimasi hanya jika diperlukan.
16. Accessibility bukan fitur tambahan.
17. Responsive design wajib sejak awal.
18. Dokumentasi adalah bagian dari development.
19. Kode harus mudah dibaca developer lain.
20. Bangun sistem yang dapat berkembang tanpa rewrite besar.

---

# Project Vision: INVENTRA

**Judul Sistem**: *Sistem Manajemen Inventaris: Integrasi Analitik Prediktif untuk Rekomendasi Restock dan Identifikasi Visual.*

**Inventra** dirancang sebagai solusi manajemen inventaris cerdas yang tidak sekadar mencatat masuk-keluarnya barang secara konvensional. Sistem ini mengadopsi teknologi *Machine Learning* (Analitik Prediktif) dan *Computer Vision* (Identifikasi Visual) untuk meminimalisasi *human-error*, mencegah kehabisan stok, serta mengotomatisasi proses bisnis pergudangan dan *retail*.

## Arsitektur & Fungsionalitas Saat Ini
1. **Autentikasi & Otorisasi**: Implementasi standar JWT terpusat dengan *Role-Based Access Control* (Admin, Staff Gudang, Owner).
2. **Sistem Approval Pengguna**: Pendaftaran mandiri (*Self-Registration*) dengan validasi Admin. Akun baru berstatus *Pending* dan harus di-Approve oleh Admin di *Dashboard* sebelum bisa login.
3. **Tech Stack**: Next.js (Frontend), Tailwind CSS, Node.js + Express (Backend), Prisma ORM, PostgreSQL.

## Roadmap & Fitur Selanjutnya (Future Features)
1. **Modul Core Inventory (Manajemen Barang & Stok)**
   * Sistem CRUD untuk Master Data Barang (SKU, Kategori, Harga, Lokasi Rak).
   * Pencatatan transaksi stok masuk (Inbound) dan stok keluar (Outbound).
   
2. **Identifikasi Visual (Computer Vision / AI)**
   * Fitur pemindaian produk langsung menggunakan kamera perangkat (Smartphone/Webcam).
   * Sistem secara otomatis mengenali produk berdasarkan bentuk fisik atau kemasan untuk mempercepat *data-entry* tanpa bergantung sepenuhnya pada *barcode scanner* fisik.

3. **Analitik Prediktif & Rekomendasi Restock (Machine Learning)**
   * Menganalisis pola historis mutasi barang/penjualan untuk memprediksi kapan stok tertentu akan habis (*Stockout Prediction*).
   * Sistem memberikan rekomendasi jumlah *restock* (*Reorder Point & Quantity*) yang optimal berdasarkan algoritma *Machine Learning*.

4. **Role-Based Dashboard & Reporting Terintegrasi**
   * **Admin**: Kontrol penuh untuk manajemen pengguna dan konfigurasi global.
   * **Staff Gudang**: *Interface* yang dikhususkan untuk operasional harian (*scan* barang masuk/keluar).
   * **Owner**: Antarmuka *Business Intelligence* yang menampilkan metrik aset, kesehatan bisnis, serta tren dan rekomendasi AI.

5. **Notifikasi Pintar (Real-Time)**
   * Peringatan stok menipis (*Low-Stock Alert*) yang terintegrasi dengan prediksi AI.
   * Laporan ringkasan mingguan/bulanan otomatis.
