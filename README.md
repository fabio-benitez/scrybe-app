# Scrybe

## Descripción

Scrybe es una aplicación web orientada a la gestión estructurada de contenido personal, como notas, archivos y otros recursos, permitiendo organizar la información de forma flexible y mantenible.

El proyecto está diseñado con un enfoque en escalabilidad, mantenibilidad y separación clara de responsabilidades, priorizando una base sólida antes de añadir funcionalidades avanzadas.

## Estado del proyecto

- Desarrollo activo
- API REST en Go operativa (módulos principales completados)
- Autenticación JWT integrada (Supabase Auth + JWKS)
- Base de datos PostgreSQL gestionada con Supabase
- Documentación OpenAPI disponible
- Colección Bruno para testing manual
- Frontend en desarrollo (auth + i18n base implementados)

### Funcionalidad actual

#### Backend

| Módulo          | Descripción |
|-----------------|------------|
| profile         | Consulta y actualización de perfil |
| files           | Subida y gestión de archivos |
| categories      | CRUD de categorías |
| tags            | CRUD de etiquetas |
| contents        | CRUD de contenidos/notas |
| content_tags    | Asociación contenido ↔ tags (replace completo) |
| content_files   | Asociación contenido ↔ archivos (replace completo) |

#### Frontend

| Módulo | Descripción |
|--------|------------|
| auth   | Login / Register con validación |
| i18n   | Soporte ES / EN con persistencia |

---

## Stack tecnológico

- Backend: Go (API REST)
- Frontend: React + TypeScript (Vite)
- UI: Tailwind CSS + shadcn/ui
- i18n: i18next + react-i18next
- Base de datos: PostgreSQL (Supabase)
- Autenticación: Supabase Auth (JWT + JWKS)
- Router HTTP: chi
- Storage: Supabase Storage
- Documentación API: OpenAPI (Swagger UI)
- Testing manual: Bruno
- Infraestructura local: Docker + Supabase CLI

---

## Requisitos

- Node.js: https://nodejs.org  
- Docker Desktop: https://www.docker.com/products/docker-desktop/  
- Go (>= 1.22): https://go.dev/  
- Supabase CLI: https://supabase.com/docs/guides/local-development/cli/getting-started  

---

## Instalación y ejecución en local

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd scrybe-app
```

### 2. Levantar Supabase

```bash
npx supabase start
```

### 3. Configurar variables de entorno

Crear `.env` a partir de `.env.example`.

```env
# Docker
DATABASE_URL=postgresql://postgres:postgres@host.docker.internal:54322/postgres?sslmode=disable

# Local
# DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres?sslmode=disable
```

### 4. Levantar la API

```bash
docker compose up --build -d
```

o:

```bash
cd apps/api
go run ./cmd/api
```

### 5. Levantar el frontend

```bash
cd apps/web
npm install
npm run dev
```

---

## Uso de la API

Colección Bruno:

```text
docs/bruno
```

### Flujo básico

1. Sign Up (`/auth/v1/signup`) → Supabase Auth
2. Login (`/auth/v1/token`) → Supabase Auth
3. Guardar `access_token`
4. Crear recursos base (categories, tags, files, contents)
5. Usar relaciones (`content_tags`, `content_files`)

---

## Documentación de la API

- OpenAPI: `docs/api/openapi.yaml`
- Swagger UI: http://localhost:8082

---

## Servicios disponibles

- API: http://localhost:8081  
- Health: http://localhost:8081/api/v1/health  
- Swagger: http://localhost:8082  
- Frontend: http://localhost:5173  
- Supabase Studio: http://127.0.0.1:54323  

---

## Arquitectura

Arquitectura modular basada en un enfoque hexagonal ligero.

### Capas (backend)

- domain → lógica de negocio
- application → casos de uso
- infrastructure → DB, storage, servicios externos
- delivery → HTTP (handlers)

Supabase se utiliza exclusivamente como infraestructura.

El frontend sigue una estructura modular por features.

---

## Estructura del proyecto

```text
apps/
  api/
    internal/
      <modulo>/
        domain/
        application/
        infrastructure/
        delivery/
  web/

docs/
  api/
  bruno/

supabase/
```

---

## Filosofía

- Código limpio y desacoplado
- Sin lógica en handlers ni infraestructura
- Contratos claros entre capas
- Diseño preparado para escalar sin refactorizaciones agresivas
