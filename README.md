# Colliers360 LATAM

Plataforma de gestión de portafolios inmobiliarios comerciales para mercados hispanohablantes de América Latina.

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript |
| Auth | Firebase Authentication + NextAuth.js |
| Database | PostgreSQL (Google Cloud SQL) + Prisma ORM |
| Storage | Google Cloud Storage |
| Deploy | Firebase App Hosting → Cloud Run |
| UI | Tailwind CSS + Radix UI (shadcn/ui) |
| Data fetching | TanStack Query |

## Arquitectura multi-tenant

```
Organization (Colliers LATAM)
└── BusinessUnit (por país: MX, CO, CL, PE, AR…)
    └── User (roles: SUPER_ADMIN | ADMIN | MANAGER | BROKER | READONLY)
```

Cada unidad de negocio es aislada: los usuarios solo ven datos de su propio país.

## Módulos

1. **Dashboard & Analytics** — KPIs del portafolio, actividad reciente
2. **WorkTrac (IWMS)** — Gestión de propiedades, contratos, transacciones, proyectos y finanzas
3. **Equipo** — Discusiones, documentos y flujos de aprobación por unidad de negocio

## Setup local

```bash
# 1. Clonar e instalar
git clone https://github.com/kilme/colliers360-latam
cd colliers360-latam
npm install

# 2. Variables de entorno
cp .env.example .env.local
# Completar con credenciales de Firebase y Cloud SQL

# 3. Base de datos
npm run db:generate
npm run db:push

# 4. Dev server
npm run dev
```

## Deploy

```bash
firebase deploy
```

El proyecto usa Firebase App Hosting, que compila Next.js y despliega en Cloud Run automáticamente.

## Variables de entorno requeridas

Ver [.env.example](.env.example)
