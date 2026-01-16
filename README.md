## Description

Backend de una billetera virtual desarrollado como proyecto de práctica profesional, enfocado en **buenas prácticas de backend**, **TDD**, **CI**, y **arquitectura limpia**.

El objetivo del proyecto es simular un entorno real de trabajo backend utilizando NestJS, PostgreSQL y Prisma.

---

## Stack tecbológico

- **Node.js**
- **NestJS**
- **TypeScript**
- **PostgreSQL (Docker)**
- **Prisma ORM (v7 + adapter-pg)**
- **Jest (unit y e2e tests)**
- **ESLint + Prettier**
- **GitHub Actions (CI)**

---


## 🧱 Arquitectura y buenas prácticas

- Separación de responsabilidades (controllers / services / modules)
- **TDD**: tests unitarios antes del código
- Tests unitarios sin base de datos (mocking)
- Preparado para tests e2e con base real
- Manejo explícito de errores (type guards, sin `any`)
- CI obligatorio antes de merge a `master`

---

## 📋 Requisitos

- Node.js **18+**
- Docker y Docker Compose
- npm

---

## ⚙️ Setup local

Instalar dependencias:

```bash
npm install 

Crear archivo .env basado en .env.example:

DATABASE_URL=postgresql://postgres:postgres@localhost:5432/trainee_wallet
🐘 Base de datos (PostgreSQL con Docker)
Levantar base de datos:

docker compose up -d


Detener:

docker compose down

Ver logs:

docker logs -f trainee_wallet_postgres
🧬 Prisma
Este proyecto usa Prisma v7 con PostgreSQL adapter.

Generar cliente:

npm run prisma:generate

Ejecutar migraciones:

npx prisma migrate dev

Abrir Prisma Studio:

npx prisma studio

Nota: Prisma v7 utiliza prisma.config.ts para la configuración del datasource.

▶️ Ejecutar la aplicación
Modo desarrollo:

npm run start:dev

La API quedará disponible en:

http://localhost:3000
🧪 Testing
Unit tests
npm run test
Test coverage
npm run test:cov
Los tests unitarios no dependen de la base de datos.

🔄 CI / CD
GitHub Actions ejecuta:

npm run lint

npm run test

No se permite merge a master si el CI falla

```

## 🧑‍💻 Autor
Proyecto desarrollado con fines educativos y de práctica profesional.


---