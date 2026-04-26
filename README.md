# Descripción general

Aplicación web en desarrollo orientada a la gestión estructurada de contenido personal.

Actualmente el proyecto se centra en la construcción de una base sólida a nivel de backend, incluyendo API, autenticación, base de datos y arquitectura.

El objetivo es evolucionar esta base hacia una herramienta que permita crear, organizar y gestionar información de forma estructurada en un único espacio.


## Estado del proyecto

- Estructura base del proyecto creada
- Supabase configurado en entorno local
- Conexión a PostgreSQL implementada
- API en Go operativa
- Endpoints de health disponibles
- Autenticación basada en JWT (Supabase Auth + JWKS)
- Perfil de usuario (`user_profiles`) sincronizado con `auth.users`
- Endpoint `/profile` protegido por autenticación
- Documentación de la API mediante OpenAPI (Swagger UI)

El proyecto se encuentra en fase inicial de desarrollo.


## Tecnologías

- Backend: Go (API REST)
- Base de datos: PostgreSQL (Supabase)
- Autenticación: Supabase Auth (JWT + JWKS)
- Router HTTP: chi
- Middleware HTTP: CORS configurable
- Infraestructura local: Docker + Supabase CLI


## Requisitos

Antes de comenzar, asegúrate de tener instalado:

- Node.js: https://nodejs.org
- Docker Desktop: https://www.docker.com/products/docker-desktop/
- Supabase CLI


## Instalación y ejecución en local

1. Clonar el repositorio:

```bash
git clone <url-del-repositorio>
cd scrybe-app
```

2. Levantar Supabase:

```bash
npx supabase start
```

3. Configurar variables de entorno:

Crear un archivo `.env` a partir de `.env.example`.

4. Levantar la API:

```bash
docker compose up --build -d
```

O alternativamente:

```bash
go run ./apps/api/cmd/api
```


## Flujo de autenticación

El proyecto utiliza Supabase Auth como proveedor de identidad.

- Registro y login se realizan contra Supabase
- La API valida los JWT mediante claves públicas (JWKS)
- Los endpoints protegidos requieren:

```http
Authorization: Bearer <access_token>
```

Al crear un usuario, un trigger en la base de datos crea automáticamente su perfil en `user_profiles`.


## Servicios disponibles

- API: `http://localhost:8081`
- Health: `http://localhost:8081/api/v1/health`
- Health DB: `http://localhost:8081/api/v1/health/db`
- Profile: `http://localhost:8081/api/v1/profile`
- Swagger: `http://localhost:8082`
- Supabase Studio: `http://127.0.0.1:54323`


## Estructura del proyecto

- `internal/platform`: infraestructura
- `internal/<modulo>`:
  - `domain`
  - `application`
  - `infrastructure`
  - `delivery`
- `cmd`: entrypoint


## Notas

- Supabase se usa como infraestructura
- La API valida JWT vía JWKS
- Se prioriza una base sólida antes de añadir funcionalidades
