# Scrybe

## Descripción

Scrybe es una aplicación web orientada a la gestión estructurada de contenido personal, permitiendo crear, organizar y gestionar notas, categorías y recursos de forma flexible y mantenible.

El proyecto está diseñado con un enfoque en escalabilidad, mantenibilidad y separación clara de responsabilidades, priorizando una arquitectura modular y desacoplada desde las primeras fases de desarrollo.

---

## Estado del proyecto

- Desarrollo activo
- Backend principal implementado
- Frontend principal implementado
- API REST documentada mediante OpenAPI
- Testing manual mediante Bruno
- Infraestructura local basada en Docker + Supabase CLI

### Funcionalidades actuales

#### Backend

| Módulo | Descripción |
|---|---|
| auth | Autenticación JWT mediante Supabase Auth |
| profile | Consulta y actualización de perfil |
| files | Subida y gestión de archivos |
| categories | CRUD de categorías |
| tags | CRUD de etiquetas |
| contents | CRUD de notas, papelera, restauración y eliminación permanente |
| content_tags | Asociación contenido ↔ etiquetas |
| content_files | Asociación contenido ↔ archivos |

#### Frontend

| Feature | Descripción |
|---|---|
| auth | Login y registro |
| dashboard | Panel principal con estadísticas y accesos rápidos |
| contents | Gestión, navegación y visualización de notas, favoritas y papelera |
| categories | Gestión visual de categorías |
| profile | Configuración de perfil y avatar |
| editor | Editor rich text basado en TipTap |
| i18n | Soporte multidioma ES / EN |
| preferences | Persistencia local de preferencias |

---

## Stack tecnológico

### Backend

- Go
- chi
- PostgreSQL
- Supabase
- Supabase Auth (JWT + JWKS)
- Supabase Storage

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- TanStack Query
- React Router
- TipTap
- react-i18next

### Documentación e infraestructura

- OpenAPI
- Swagger UI
- Bruno
- Docker
- Supabase CLI

---

## Arquitectura

El proyecto sigue una arquitectura modular basada en un enfoque hexagonal ligero.

### Backend

La estructura principal se divide en:

- domain → lógica de negocio y contratos
- application → casos de uso y validaciones
- infrastructure → acceso a base de datos, storage y servicios externos
- delivery → handlers HTTP y DTOs

Supabase se utiliza exclusivamente como infraestructura y no como sustituto de la lógica de aplicación.

### Frontend

El frontend sigue una organización modular por features:

- auth
- contents
- categories
- dashboard
- profile
- files

Además, se separan:

- componentes compartidos
- hooks reutilizables
- utilidades
- preferencias
- providers
- layouts

---

## Estructura del proyecto

```text
apps/
  api/
    internal/
      <module>/
        domain/
        application/
        infrastructure/
        delivery/

  web/
    src/
      features/
      shared/
      layouts/
      app/

docs/
  api/
  bruno/

supabase/
```

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

## Servicios disponibles

| Servicio | URL |
|---|---|
| API | http://localhost:8081 |
| Health | http://localhost:8081/api/v1/health |
| Swagger UI | http://localhost:8082 |
| Frontend | http://localhost:5173 |
| Supabase Studio | http://127.0.0.1:54323 |

---

## Documentación API y testing

### OpenAPI

```text
docs/api/src/openapi.yaml
```

### Swagger UI

```text
http://localhost:8082
```

### Bruno

```text
docs/bruno
```

La colección Bruno contiene ejemplos preparados para testing manual de autenticación, contenidos, categorías, archivos, etiquetas y relaciones.

---

## Funcionalidades destacadas

- Autenticación JWT integrada
- Arquitectura modular desacoplada
- CRUD completo de notas
- Sistema de categorías
- Notas fijadas
- Papelera y restauración
- Editor rich text con TipTap
- Upload y asociación de archivos
- Búsqueda y filtrado de contenidos
- Dashboard con estadísticas
- Soporte multidioma
- Tema claro y oscuro
- OpenAPI + Swagger UI
- Testing manual con Bruno

---

## Próximas mejoras

- Gestión visual de archivos
- Gestión visual de etiquetas
- Persistencia remota de preferencias

---

## Filosofía del proyecto

- Código limpio y mantenible
- Separación clara de responsabilidades
- Contratos consistentes entre capas
- Escalabilidad desde la base
- Evitar dependencias innecesarias
- Priorizar simplicidad y mantenibilidad
