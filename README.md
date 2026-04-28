# Scrybe

## Descripción general

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
- Endpoint `GET /profile` protegido por autenticación
- Endpoint `PATCH /profile` para actualización de perfil
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


## Uso de la API en desarrollo

Para probar los endpoints en local se incluye una colección para Bruno en:

```txt
docs/bruno
```

### Flujo básico

1. Sign Up (`/auth/v1/signup`)
2. Login (`/auth/v1/token`)
3. El token se guarda automáticamente en la variable `access_token`
4. Usar endpoints protegidos de la API, como `/profile`

### Variables necesarias

Definidas en:

```txt
docs/bruno/environments/local.bru
```

Variables actuales:

- `api_base_url`
- `auth_base_url`
- `supabase_anon_key`
- `access_token`

### Nota

- La documentación oficial de la API está en OpenAPI (`docs/api/openapi.yaml`)
- La colección Bruno es solo una ayuda para desarrollo local


## Servicios disponibles

- API: `http://localhost:8081`
- Health: `http://localhost:8081/api/v1/health`
- Health DB: `http://localhost:8081/api/v1/health/db`
- Profile: `http://localhost:8081/api/v1/profile`
- Swagger: `http://localhost:8082`
- Supabase Studio: `http://127.0.0.1:54323`


## Estructura del proyecto

```txt
apps/
  api/
    cmd/
    internal/
      platform/
      <modulo>/
        domain/
        application/
        infrastructure/
        delivery/
  web/

docs/
  api/
    openapi.yaml
  bruno/

supabase/
  migrations/
```


## Arquitectura

El backend sigue una arquitectura modular y desacoplada, inspirada en una arquitectura hexagonal ligera.

Cada módulo puede organizarse en:

- `domain`: entidades, errores y contratos del dominio
- `application`: casos de uso y reglas de aplicación
- `infrastructure`: implementaciones concretas, como PostgreSQL
- `delivery`: entrada HTTP u otros mecanismos de entrega

Supabase se usa como infraestructura, no como sustituto de la lógica de negocio de la aplicación.


## Notas

- Supabase se usa como proveedor inicial de Auth, PostgreSQL y Storage
- La API valida JWT mediante JWKS
- Los datos propios de la aplicación se gestionan desde la API
- Se prioriza una base sólida antes de añadir funcionalidades
- OpenAPI debe mantenerse alineado con la implementación
