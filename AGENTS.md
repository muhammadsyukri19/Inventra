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
