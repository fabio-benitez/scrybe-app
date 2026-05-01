# Scrybe

## Descripción

Scrybe es una aplicación web en desarrollo orientada a la gestión estructurada de contenido personal (notas, archivos, enlaces, etc.).

Actualmente el proyecto se centra en la construcción de una base sólida a nivel de backend, incluyendo API, autenticación, base de datos y arquitectura, con el objetivo de evolucionar hacia una herramienta escalable y mantenible.

---

## Estado del proyecto

- El proyecto se encuentra en fase activa de desarrollo
- API en Go operativa
- Supabase configurado en entorno local
- Autenticación JWT integrada (Supabase Auth + JWKS)
- Perfil de usuario (`user_profiles`) sincronizado con `auth.users`
- Endpoints de health disponibles
- Módulo `profile`:
  - `GET /profile`
  - `PATCH /profile`
- Módulo `files`:
  - `POST /files` → subida de archivos
  - `GET /files/{file_id}` → obtención de metadata
- Documentación mediante OpenAPI
- Colección Bruno para pruebas manuales

---

## Stack tecnológico

- Backend: Go (API REST)
- Base de datos: PostgreSQL (Supabase)
- Autenticación: Supabase Auth (JWT + JWKS)
- Router HTTP: chi
- Storage: Supabase Storage
- Documentación API: OpenAPI (Swagger UI)
- Testing manual: Bruno
- Infraestructura local: Docker + Supabase CLI (vía npx)

---

## Requisitos

- Node.js: https://nodejs.org
- Docker Desktop: https://www.docker.com/products/docker-desktop/
- Go (>= 1.22): https://go.dev/
- Supabase CLI: https://supabase.com/docs/guides/local-development/cli/getting-started?queryGroups=platform&platform=npm&queryGroups=access-method&access-method=studio

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

Crear un archivo `.env` a partir de `.env.example`.

Algunas variables cambian según ejecutes la API dentro de Docker o directamente en tu máquina.

Ejemplo importante (dependiendo de cómo ejecutes la API):

```env
# Para ejecución en Docker
DATABASE_URL=postgresql://postgres:postgres@host.docker.internal:54322/postgres?sslmode=disable

# Si ejecutas la API con go run
# DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres?sslmode=disable
```

### 4. Levantar la API

Opción recomendada (Docker):

```bash
docker compose up --build -d
```

Opción alternativa:

```bash
cd apps/api
go run ./cmd/api
```

### 5. (Opcional) Sincronizar dependencias

```bash
cd apps/api
go mod tidy
```

---

## Uso de la API en desarrollo

Colección Bruno:

```text
docs/bruno
```

### Flujo básico

1. Sign Up (`/auth/v1/signup`)
2. Login (`/auth/v1/token`)
3. El `access_token` se guarda automáticamente
4. Uso de endpoints (`/profile`, `/files`)

### Variables

Definidas en:

```text
docs/bruno/environments/local.bru
```

| Variable           | Descripción                                      | Ejemplo                                      |
|--------------------|--------------------------------------------------|----------------------------------------------|
| api_base_url       | URL base de la API                               | http://localhost:8081/api/v1                 |
| auth_base_url      | URL base de Supabase Auth                        | http://localhost:54321/auth/v1               |
| supabase_anon_key  | Clave pública de Supabase                        | sb_publishable_xxxxxxxxxxxxxxxxx             |
| access_token       | JWT de autenticación                             | eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...      |
| file_id            | ID de archivo para endpoints de files            | 76661000-7cf1-4bdb-9a59-66b80b17209f         |


---

## Documentación de la API

- OpenAPI: `docs/api/openapi.yaml`
- Swagger UI: http://localhost:8082

---

## Servicios disponibles

- API: http://localhost:8081
- Health: http://localhost:8081/api/v1/health
- Health DB: http://localhost:8081/api/v1/health/db
- Swagger: http://localhost:8082
- Supabase Studio: http://127.0.0.1:54323

---

## Arquitectura

Arquitectura modular basada en hexagonal ligera.

Cada módulo sigue esta estructura:

- domain
- application
- infrastructure
- delivery

Supabase se usa como infraestructura.

---

## Estructura

```text
apps/
  api/
    internal/
      <modulo>/
        domain/
        application/
        infrastructure/
        delivery/

docs/
  api/
  bruno/

supabase/
```

---

## Filosofía del proyecto

- Arquitectura modular y desacoplada
- Separación clara entre dominio, aplicación, infraestructura y delivery
- Independencia de frameworks y servicios externos
- Diseño orientado a escalabilidad y mantenibilidad
