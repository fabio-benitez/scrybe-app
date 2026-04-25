# Descripción general

Aplicación web en desarrollo orientada a la gestión estructurada de contenido personal.

Actualmente el proyecto se centra en la construcción de una base sólida a nivel de backend, incluyendo la configuración de la API, la conexión a base de datos y la estructura inicial de la aplicación.

El objetivo es evolucionar esta base hacia una herramienta que permita crear, organizar y gestionar información de forma estructurada en un único espacio.


## Estado del proyecto

- Estructura base del proyecto creada
- Supabase configurado en entorno local
- Conexión a PostgreSQL implementada
- API en Go operativa
- Endpoints de health disponibles
- Integración inicial con base de datos
- Documentación de la API mediante OpenAPI (Swagger UI)

El proyecto se encuentra en fase inicial de desarrollo.


## Tecnologías

- Backend: Go (API REST)
- Base de datos: PostgreSQL (Supabase)
- Router HTTP: chi
- Middleware HTTP: CORS configurable
- Infraestructura local: Docker + Supabase CLI

**Nota:** El stack tecnológico podrá ajustarse durante el desarrollo en función de las necesidades del proyecto.


## Requisitos

Antes de comenzar, asegúrate de tener instalado:

- Node.js: https://nodejs.org  
- Docker Desktop: https://www.docker.com/products/docker-desktop/  
- Supabase CLI (vía npx o instalación local)

Guía oficial de Supabase CLI:  
https://supabase.com/docs/guides/local-development/cli/getting-started


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

Crear un archivo `.env` a partir de `.env.example` y completar los valores necesarios.

4. Levantar la API:

```bash
docker compose up --build -d
```

O alternativamente:

```bash
go run ./apps/api/cmd/api
```


## Servicios disponibles

- API (base):  
  http://localhost:8081

- API Health:  
  http://localhost:8081/api/v1/health

- API Health (DB):  
  http://localhost:8081/api/v1/health/db

- Swagger UI:  
  http://localhost:8082

- Supabase Studio:  
  http://127.0.0.1:54323


## Variables de entorno

Consultar `.env.example` para ver las variables necesarias.

Principales grupos:

- API
- Database
- Auth
- Storage
- CORS


## Estructura del proyecto

El backend está organizado siguiendo una arquitectura modular:

- `internal/platform`: infraestructura compartida (base de datos, servicios externos)
- `internal/<modulo>`: módulos de dominio (domain, application, infrastructure, delivery)
- `cmd`: puntos de entrada de la aplicación

La estructura está diseñada para permitir escalabilidad sin acoplamiento fuerte entre capas.


## Notas

El proyecto está diseñado como base para evolucionar progresivamente hacia una aplicación completa de gestión de contenido.

Se prioriza una arquitectura sólida antes de añadir nuevas funcionalidades.
